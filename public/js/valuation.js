/* Feltverdi valuation engine – simplified after-tax DCF per field on the Norwegian Continental Shelf.
 * Real terms (USD, base year = startYear), mid-year discounting. Works in the browser (window.FVValuation) and in Node.
 *
 * Model (all figures gross for 100% of the field; owners' values are their share of the gross value):
 *  - Production: starts at last full year's production and declines exponentially. The decline rate follows the
 *    field's own observed decline over the last five years, bounded by Sodir's remaining reserves (never faster than
 *    producing exactly those) and by reserves × reserveGrowth (never slower). See valueField() for details.
 *    New fields (first production in the last two years) and approved fields get a 3-year plateau first.
 *  - Price: product mix of the remaining reserves. Oil/condensate = Brent − $1; NGL = 60 % of Brent;
 *    gas = €/MWh × 1.72 MWh/boe × EURUSD − USD 2/boe transport tariff (Gassco).
 *  - Opex: 60 % fixed (based on the starting/plateau rate) + 40 % variable, so unit cost rises as the field declines.
 *  - Capex: Sodir's expected future investments per field, spread over expected production ($1–20/boe); without a Sodir
 *    figure, the field's own investment intensity (last 3 reported years, NOK → USD) per boe, clamped to $2–12/boe.
 *  - Tax (2022 rules): 22 % corporate tax (capex depreciated over 6 years) + 71.8 % special tax (capex expensed
 *    immediately plus uplift, corporate tax deductible) ≈ 78 % marginal. Losses are assumed usable (owner pays tax elsewhere).
 *    Deductions from past investments that are not yet used (depreciation, uplift) follow the field and are counted,
 *    with the rules that applied in the year of each investment – see investmentDeductions().
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
  // Gas is sold at European hubs; NCS gas pays Gassco transport tariffs to get there (about NOK 0.10–0.15 per Sm³,
  // ≈ USD 2 per boe). Company production costs (which the opex is calibrated to) exclude transport, so it is deducted here.
  const GAS_TARIFF = 2.0; // USD per boe

  const DEFAULTS = {
    brent: 75,        // USD/bbl, real
    gasEur: 35,       // EUR/MWh (TTF/NBP-type), real
    eurusd: 1.15,
    usdnok: 10.0,
    discount: 0.08,   // real, after tax
    startYear: 2026,
    decomPerBoe: 1.0, // USD per boe of original recoverable volume (gross)
    reserveGrowth: 1.6, // cap on implied growth of Sodir's remaining reserves (1.0 = use Sodir's reserves as they are)
  };

  // Fallback opex (USD/boe at the starting rate) by hydrocarbon type – used only for fields without a facility profile
  const OPEX_BY_TYPE = { OIL: 12, 'OIL/GAS': 11, 'OIL/CONDENSATE': 11, GAS: 7, 'GAS/CONDENSATE': 8 };

  // Field-specific operating cost from the field's facilities (Sodir facility register and development wells).
  // Annual fixed cost (USD million per year) per facility in service, plus a cost per open well, plus a variable cost per boe;
  // tie-backs (no surface facility of their own) pay a processing tariff per boe to the host instead of running a platform.
  // Calibrated (2026-11-27) so that companies' share-weighted 2025 unit costs match their reported production cost:
  // Aker BP 7.3, Vår Energi 11.1, OKEA ~25, DNO North Sea ~12 USD/boe, and Johan Sverdrup < 2 USD/boe (Equinor).
  const OPEX_FAC = {
    gbs: 60, steelLarge: 40, steelSmall: 14, floater: 52, onshore: 100, template: 1, // USD million per year per facility
    perWell: 2.5,    // USD million per year per open well (integrity, intervention)
    variable: 0.5,   // USD per boe (chemicals, energy, CO2 tax share)
    tieback: 4,      // USD per boe processing tariff paid to the host
  };
  // Decommissioning from the same profile (USD million, real): plugging each open well + removing each facility.
  // Plugging: Sodir gives "just under NOK 50 million to several hundred million" per well; UK averages are about
  // £3 million per platform well and £15 million per subsea production well. Removal costs are rounded industry
  // levels; concrete gravity-based substructures (Condeep) are normally left in place, so only the topside is counted.
  const DECOM_FAC = { gbs: 300, steelLarge: 250, steelSmall: 80, floater: 120, onshore: 0, template: 8, wellPlatform: 6, wellSubsea: 18 };

  function facilityOpex(field) {
    const p = field.fac;
    if (!p) return null;
    const o = p.own, F = OPEX_FAC;
    const fixed = F.gbs * o.gbs + F.steelLarge * o.steelLarge + F.steelSmall * o.steelSmall + F.floater * o.floater + F.onshore * (o.onshore || 0)
      + F.template * o.template + F.perWell * (p.wells.platform + p.wells.subsea);
    return { fixed, variable: F.variable + (p.tieback ? F.tieback : 0) };
  }
  function facilityDecom(field) {
    const p = field.fac;
    if (!p) return null;
    const o = p.own, D = DECOM_FAC;
    return D.gbs * o.gbs + D.steelLarge * o.steelLarge + D.steelSmall * o.steelSmall + D.floater * o.floater + D.onshore * (o.onshore || 0)
      + D.template * o.template + D.wellPlatform * p.wells.platform + D.wellSubsea * p.wells.subsea;
  }

  // ----- Petroleum tax deductions from investments (Norway) -----
  // Before 2022: corporate tax (28 % → 22 %) and special tax (78 % minus the corporate rate) on the same base; investments
  // depreciated over 6 years from the year they are made, plus uplift (friinntekt) in the special-tax base over 4 years
  // (30 % until 2012, 22 % 2013–15, then 21.6/21.2/20.8 %). Temporary package: investments made in 2020–21 are expensed
  // immediately in the special-tax base with 24 % uplift; fields with a development plan approved 2020–23 get 17.69 %
  // uplift on investments until production starts. From 2022: special tax is a cash-flow tax (71.8 %, investments expensed
  // immediately, 12.4 % uplift) and corporate tax is deductible in it, so a corporate-tax deduction is worth
  // 22 % × (1 − 71.8 %) ≈ 6.2 % and a special-tax deduction 71.8 %. In every year the two together are worth 78 %.
  const INFLATION = 0.02; // turns future nominal NOK deductions into real terms
  function citRate(y) { return y <= 2013 ? 0.28 : y <= 2015 ? 0.27 : y === 2016 ? 0.25 : y === 2017 ? 0.24 : y === 2018 ? 0.23 : 0.22; }
  function deductionWorth(y) { return y >= 2022 ? { cit: CIT * (1 - SPT), spt: SPT } : { cit: citRate(y), spt: MARGINAL - citRate(y) }; }
  const UPLIFT = { perm: 0.124, temp: 0.1769, y2020: 0.24 };
  const tempPackage = (field) => field.approved >= 2020 && field.approved <= 2023;
  // Deductions from an investment I made in year y: [[year, corporate-tax deduction, special-tax deduction], …] (same unit as I)
  function investmentDeductions(field, y, I, firstProd) {
    const out = [];
    for (let k = 0; k < 6; k++) out.push([y + k, I / 6, 0]);
    if (y >= 2020) {
      const up = y < 2022 ? UPLIFT.y2020 : tempPackage(field) && (firstProd == null || y <= firstProd) ? UPLIFT.temp : UPLIFT.perm;
      out[0][2] += I * (1 + up);
    } else {
      const up = y <= 2012 ? 0.30 : y <= 2015 ? 0.22 : y === 2016 ? 0.216 : y === 2017 ? 0.212 : 0.208;
      for (let k = 0; k < 6; k++) out[k][2] += I / 6;
      for (let k = 0; k < 4; k++) out[k][2] += I * up / 4;
    }
    return out;
  }
  // All deductions from the field's reported investments (nominal NOK million), by tax year; keep(y) filters investment years
  function deductionSchedule(field, keep = () => true) {
    const fp = firstProductionYear(field);
    const m = new Map();
    for (const [y, I] of field.inv) {
      if (!I || !keep(y)) continue;
      for (const [t, c, sp] of investmentDeductions(field, y, I, fp)) { const o = m.get(t) || { cit: 0, spt: 0 }; o.cit += c; o.spt += sp; m.set(t, o); }
    }
    return m;
  }
  // Tax saved in year t by the deductions in a schedule (nominal NOK million)
  function taxSaving(sched, t) { const d = sched.get(t); if (!d) return 0; const w = deductionWorth(t); return d.cit * w.cit + d.spt * w.spt; }

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
    return { oil: a.brent - 1, ngl: 0.6 * a.brent, gas: Math.max(0, a.gasEur * MWH_PER_BOE_GAS * a.eurusd - GAS_TARIFF) };
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

  const CAPEX_MIN = 1, CAPEX_MAX = 20; // USD/boe bounds on the Sodir-based capex intensity
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
  // growth: reserve-growth multiplier applied to Sodir's remaining reserves for fields without a usable decline history
  function setup(field, a, lastFullYear, ov = {}, growth = 1) {
    const remSodir = (field.rem ? field.rem.oe * BOE_PER_SM3 : 0) + (ov.remAdd || 0);
    let remBoe = remSodir;
    const recBoe = field.rec ? field.rec.oe * BOE_PER_SM3 : 0;
    const q0 = lastProduction(field, lastFullYear);
    const first = firstProductionYear(field);
    let kind = 'decline', startIndex = 0, plateau = 0, plateauYears = 0, plateauSource = null;
    if (field.status === 'Shut down' || remBoe <= 0.05) kind = 'none';
    else if (field.status === 'Approved for production' || q0 <= 0 || (first && first >= lastFullYear - 1) || (field.outlook && field.outlook.plateau === 'plateau') || ov.plateauYears > 0) remBoe = remSodir * growth;
    if (kind === 'none') { /* nothing */ }
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
      if (ov.plateauYears <= 0) { kind = 'decline'; plateauYears = 0; remBoe = remSodir; }
      else { if (kind === 'decline') { plateau = q0; kind = 'plateau'; plateauSource = 'user'; } plateauYears = Math.round(ov.plateauYears); }
    }
    // Future capex: Sodir's expected future investments for the field (operators' own plans, fixed NOK), spread over the
    // production the model expects (Sodir reserves × the middle of the reserve-growth range), so total capex ≈ Sodir's
    // figure. New fields spend 80 % before first production and 20 % as drilling/maintenance during production.
    // Without a Sodir figure: the field's recent investment intensity (or $6/boe for new fields).
    const exp = field.invExp && remSodir > 0.5 ? Math.max(0, field.invExp.mnok) / a.usdnok : null; // USD million, real
    const prodBase = remSodir * Math.max(1, growth);
    const isNew = field.status === 'Approved for production' || q0 <= 0;
    const capexSodir = exp != null ? Math.min(CAPEX_MAX, Math.max(CAPEX_MIN, (isNew ? 0.2 : 1) * exp / prodBase)) : null;
    const capexBoe = ov.capexBoe ?? capexSodir ?? capexIntensity(field, a, lastFullYear);
    const capexBasis = ov.capexBoe != null ? 'user' : capexSodir != null ? 'sodir' : 'history';
    const refRate = kind === 'decline' ? q0 : plateau;
    // Opex: from the field's facilities when known (and not overridden by the user), otherwise by hydrocarbon type.
    const fo = ov.opexBoe == null ? facilityOpex(field) : null;
    let fixedOpex, varOpex, opexBoe, opexBasis;
    if (fo && refRate > 0) {
      fixedOpex = fo.fixed; varOpex = fo.variable; opexBasis = 'facilities';
      opexBoe = (fixedOpex + varOpex * refRate) / refRate;
    } else {
      opexBoe = ov.opexBoe ?? OPEX_BY_TYPE[field.hc] ?? 10;
      fixedOpex = 0.6 * opexBoe * refRate; varOpex = 0.4 * opexBoe; opexBasis = ov.opexBoe != null ? 'user' : 'type';
    }
    // Decommissioning: user's $/boe, else from facilities (at least $0.5/boe of recoverable volume, for wells and
    // facilities still to be installed), else the default $/boe.
    // Deductions from past investments still to be used from the start year (real USD; corporate and special tax base)
    const hd = deductionSchedule(field, (y) => y < a.startYear);
    const histCit = [], histSpt = [];
    for (const [t, d] of hd) if (t >= a.startYear) { const i = t - a.startYear, k = 1 / a.usdnok / Math.pow(1 + INFLATION, i); histCit[i] = (histCit[i] || 0) + d.cit * k; histSpt[i] = (histSpt[i] || 0) + d.spt * k; }
    const fd = facilityDecom(field);
    const decomTotal = ov.decomPerBoe != null ? ov.decomPerBoe * recBoe : fd != null ? Math.max(fd, 0.5 * recBoe) : null;
    return { histCit, histSpt, tempUplift: tempPackage(field) && !first, remBoe, remSodir, recBoe, q0, kind, startIndex, plateau, plateauYears, plateauSource, opexBoe, fixedOpex, varOpex, opexBasis, capexBoe, refRate,
      capexBasis, devCapex: kind === 'new' ? (exp != null ? 0.8 * exp : 6 * remSodir) : 0, decomPerBoe: ov.decomPerBoe, decomTotal, decomBasis: ov.decomPerBoe != null ? 'user' : fd != null ? 'facilities' : 'perBoe' };
  }

  function simulate(field, a, s, d, record) {
    const price = realisedPrice(field, a);
    const fixed = s.fixedOpex, varc = s.varOpex;
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
      const depr = dep.slice(-6).reduce((x, v) => x + v, 0) / 6 + (s.histCit[i] || 0);
      const cit = CIT * (rev - opex - depr);
      const uplift = capex * (s.tempUplift && q <= 0 ? UPLIFT.temp : UPLIFT.perm);
      const spt = SPT * (rev - opex - capex - uplift - (s.histSpt[i] || 0) - cit);
      const tax = cit + spt;
      const fcf = rev - opex - capex - tax;
      const df = Math.pow(1 + a.discount, -(i + 0.5));
      npv += fcf * df; taxPv += tax * df; cum += q; last = i;
      if (record) years.push({ year: y, q, rev, opex, capex, tax, fcf, df, pv: fcf * df });
    }
    const decom = s.decomTotal ?? (s.decomPerBoe ?? a.decomPerBoe) * s.recBoe;
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
  // Decline rate at which cumulative production (until the economic limit) equals `target` MMboe
  function fitDecline(field, a, s, target) {
    let lo = 0.002, hi = 0.7;
    if (simulate(field, a, s, lo, false).cum < target) return lo; // even the slowest decline cannot produce it all economically
    for (let k = 0; k < 50; k++) {
      const m = (lo + hi) / 2;
      if (simulate(field, a, s, m, false).cum > target) lo = m; else hi = m;
    }
    return (lo + hi) / 2;
  }

  // The field's own decline over the last five years: log-linear fit of annual production (needs ≥ 4 producing years)
  function observedDecline(field, lastFullYear) {
    const pts = [];
    for (let y = lastFullYear - 4; y <= lastFullYear; y++) {
      const p = field.prod.find((r) => r[0] === y);
      if (p && p[5] > 0) pts.push([y, Math.log(p[5])]);
    }
    if (pts.length < 4) return null;
    const n = pts.length, mx = pts.reduce((t, p) => t + p[0], 0) / n, my = pts.reduce((t, p) => t + p[1], 0) / n;
    let sxy = 0, sxx = 0;
    for (const [x, y] of pts) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; }
    return 1 - Math.exp(sxy / sxx);
  }

  /**
   * Values one field (100 % gross). Returns USD millions (real).
   * ov: optional overrides { opexBoe, capexBoe, decline, plateauYears, decomPerBoe }
   *
   * Decline (fields in ordinary decline, no user override) – calibrated on Sodir history (backtests from 2010 and 2015):
   *   d = clamp(observed 5-year decline, dLow, dHigh), where
   *   dHigh = decline that produces exactly Sodir's remaining reserves (never decline faster than that), and
   *   dLow  = decline that produces reserves × reserveGrowth (cap on implied reserve growth, default 1.6).
   *   Without a usable history the target is reserves × (1 + (reserveGrowth − 1) / 2), i.e. ×1.3 by default.
   * Plateau, ramp-up and new fields use reserves × (1 + (reserveGrowth − 1) / 2).
   * reserveGrowth = 1 reproduces the pure "fit to Sodir reserves" method.
   */
  function valueField(field, assumptions = {}, lastFullYear, ov = {}) {
    const a = { ...DEFAULTS, ...assumptions };
    const cap = Math.max(1, a.reserveGrowth ?? 1);
    const mid = 1 + (cap - 1) / 2;
    const s = setup(field, a, lastFullYear, ov, mid);
    const price = realisedPrice(field, a);
    const base = { field: field.slug, kind: s.kind, price, mix: mix(field), remBoe: s.remSodir, q0: s.q0, opexBoe: s.opexBoe, capexBoe: s.capexBoe, capexBasis: s.capexBasis, invExp: field.invExp || null,
      fixedOpex: s.fixedOpex, varOpex: s.varOpex, opexBasis: s.opexBasis, decomTotal: s.decomTotal ?? (s.decomPerBoe ?? a.decomPerBoe) * s.recBoe, decomBasis: s.decomBasis,
      plateauYears: s.plateauYears, plateauRate: s.plateau, plateauSource: s.plateauSource,
      plateauEnd: s.plateauYears ? a.startYear + s.startIndex + s.plateauYears - 1 : null };
    if (s.kind === 'none') return { ...base, npv: 0, taxPv: 0, grossValue: 0, decline: 0, endYear: null, cum: 0, years: [], impliedGrowth: 0 };
    let d = ov.decline, declineBasis = ov.decline != null ? 'user' : null, obs = null, dLow = null, dHigh = null;
    if (d == null) {
      if (s.kind === 'decline') {
        dHigh = fitDecline(field, a, s, s.remSodir);
        dLow = cap > 1 ? fitDecline(field, a, s, s.remSodir * cap) : dHigh;
        obs = observedDecline(field, lastFullYear);
        const target = obs != null ? obs : fitDecline(field, a, s, s.remSodir * mid);
        d = Math.min(dHigh, Math.max(dLow, target));
        declineBasis = cap <= 1 ? 'reserves' : obs == null ? 'growth' : obs > dHigh ? 'capHigh' : obs < dLow ? 'capLow' : 'observed';
      } else {
        d = fitDecline(field, a, s, s.remBoe);
        declineBasis = cap > 1 ? 'growth' : 'reserves';
      }
    }
    const r = simulate(field, a, s, d, true);
    return { ...base, npv: r.npv, taxPv: r.taxPv, grossValue: s.remSodir * price, decline: d, endYear: r.endYear, cum: r.cum, years: r.years,
      declineBasis, observedDecline: obs, dLow, dHigh, reserveGrowth: cap, impliedGrowth: s.remSodir > 0 ? r.cum / s.remSodir : 0 };
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
    const fo = ov.opexBoe == null ? facilityOpex(field) : null;
    const histOpex = (q) => (q <= 0 ? 0 : fo ? fo.fixed + fo.variable * q : 0.6 * opexBoe * peak + 0.4 * opexBoe * q);
    const ded = deductionSchedule(field);
    const rows = [];
    for (const y of histYears) {
      const p = prodY.get(y), pr = price.get(y), rf = realF(y);
      const q = p ? p[5] * BOE_PER_SM3 : 0;
      const revNom = p && pr ? (p[1] + p[4]) * BOE_PER_SM3 * (pr.b - 1) + p[3] * BOE_PER_SM3 * 0.6 * pr.b + p[2] * BOE_PER_SM3 * pr.g * MMBTU_PER_BOE_GAS : 0;
      const rev = revNom * rf;
      const capex = (invY.get(y) || 0) / (fx.get(y) || a.usdnok) * rf;
      const opex = histOpex(q);
      const pre = rev - opex - capex, tax = MARGINAL * (rev - opex) - taxSaving(ded, y) / (fx.get(y) || a.usdnok) * rf;
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

  /**
   * Cash flow of a field (100 % gross) from the year a stake changed hands: actual years (Sodir production and investments,
   * historical prices, fixed opex anchored to the production rate the year before the deal) + the model forecast.
   * Real USD of H.cpiBaseYear. opts.flat = { b, g } (real Brent $/bbl, real gas $/MMBtu) prices the actual years at a
   * flat deck instead of the prices that actually occurred (used for "value with the price outlook at the time").
   */
  function stakeCashflow(field, H, assumptions = {}, lastFullYear, ov = {}, fromYear, opts = {}) {
    const a = { ...DEFAULTS, ...assumptions };
    const price = new Map(H.prices.map(([y, b, g]) => [y, { b, g }]));
    const fx = new Map(H.usdnok), cpi = new Map(H.cpi);
    const cpiNow = cpi.get(H.cpiBaseYear);
    const opexBoe = ov.opexBoe ?? OPEX_BY_TYPE[field.hc] ?? 10;
    const fo = ov.opexBoe == null ? facilityOpex(field) : null;
    const prodY = new Map(field.prod.map((r) => [r[0], r])), invY = new Map(field.inv);
    const pRef = prodY.get(fromYear - 1) || prodY.get(fromYear);
    const qRef = pRef ? pRef[5] * BOE_PER_SM3 : 0;
    // Tax: 78 % of the operating margin minus the deductions from investments (all years); taxInh = the part of the saving
    // that comes from investments made before the deal year – the deductions the buyer takes over.
    const ded = deductionSchedule(field), dedInh = deductionSchedule(field, (y) => y < fromYear);
    const rows = [];
    for (let y = fromYear; y <= lastFullYear; y++) {
      const p = prodY.get(y), rf = cpiNow / (cpi.get(y) || cpiNow);
      const pr = opts.flat ? { b: opts.flat.b, g: opts.flat.g, real: true } : price.get(y);
      const q = p ? p[5] * BOE_PER_SM3 : 0;
      const revNom = p && pr ? (p[1] + p[4]) * BOE_PER_SM3 * (pr.b - 1) + p[3] * BOE_PER_SM3 * 0.6 * pr.b + p[2] * BOE_PER_SM3 * pr.g * MMBTU_PER_BOE_GAS : 0;
      const rev = pr && pr.real ? revNom : revNom * rf;
      const capex = (invY.get(y) || 0) / (fx.get(y) || a.usdnok) * rf;
      const opex = q <= 0 ? 0 : fo ? fo.fixed + fo.variable * q : opexBoe * (0.6 * Math.max(qRef, q) + 0.4 * q);
      const conv = rf / (fx.get(y) || a.usdnok);
      const pre = rev - opex - capex, tax = MARGINAL * (rev - opex) - taxSaving(ded, y) * conv;
      rows.push({ year: y, hist: true, q, rev, opex, capex, tax, fcf: pre - tax, taxInh: taxSaving(dedInh, y) * conv });
    }
    const fut = valueField(field, a, lastFullYear, ov);
    for (const r of fut.years) if (r.year >= fromYear) rows.push({ year: r.year, hist: false, q: r.q, rev: r.rev, opex: r.opex, capex: r.capex + (r.decom || 0), tax: r.tax, fcf: r.fcf,
      taxInh: taxSaving(dedInh, r.year) / a.usdnok / Math.pow(1 + INFLATION, r.year - a.startYear) });
    return rows;
  }

  function companies(fields) {
    const m = new Map();
    for (const f of fields) for (const [c] of f.owners) m.set(c, (m.get(c) || 0) + 1);
    return [...m.entries()].map(([name, n]) => ({ name, fields: n })).sort((a, b) => a.name.localeCompare(b.name, 'nb'));
  }

  return { DEFAULTS, MARGINAL, GAS_TARIFF, OPEX_BY_TYPE, BOE_PER_SM3, valueField, valueAll, valueCompany, valueHistory, stakeCashflow, facilityOpex, facilityDecom, OPEX_FAC, DECOM_FAC, MMBTU_PER_BOE_GAS, companies, realisedPrice, prices, mix, investmentDeductions, deductionSchedule, taxSaving, UPLIFT };
});
