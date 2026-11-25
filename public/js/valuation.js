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

  /**
   * Whole-life ("original") value of a field: actual history (Sodir production and investments, historical prices,
   * exchange rates and US CPI) plus the model forecast. Everything in real USD of H.cpiBaseYear.
   * H = history.json: { prices: [[y, brent, gasEuropeUsdMmbtu]], usdnok: [[y, rate]], cpi: [[y, index]], cpiBaseYear }
   * Simplifications: historical opex from the same $/boe model as the forecast; tax as a 78 % cash-flow tax every year.
   */
  const MMBTU_PER_BOE_GAS = 5.87;
  function valueHistory(field, H, assumptions = {}, lastFullYear, ov = {}) {
    const a = { ...DEFAULTS, ...assumptions };
    const price = new Map(H.prices.map(([y, b, g]) => [y, { b, g }]));
    const fx = new Map(H.usdnok), cpi = new Map(H.cpi);
    const cpiNow = cpi.get(H.cpiBaseYear);
    const realF = (y) => cpiNow / (cpi.get(y) || cpi.get(Math.min(...cpi.keys())));
    const prodY = new Map(field.prod.map((r) => [r[0], r]));
    const invY = new Map(field.inv);
    const histYears = [...new Set([...prodY.keys(), ...invY.keys()])].filter((y) => y <= lastFullYear).sort((x, y) => x - y);
    const fut = valueField(field, a, lastFullYear, ov);
    if (!histYears.length && !fut.years.length) return null;
    const opexBoe = ov.opexBoe ?? OPEX_BY_TYPE[field.hc] ?? 10;
    const top = field.prod.map((r) => r[5] * BOE_PER_SM3).sort((x, y) => y - x).slice(0, 3);
    const peak = top.length ? top.reduce((s, x) => s + x, 0) / top.length : 0;
    const rows = [];
    for (const y of histYears) {
      const p = prodY.get(y), pr = price.get(y), rf = realF(y);
      const q = p ? p[5] * BOE_PER_SM3 : 0;
      const revNom = p && pr ? (p[1] + p[4]) * BOE_PER_SM3 * (pr.b - 1) + p[3] * BOE_PER_SM3 * 0.6 * pr.b + p[2] * BOE_PER_SM3 * pr.g * MMBTU_PER_BOE_GAS : 0;
      const rev = revNom * rf;
      const capex = (invY.get(y) || 0) / (fx.get(y) || a.usdnok) * rf;
      const opex = q > 0 ? 0.6 * opexBoe * peak + 0.4 * opexBoe * q : 0;
      const pre = rev - opex - capex, tax = MARGINAL * pre;
      rows.push({ year: y, hist: true, q, rev, opex, capex, pre, tax, post: pre - tax, brentReal: pr ? pr.b * rf : null });
    }
    for (const r of fut.years) {
      const pre = r.rev - r.opex - r.capex - (r.decom || 0);
      rows.push({ year: r.year, hist: false, q: r.q, rev: r.rev, opex: r.opex, capex: r.capex + (r.decom || 0), pre, tax: r.tax, post: r.fcf });
    }
    rows.sort((x, y) => x.year - y.year);
    const y0 = rows[0].year;
    const sum = (k, f = () => true) => rows.filter(f).reduce((s, r) => s + r[k], 0);
    const npvAt = (k, rate) => rows.reduce((s, r) => s + r[k] * Math.pow(1 + rate, -(r.year - y0 + 0.5)), 0);
    // real pre-tax IRR (only defined if cash flows change sign)
    let irr = null;
    if (rows.some((r) => r.pre < 0) && rows.some((r) => r.pre > 0)) {
      // search non-negative rates only: at negative rates the end-of-life decommissioning outflow dominates
      let lo = 0, hi = 3;
      const f = (x) => rows.reduce((s, r) => s + r.pre * Math.pow(1 + x, -(r.year - y0 + 0.5)), 0);
      if (f(lo) <= 0) irr = -1; // lifetime value not positive: IRR below zero
      else if (f(hi) >= 0) irr = hi; // above the search range (shown as "> 300 %")
      else { for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } irr = (lo + hi) / 2; }
    }
    const firstProd = (field.prod.find((r) => r[5] > 0) || [])[0] || (fut.years.find((r) => r.q > 0) || {}).year || null;
    return {
      field: field.slug, startYear: y0, firstProd, endYear: fut.endYear || (histYears.length ? histYears[histYears.length - 1] : null), baseYear: H.cpiBaseYear,
      prodTotal: sum('q'), prodHist: sum('q', (r) => r.hist),
      rev: sum('rev'), opex: sum('opex'), capex: sum('capex'), capexHist: sum('capex', (r) => r.hist),
      pre: sum('pre'), preHist: sum('pre', (r) => r.hist), tax: sum('tax'), post: sum('post'),
      npvPre: npvAt('pre', a.discount), npvPost: npvAt('post', a.discount), irr, rows,
    };
  }

  function companies(fields) {
    const m = new Map();
    for (const f of fields) for (const [c] of f.owners) m.set(c, (m.get(c) || 0) + 1);
    return [...m.entries()].map(([name, n]) => ({ name, fields: n })).sort((a, b) => a.name.localeCompare(b.name, 'nb'));
  }

  return { DEFAULTS, OPEX_BY_TYPE, BOE_PER_SM3, valueField, valueAll, valueCompany, valueHistory, companies, realisedPrice, prices, mix };
});
