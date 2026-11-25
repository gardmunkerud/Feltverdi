/* Feltverdi valuation engine – simplified after-tax DCF per field on the Norwegian Continental Shelf.
 * Real terms (USD, base year = startYear), mid-year discounting. Works in the browser (window.FVValuation) and in Node.
 *
 * Model (all figures gross for 100% of the field; owners' values are their share of the gross value):
 *  - Production: starts at last full year's production and declines exponentially. The decline rate is fitted so that
 *    cumulative production until the economic limit equals Sodir's remaining reserves (unless the user overrides it).
 *    New fields (first production in the last two years) and approved fields get a 3-year plateau first.
 *  - Price: product mix of the remaining reserves. Oil/condensate = Brent − $1; NGL = 60 % of Brent;
 *    gas = €/MWh × 1.72 MWh/boe × EURUSD.
 *  - Opex: 60 % fixed (based on the starting/plateau rate) + 40 % variable, so unit cost rises as the field declines.
 *  - Capex: the field's own investment intensity (last 3 reported years, NOK → USD) per boe, clamped to $2–12/boe.
 *  - Tax (2022 rules): 22 % corporate tax (capex depreciated over 6 years) + 71.8 % special tax (capex expensed
 *    immediately, corporate tax deductible) ≈ 78 % marginal. Losses are assumed usable (owner pays tax elsewhere).
 *  - Decommissioning: $/boe × original recoverable volume, two years after shut-down, 78 % tax-deductible.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FVValuation = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const BOE_PER_SM3 = 6.29;
  const MWH_PER_BOE_GAS = 1.72; // 159 Sm3 gas × ~10.8 kWh/Sm3 (GCV)
  const CIT = 0.22, SPT = 0.718, MARGINAL = 0.78;

  const DEFAULTS = {
    brent: 75,        // USD/bbl, real
    gasEur: 35,       // EUR/MWh (TTF/NBP-type), real
    eurusd: 1.15,
    usdnok: 10.0,
    discount: 0.08,   // real, after tax
    startYear: 2026,
    decomPerBoe: 1.0, // USD per boe of original recoverable volume (gross)
  };

  // Default opex (USD/boe at the starting rate) by hydrocarbon type
  const OPEX_BY_TYPE = { OIL: 12, 'OIL/GAS': 11, 'OIL/CONDENSATE': 11, GAS: 7, 'GAS/CONDENSATE': 8 };

  function mix(field) {
    const r = field.rem || { oil: 0, gas: 0, ngl: 0, cond: 0, oe: 0 };
    const liquids = Math.max(0, r.oil + r.cond);
    const gas = Math.max(0, r.gas);
    const ngl = Math.max(0, r.oe - liquids - gas); // NGL is reported in tonnes; use the oe balance instead
    const tot = liquids + gas + ngl;
    if (tot <= 0) return { liquids: 1, gas: 0, ngl: 0 };
    return { liquids: liquids / tot, gas: gas / tot, ngl: ngl / tot };
  }

  function prices(a) {
    return { oil: a.brent - 1, ngl: 0.6 * a.brent, gas: a.gasEur * MWH_PER_BOE_GAS * a.eurusd };
  }

  function realisedPrice(field, a) {
    const m = mix(field), p = prices(a);
    return m.liquids * p.oil + m.ngl * p.ngl + m.gas * p.gas;
  }

  function lastProduction(field, lastFullYear) {
    const row = field.prod.find((p) => p[0] === lastFullYear);
    return row ? row[5] * BOE_PER_SM3 : 0; // MMboe/yr
  }

  function firstProductionYear(field) {
    const row = field.prod.find((p) => p[5] > 0);
    return row ? row[0] : null;
  }

  function capexIntensity(field, a, lastFullYear) {
    const inv = field.inv.slice(-3);
    let usd = 0, boe = 0;
    for (const [y, mnok] of inv) {
      usd += mnok / a.usdnok;
      const p = field.prod.find((r) => r[0] === y);
      boe += p ? p[5] * BOE_PER_SM3 : 0;
    }
    if (boe <= 0.05 || !inv.length) return 6;
    const first = firstProductionYear(field);
    if (first && first >= lastFullYear - 2) return 6; // ramping fields: historical capex is development, not sustaining
    return Math.min(12, Math.max(2, usd / boe));
  }

  // Classifies how the forecast should start
  function setup(field, a, lastFullYear, ov = {}) {
    const remBoe = field.rem ? field.rem.oe * BOE_PER_SM3 : 0;
    const recBoe = field.rec ? field.rec.oe * BOE_PER_SM3 : 0;
    const q0 = lastProduction(field, lastFullYear);
    const first = firstProductionYear(field);
    let kind = 'decline', startIndex = 0, plateau = 0, plateauYears = 0, plateauSource = null;
    if (field.status === 'Shut down' || remBoe <= 0.05) kind = 'none';
    else if (field.status === 'Approved for production' || q0 <= 0) { kind = 'new'; startIndex = 1; plateau = remBoe / 9; plateauYears = 3; }
    else if (first && first >= lastFullYear - 1) { kind = 'ramp'; plateau = Math.max(q0, remBoe / 9); plateauYears = 3; }
    else if ((field.outlook && field.outlook.plateau === 'plateau') || ov.plateauYears > 0) {
      // Plateau: hold the typical recent rate (median of the last three years), then decline at a normal tail rate.
      const recent = [lastFullYear - 2, lastFullYear - 1, lastFullYear].map((y) => { const p = field.prod.find((r) => r[0] === y); return p ? p[5] * BOE_PER_SM3 : 0; }).sort((x, y) => x - y);
      plateau = recent[1] > 0 ? recent[1] : q0;
      const tail = /^GAS/.test(field.hc) ? 0.10 : 0.12;
      plateauYears = Math.round((remBoe - plateau * (1 - tail) / tail) / plateau);
      plateauYears = Math.min(25, Math.max(1, plateauYears));
      kind = 'plateau'; plateauSource = field.outlook && field.outlook.plateau === 'plateau' ? field.outlook.basis : 'user';
    }
    if (ov.plateauYears != null && (kind === 'plateau' || kind === 'decline')) {
      if (ov.plateauYears <= 0) { kind = 'decline'; plateauYears = 0; }
      else { if (kind === 'decline') { plateau = q0; kind = 'plateau'; plateauSource = 'user'; } plateauYears = Math.round(ov.plateauYears); }
    }
    const opexBoe = ov.opexBoe ?? OPEX_BY_TYPE[field.hc] ?? 10;
    const capexBoe = ov.capexBoe ?? capexIntensity(field, a, lastFullYear);
    const refRate = kind === 'decline' ? q0 : plateau;
    return { remBoe, recBoe, q0, kind, startIndex, plateau, plateauYears, plateauSource, opexBoe, capexBoe, refRate, devCapex: kind === 'new' ? 6 * remBoe : 0, decomPerBoe: ov.decomPerBoe };
  }

  function simulate(field, a, s, d, record) {
    const price = realisedPrice(field, a);
    const fixed = 0.6 * s.opexBoe * s.refRate, varc = 0.4 * s.opexBoe;
    const horizon = 45;
    const years = [];
    let q = 0, cum = 0, npv = 0, taxPv = 0, last = -1, dep = [];
    const plateauYears = s.plateauYears || 0;
    for (let i = 0; i < horizon; i++) {
      const y = a.startYear + i;
      let capex = 0;
      if (s.kind === 'new' && i < s.startIndex) {
        q = 0; capex = s.devCapex;
      } else {
        const k = i - s.startIndex;
        if (s.kind === 'decline') q = s.q0 * Math.pow(1 - d, k + 1);
        else q = k < plateauYears ? s.plateau : s.plateau * Math.pow(1 - d, k - plateauYears + 1);
      }
      const rev = q * price;
      const opex = q > 0 ? fixed + varc * q : 0;
      if (q > 0) capex = s.capexBoe * q;
      if (q > 0 && rev - opex - 0.3 * capex <= 0) break; // economic limit
      dep.push(capex);
      const depr = dep.slice(-6).reduce((x, v) => x + v, 0) / 6;
      const cit = CIT * (rev - opex - depr);
      const spt = SPT * (rev - opex - capex - cit);
      const tax = cit + spt;
      const fcf = rev - opex - capex - tax;
      const df = Math.pow(1 + a.discount, -(i + 0.5));
      npv += fcf * df; taxPv += tax * df; cum += q; last = i;
      if (record) years.push({ year: y, q, rev, opex, capex, tax, fcf, df, pv: fcf * df });
    }
    const decom = (s.decomPerBoe ?? a.decomPerBoe) * s.recBoe;
    const decomYear = last + 2;
    const decomDf = Math.pow(1 + a.discount, -(decomYear + 0.5));
    const decomPv = decom * (1 - MARGINAL) * decomDf;
    npv -= decomPv; taxPv -= decom * MARGINAL * decomDf;
    if (record && decom > 0) years.push({ year: a.startYear + decomYear, q: 0, rev: 0, opex: 0, capex: 0, decom, tax: -decom * MARGINAL, fcf: -decom * (1 - MARGINAL), df: decomDf, pv: -decomPv });
    return { cum, npv, taxPv, endYear: last >= 0 ? a.startYear + last : null, years, price };
  }

  /**
   * Values one field (100 % gross). Returns USD millions (real).
   * ov: optional overrides { opexBoe, capexBoe, decline }
   */
  function valueField(field, assumptions = {}, lastFullYear, ov = {}) {
    const a = { ...DEFAULTS, ...assumptions };
    const s = setup(field, a, lastFullYear, ov);
    const price = realisedPrice(field, a);
    const base = { field: field.slug, kind: s.kind, price, mix: mix(field), remBoe: s.remBoe, q0: s.q0, opexBoe: s.opexBoe, capexBoe: s.capexBoe,
      plateauYears: s.plateauYears, plateauRate: s.plateau, plateauSource: s.plateauSource,
      plateauEnd: s.plateauYears ? a.startYear + s.startIndex + s.plateauYears - 1 : null };
    if (s.kind === 'none') return { ...base, npv: 0, taxPv: 0, grossValue: 0, decline: 0, endYear: null, cum: 0, years: [] };
    let d = ov.decline;
    if (d == null) {
      let lo = 0.002, hi = 0.7;
      if (simulate(field, a, s, lo, false).cum < s.remBoe) d = lo; // even the slowest decline cannot produce it all economically
      else {
        for (let k = 0; k < 50; k++) {
          const m = (lo + hi) / 2;
          if (simulate(field, a, s, m, false).cum > s.remBoe) lo = m; else hi = m;
        }
        d = (lo + hi) / 2;
      }
    }
    const r = simulate(field, a, s, d, true);
    return { ...base, npv: r.npv, taxPv: r.taxPv, grossValue: s.remBoe * price, decline: d, endYear: r.endYear, cum: r.cum, years: r.years };
  }

  function valueAll(fields, assumptions, lastFullYear, overrides = {}) {
    const out = new Map();
    for (const f of fields) out.set(f.slug, valueField(f, assumptions, lastFullYear, overrides[f.slug] || {}));
    return out;
  }

  /** Aggregates a company's share of all its fields. */
  function valueCompany(company, fields, valuations) {
    const rows = [];
    for (const f of fields) {
      const own = f.owners.find((o) => o[0] === company);
      if (!own) continue;
      const v = valuations.get(f.slug);
      const s = own[1] / 100;
      rows.push({ field: f, share: own[1], npv: v.npv * s, remBoe: v.remBoe * s, q0: v.q0 * s, operator: f.operator === company, v });
    }
    rows.sort((x, y) => y.npv - x.npv);
    const sum = (k) => rows.reduce((t, r) => t + r[k], 0);
    return { company, rows, npv: sum('npv'), remBoe: sum('remBoe'), q0: sum('q0'), operated: rows.filter((r) => r.operator).length };
  }

  function companies(fields) {
    const m = new Map();
    for (const f of fields) for (const [c] of f.owners) m.set(c, (m.get(c) || 0) + 1);
    return [...m.entries()].map(([name, n]) => ({ name, fields: n })).sort((a, b) => a.name.localeCompare(b.name, 'nb'));
  }

  return { DEFAULTS, OPEX_BY_TYPE, BOE_PER_SM3, valueField, valueAll, valueCompany, companies, realisedPrice, prices, mix };
});
