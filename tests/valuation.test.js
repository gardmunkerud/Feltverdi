// Tests for the valuation engine (node --test). Uses synthetic fields plus a check against the built data file.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const V = require('../public/js/valuation.js');

const LAST = 2025;
function field(over = {}) {
  return {
    slug: 'test', name: 'Test', status: 'Producing', hc: 'OIL', owners: [['A AS', 60], ['B ASA', 40]], operator: 'A AS',
    rem: { oil: 10, gas: 0, ngl: 0, cond: 0, oe: 10 }, rec: { oil: 50, gas: 0, ngl: 0, cond: 0, oe: 50 },
    prod: [[2023, 2.4, 0, 0, 0, 2.4], [2024, 2.2, 0, 0, 0, 2.2], [2025, 2.0, 0, 0, 0, 2.0]],
    inv: [[2022, 1500], [2023, 1500], [2024, 1500]],
    ...over,
  };
}

test('with reserve growth ×1.0 the decline produces (about) the remaining reserves', () => {
  const v = V.valueField(field(), { reserveGrowth: 1 }, LAST);
  const remBoe = 10 * V.BOE_PER_SM3;
  assert.ok(Math.abs(v.cum - remBoe) / remBoe < 0.02, `cum ${v.cum} vs ${remBoe}`);
  assert.ok(v.npv > 0);
  assert.ok(v.endYear > 2026 && v.endYear < 2070);
});

test('higher prices and lower discount rate increase value; higher opex decreases it', () => {
  const f = field();
  const base = V.valueField(f, {}, LAST).npv;
  assert.ok(V.valueField(f, { brent: 95 }, LAST).npv > base);
  assert.ok(V.valueField(f, { discount: 0.05 }, LAST).npv > base);
  assert.ok(V.valueField(f, {}, LAST, { opexBoe: 25 }).npv < base);
});

test('after-tax margin is roughly 22 % of the pre-tax margin (78 % marginal tax)', () => {
  const v = V.valueField(field(), { discount: 0.0001 }, LAST);
  const ops = v.years.filter((y) => y.q > 0);
  const pre = ops.reduce((s, y) => s + y.rev - y.opex - y.capex, 0);
  const post = ops.reduce((s, y) => s + y.fcf, 0);
  assert.ok(Math.abs(post / pre - 0.22) < 0.02, `ratio ${post / pre}`);
});

test('gas is priced from EUR/MWh, net of the transport tariff', () => {
  const gasField = field({ hc: 'GAS', rem: { oil: 0, gas: 10, ngl: 0, cond: 0, oe: 10 } });
  const p = V.realisedPrice(gasField, { ...V.DEFAULTS, gasEur: 35, eurusd: 1.15 });
  // 1.75 MWh/boe = 159 Sm3 at ~11.0 kWh (Gassco deliveries); MMBtu factor must match it
  assert.ok(Math.abs(p - (35 * 1.75 * 1.15 - V.GAS_TARIFF)) < 1e-9);
  assert.ok(Math.abs(V.MMBTU_PER_BOE_GAS - V.MWH_PER_BOE_GAS * 3.412) < 0.01);
});

test('NOK costs: a weaker krone lowers opex in USD; the default rate leaves the calibrated level unchanged', () => {
  const f = field();
  const base = V.valueField(f, {}, LAST), weak = V.valueField(f, { usdnok: 12 }, LAST);
  assert.ok(Math.abs(weak.opexBoe - base.opexBoe * 10 / 12) < 1e-9, `${weak.opexBoe} vs ${base.opexBoe}`);
  assert.ok(weak.npv > base.npv);
  // a user override in USD/boe is not rescaled
  assert.strictEqual(V.valueField(f, { usdnok: 12 }, LAST, { opexBoe: 15 }).opexBoe, 15);
});

test('historical gas revenue is net of the transport tariff, as in the forecast', () => {
  const H = { prices: [[2024, 80, 10], [2025, 70, 12]], usdnok: [[2024, 10], [2025, 10]], cpi: [[2024, 100], [2025, 100]], cpiBaseYear: 2025 };
  const g = field({ hc: 'GAS', rem: { oil: 0, gas: 10, ngl: 0, cond: 0, oe: 10 }, prod: [[2024, 0, 2, 0, 0, 2], [2025, 0, 2, 0, 0, 2]] });
  const r = V.valueHistory(g, H, {}, LAST).rows.find((x) => x.year === 2025);
  assert.ok(Math.abs(r.rev - 2 * V.BOE_PER_SM3 * (12 * V.MMBTU_PER_BOE_GAS - V.GAS_TARIFF)) < 1e-6, `rev ${r.rev}`);
});

test('history.json CPI has no year with a gap counted as zero (rises every year since 2000)', () => {
  const H = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'history.json'), 'utf8'));
  const c = H.cpi.filter(([y]) => y >= 2000);
  for (let i = 1; i < c.length; i++) assert.ok(c[i][1] > c[i - 1][1] * 0.97, `CPI ${c[i][0]} ${c[i][1]} vs ${c[i - 1][1]}`);
});

test('shut-down fields and fields without reserves are worth zero', () => {
  assert.strictEqual(V.valueField(field({ status: 'Shut down' }), {}, LAST).npv, 0);
  assert.strictEqual(V.valueField(field({ rem: { oil: 0, gas: 0, ngl: 0, cond: 0, oe: 0 } }), {}, LAST).npv, 0);
});

test('approved fields start next year after a development year', () => {
  const v = V.valueField(field({ status: 'Approved for production', prod: [] }), {}, LAST);
  assert.strictEqual(v.kind, 'new');
  assert.strictEqual(v.years[0].q, 0);
  assert.ok(v.years[0].capex > 0);
  assert.ok(v.years[1].q > 0);
});

test('plateau fields hold production flat, then decline, and still match reserves', () => {
  const f = field({ rem: { oil: 30, gas: 0, ngl: 0, cond: 0, oe: 30 }, outlook: { plateau: 'plateau', basis: 'text' } });
  const v = V.valueField(f, { reserveGrowth: 1 }, LAST);
  assert.strictEqual(v.kind, 'plateau');
  assert.ok(v.plateauYears >= 2, `plateau years ${v.plateauYears}`);
  const q = v.years.filter((y) => y.q > 0).map((y) => y.q);
  assert.ok(Math.abs(q[0] - q[1]) < 1e-9, 'flat during plateau');
  assert.ok(q[v.plateauYears] < q[0], 'declines after plateau');
  assert.ok(Math.abs(v.cum - 30 * V.BOE_PER_SM3) / (30 * V.BOE_PER_SM3) < 0.02);
  // user override: no plateau
  assert.strictEqual(V.valueField(f, {}, LAST, { plateauYears: 0 }).kind, 'decline');
});

test('whole-life value combines history (real terms) and forecast', () => {
  const H = { cpiBaseYear: 2026, prices: [[2023, 80, 10], [2024, 80, 10], [2025, 80, 10]], usdnok: [[2022, 10], [2023, 10], [2024, 10], [2025, 10]],
    cpi: [[2022, 100], [2023, 100], [2024, 100], [2025, 100], [2026, 110]] };
  const f = field({ inv: [[2022, 1500], [2023, 1500], [2024, 1500]] });
  const h = V.valueHistory(f, H, {}, LAST);
  assert.strictEqual(h.startYear, 2022);
  // 2023 revenue: 2.4 MSm3 oil × 6.29 × (80 − 1) × CPI factor 1.1
  const r23 = h.rows.find((r) => r.year === 2023);
  assert.ok(Math.abs(r23.rev - 2.4 * 6.29 * 79 * 1.1) < 1e-6);
  // 2022 capex: NOK 1500m / 10 × 1.1 = USD 165m real
  assert.ok(Math.abs(h.rows.find((r) => r.year === 2022).capex - 165) < 1e-6);
  assert.ok(h.rows.some((r) => !r.hist), 'forecast rows included');
  assert.ok(h.prodHist > 0 && h.prodTotal > h.prodHist);
  assert.ok(h.irr > 0);
});

test('decline follows the observed 5-year decline, bounded by reserves ×1.0 and × reserveGrowth', () => {
  const hist = (rates) => rates.map((q, i) => [2021 + i, q, 0, 0, 0, q]);
  const rem = (oe) => ({ oil: oe, gas: 0, ngl: 0, cond: 0, oe });
  // observed decline ~10 %/yr
  const obs10 = hist([3.0, 2.7, 2.43, 2.187, 1.968]);
  const mid = V.valueField(field({ prod: obs10, rem: rem(14) }), {}, LAST);
  assert.ok(mid.observedDecline > 0.09 && mid.observedDecline < 0.11, `observed ${mid.observedDecline}`);
  assert.ok(mid.decline >= mid.dLow - 1e-9 && mid.decline <= mid.dHigh + 1e-9);
  // very slow observed decline -> clamped at dLow (reserves × 1.6)
  const slow = V.valueField(field({ prod: hist([2, 2, 2, 2, 2]), rem: rem(6) }), {}, LAST);
  assert.strictEqual(slow.declineBasis, 'capLow');
  assert.ok(Math.abs(slow.impliedGrowth - 1.6) < 0.05, `growth ${slow.impliedGrowth}`);
  // very fast observed decline -> clamped at dHigh (exactly Sodir reserves)
  const fast = V.valueField(field({ prod: hist([8, 6, 4.5, 3.4, 2.5]), rem: rem(40) }), {}, LAST);
  assert.strictEqual(fast.declineBasis, 'capHigh');
  assert.ok(Math.abs(fast.impliedGrowth - 1) < 0.03, `growth ${fast.impliedGrowth}`);
  // reserve growth 1.0 reproduces the pure reserve fit
  const pure = V.valueField(field({ prod: obs10, rem: rem(14) }), { reserveGrowth: 1 }, LAST);
  assert.strictEqual(pure.declineBasis, 'reserves');
  assert.ok(Math.abs(pure.impliedGrowth - 1) < 0.03);
});

test('higher reserve growth never lowers production or value', () => {
  const f = field({ prod: [[2021, 2, 0, 0, 0, 2], [2022, 2, 0, 0, 0, 2], [2023, 2, 0, 0, 0, 2], [2024, 2, 0, 0, 0, 2], [2025, 2, 0, 0, 0, 2]] });
  const a = V.valueField(f, { reserveGrowth: 1 }, LAST), b = V.valueField(f, { reserveGrowth: 1.6 }, LAST), c = V.valueField(f, { reserveGrowth: 2 }, LAST);
  assert.ok(a.cum <= b.cum + 1e-9 && b.cum <= c.cum + 1e-9);
  assert.ok(a.npv <= b.npv + 1e-9 && b.npv <= c.npv + 1e-9);
});

test('company value is the sum of its field shares', () => {
  const fields = [field(), field({ slug: 'two', name: 'Two', owners: [['B ASA', 100]], operator: 'B ASA' })];
  const vals = V.valueAll(fields, {}, LAST);
  const b = V.valueCompany('B ASA', fields, vals);
  const expect = vals.get('test').npv * 0.4 + vals.get('two').npv;
  assert.ok(Math.abs(b.npv - expect) < 1e-6);
  assert.strictEqual(b.operated, 1);
});

test('built data file values sensibly (if present)', { skip: !fs.existsSync(path.join(__dirname, '..', 'public', 'data', 'fields.json')) }, () => {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'fields.json'), 'utf8'));
  assert.ok(d.fields.length > 100);
  const vals = V.valueAll(d.fields, {}, d.lastFullYear);
  const total = [...vals.values()].reduce((s, v) => s + v.npv, 0);
  assert.ok(total > 20000 && total < 300000, `shelf NPV $${total}MM`);
  const troll = vals.get('troll');
  assert.ok(troll && troll.npv > 0);
  for (const f of d.fields) assert.ok(Math.abs(f.owners.reduce((s, o) => s + o[1], 0) - 100) < 0.6 || !f.owners.length, f.name);
});

test('host fields receive the processing tariff their tie-backs pay (if data present)', { skip: !fs.existsSync(path.join(__dirname, '..', 'public', 'data', 'fields.json')) }, () => {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'fields.json'), 'utf8'));
  for (const [tb, host] of Object.entries(V.TIEBACK_HOST)) {
    assert.ok(d.fields.some((f) => f.slug === tb), `tie-back ${tb} exists`);
    assert.ok(d.fields.some((f) => f.slug === host), `host ${host} exists`);
  }
  const vals = V.valueAll(d.fields, {}, d.lastFullYear);
  const g = d.fields.find((f) => f.slug === 'gullfaks');
  const tbs = V.tiebacksOf(g, d.fields);
  assert.ok(tbs.some((f) => f.slug === 'gullfaks-sor'));
  const alone = V.valueField(g, {}, d.lastFullYear);
  const withTb = V.valueField(g, {}, d.lastFullYear, { tiebacks: tbs });
  assert.ok(withTb.tariffPv > 0 && withTb.npv > alone.npv);
  assert.strictEqual(withTb.decline, alone.decline); // the tariff does not change the decline fit
  assert.ok(Math.abs(vals.get('gullfaks').npv - withTb.npv) < 1e-6); // valueAll and the stand-alone path agree
  // the tariff income in a forecast year equals the tie-backs' modelled production × tariff
  const y0 = d.lastFullYear + 1;
  const expect = tbs.reduce((t, f) => t + ((vals.get(f.slug).years.find((r) => r.year === y0) || {}).q || 0) * V.OPEX_FAC.tieback, 0);
  assert.ok(Math.abs(withTb.years.find((r) => r.year === y0).tariff - expect) < 1e-6);
});

test('Sodir expected investments from a past year are not charged to the forecast again; the unreported year is estimated', () => {
  // Producing field: invExp "from 2025" spread over 2025 production + reserves × 1.3; 2025 not reported by Sodir yet
  const f = field({ invExp: { mnok: 2000, year: 2025 } });
  const prodBase = 10 * V.BOE_PER_SM3 * 1.3, q25 = 2.0 * V.BOE_PER_SM3;
  const k = 2000 / 10 / (prodBase + q25);
  const v = V.valueField(f, {}, LAST);
  assert.ok(Math.abs(v.capexBoe - k) < 1e-9, `capex/boe ${v.capexBoe} vs ${k}`);
  const inv = V.investmentsWithGap(f, V.DEFAULTS, LAST);
  assert.ok(Math.abs(inv.find((r) => r[0] === 2025)[1] - k * q25 * 10) < 1e-6);
  const h = V.valueHistory(f, { prices: [[2025, 70, 11]], usdnok: [[2025, 10]], cpi: [[2025, 100]], cpiBaseYear: 2025 }, {}, LAST);
  assert.ok(h.rows.find((r) => r.year === 2025).capex > 0); // the estimate appears in the actual year
  // Reported 2025 investments are used as they are, not replaced
  const g = field({ invExp: { mnok: 2000, year: 2025 }, inv: [[2024, 1500], [2025, 900]] });
  assert.strictEqual(V.investmentsWithGap(g, V.DEFAULTS, LAST).find((r) => r[0] === 2025)[1], 900);
  // New field (approved, starts 2027): 80 % development spread over 2025–26, so 2026 carries half of it
  const n = field({ status: 'Approved for production', prod: [], inv: [[2024, 500]], invExp: { mnok: 5000, year: 2025 } });
  const vn = V.valueField(n, {}, LAST);
  assert.ok(Math.abs(vn.years[0].capex - 0.4 * 5000 / 10) < 1e-6);
  assert.ok(Math.abs(V.investmentsWithGap(n, V.DEFAULTS, LAST).find((r) => r[0] === 2025)[1] - 0.4 * 5000) < 1e-6);
  // Field Sodir lists as producing with no production last year: started this year, development already spent
  const p = field({ prod: [[2025, 0, 0, 0, 0, 0]], inv: [[2024, 500]], invExp: { mnok: 5000, year: 2025 } });
  const vp = V.valueField(p, {}, LAST);
  assert.ok(vp.years[0].q > 0);
  assert.ok(Math.abs(V.investmentsWithGap(p, V.DEFAULTS, LAST).find((r) => r[0] === 2025)[1] - 0.8 * 5000) < 1e-6);
});

test('deductions still unused when a field stops are counted in full (tax is per company, not per field)', () => {
  // Short-lived field: about one year of production left, so most of a 2025 investment's corporate-tax depreciation
  // (2025–2030) falls after the field has stopped.
  const over = { rem: { oil: 1, gas: 0, ngl: 0, cond: 0, oe: 1 }, invExp: { year: 2026, mnok: 50 } };
  const base = V.valueField(field(over), {}, LAST);
  const extra = 10000; // NOK million in 2025
  const withInv = V.valueField(field({ ...over, inv: [[2022, 1500], [2023, 1500], [2024, 1500], [2025, extra]] }), {}, LAST);
  assert.ok(base.endYear <= 2028, `ends ${base.endYear}`);
  const a = V.DEFAULTS, k = 1 / a.usdnok;
  let expect = 0;
  for (const [t, c, sp] of V.investmentDeductions(field(over), 2025, extra, 2023)) {
    if (t < a.startYear) continue;
    const i = t - a.startYear;
    expect += (c * 0.22 * (1 - 0.718) + sp * 0.718) * k / Math.pow(1.02, i) * Math.pow(1 + a.discount, -(i + 0.5));
  }
  assert.ok(Math.abs(withInv.npv - base.npv - expect) < 1e-6 * Math.max(1, expect), `${withInv.npv - base.npv} vs ${expect}`);
});

test('a field never has more than NOK 5 bn of operating cost in a year (forecast and actual years)', () => {
  // A big old hub: 4 Condeeps and 400 platform wells would cost far more than the cap
  const f = field({ rem: { oil: 60, gas: 0, ngl: 0, cond: 0, oe: 60 }, prod: [[2023, 12, 0, 0, 0, 12], [2024, 11, 0, 0, 0, 11], [2025, 10, 0, 0, 0, 10]],
    fac: { own: { gbs: 4, steelLarge: 0, steelSmall: 0, floater: 0, onshore: 0, template: 0 }, tieback: false, wells: { platform: 400, subsea: 0 } } });
  assert.ok(V.facilityOpex(f).fixed > 500); // uncapped cost is above the cap
  for (const usdnok of [8, 10, 12]) {
    const v = V.valueField(f, { usdnok }, LAST);
    const ops = v.years.filter((y) => y.q > 0);
    assert.ok(ops.length > 0);
    for (const y of ops) assert.ok(y.opex <= V.OPEX_CAP_NOK / usdnok + 1e-9, `${usdnok}: ${y.year} opex ${y.opex}`);
    assert.ok(Math.abs(ops[0].opex - V.OPEX_CAP_NOK / usdnok) < 1e-9); // binds
  }
  const H = { prices: [[2024, 80, 10], [2025, 70, 12]], usdnok: [[2024, 10], [2025, 10]], cpi: [[2024, 100], [2025, 100]], cpiBaseYear: 2025 };
  for (const r of V.valueHistory(f, H, {}, LAST).rows) assert.ok(r.opex <= V.OPEX_CAP_NOK / 10 + 1e-9, `${r.year} ${r.opex}`);
  for (const r of V.stakeCashflow(f, H, {}, LAST, {}, 2024)) assert.ok(r.opex <= V.OPEX_CAP_NOK / 10 + 1e-9);
});

test('shelf data: no field above the opex cap in any year, old hubs dearer per boe than new fields (if data present)', { skip: !fs.existsSync(path.join(__dirname, '..', 'public', 'data', 'fields.json')) }, () => {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'fields.json'), 'utf8'));
  const vals = V.valueAll(d.fields, {}, d.lastFullYear);
  let total = 0;
  for (const [slug, v] of vals) for (const y of v.years) {
    if (y.q > 0) assert.ok(y.opex <= V.OPEX_CAP_NOK / V.DEFAULTS.usdnok + 1e-9, `${slug} ${y.year} opex ${y.opex}`);
    if (y.q > 0 && y.year === d.lastFullYear + 1) total += y.opex;
  }
  // Shelf opex in the first forecast year stays near Norsk Petroleum's ~NOK 94 bn (2025), incl. tie-back tariffs
  assert.ok(total * V.DEFAULTS.usdnok / 1000 > 85 && total * V.DEFAULTS.usdnok / 1000 < 115, `shelf opex NOK ${total / 100} bn`);
  const unit = (slug) => { const v = vals.get(slug), y = v.years.find((r) => r.q > 0); return y.opex / y.q; };
  const oldHubs = ['ekofisk', 'eldfisk', 'valhall', 'gullfaks', 'statfjord'], young = ['johan-sverdrup', 'johan-castberg', 'breidablikk'];
  const minOld = Math.min(...oldHubs.map(unit)), maxNew = Math.max(...young.map(unit));
  assert.ok(minOld > maxNew, `old hubs from ${minOld} $/boe, new fields up to ${maxNew} $/boe`);
  assert.ok(unit('johan-sverdrup') < 2);
});

test('shelf data: cap holds at other exchange rates and prices, opex never rises with time, older fields cost more per boe (if data present)', { skip: !fs.existsSync(path.join(__dirname, '..', 'public', 'data', 'fields.json')) }, () => {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'fields.json'), 'utf8'));
  for (const a of [{ usdnok: 8 }, { usdnok: 12 }, { brent: 60 }, { brent: 95, gas: 50 }]) {
    const usdnok = a.usdnok ?? V.DEFAULTS.usdnok;
    for (const [slug, v] of V.valueAll(d.fields, a, d.lastFullYear)) {
      const ops = v.years.filter((y) => y.q > 0);
      for (let i = 0; i < ops.length; i++) {
        assert.ok(ops[i].opex <= V.OPEX_CAP_NOK / usdnok + 1e-9, `${JSON.stringify(a)} ${slug} ${ops[i].year} opex ${ops[i].opex}`);
        // Late life: total opex falls (or stays) as production falls; the economic limit ends the field instead
        if (i) assert.ok(ops[i].opex <= ops[i - 1].opex + 1e-9, `${slug} opex rises in ${ops[i].year}`);
      }
      const last = ops[ops.length - 1];
      if (last) assert.ok(last.opex <= last.rev + 1e-9, `${slug} last year opex above revenue`);
    }
  }
  // Age profile: median 2026 opex per boe rises with the years since first production
  const vals = V.valueAll(d.fields, {}, d.lastFullYear), y0 = d.lastFullYear + 1;
  const groups = [[], [], []];
  for (const f of d.fields) {
    const first = f.prod.find((r) => r[5] > 0), y = vals.get(f.slug).years.find((r) => r.year === y0 && r.q > 0);
    if (!first || !y) continue;
    const age = y0 - first[0];
    groups[age < 15 ? 0 : age < 30 ? 1 : 2].push(y.opex / y.q);
  }
  const med = (xs) => xs.sort((p, q) => p - q)[Math.floor(xs.length / 2)];
  const [young, mid, old] = groups.map(med);
  assert.ok(young < mid && mid < old, `median $/boe by age: <15 yrs ${young}, 15–30 ${mid}, 30+ ${old}`);
});
