// Evaluates each deal in public/data/deals.json against Sodir data and writes public/data/deal-metrics.json.
// For every deal with an identifiable Norwegian asset package:
//  - stakes transferred (seller's field shares on the announcement date, Sodir licence history)
//  - net production the year before, Sodir remaining reserves at the time, Brent that year
//  - price multiples ($ per flowing boe/d, $ per boe of reserves, and $/boe as % of Brent)
//  - hindsight value: after-tax cash flow from the deal year (actual history + Feltverdi forecast),
//    real terms, discounted to the deal year at 8 % real; compared with the price in real terms.
// Usage: node scripts/evaluate-deals.js
const fs = require('fs');
const path = require('path');
const V = require('../public/js/valuation.js');

const root = path.join(__dirname, '..');
const raw = (f) => fs.readFileSync(path.join(root, 'data', 'raw', f), 'utf8').replace(/^﻿/, '');
function parseCsv(t) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(f); f = ''; if (row.length > 1) rows.push(row); row = []; }
    else f += c;
  }
  const [h, ...b] = rows; return b.map((r) => Object.fromEntries(h.map((k, i) => [k.trim(), (r[i] || '').trim()])));
}
const D = (s) => { if (!s) return null; const [d, m, y] = s.split('.').map(Number); return new Date(Date.UTC(y, m - 1, d)); };

const lic = parseCsv(raw('field_licensee_hst.csv'));
const resv = parseCsv(raw('field_reserves.csv'));
const data = JSON.parse(fs.readFileSync(path.join(root, 'public', 'data', 'fields.json'), 'utf8'));
const H = JSON.parse(fs.readFileSync(path.join(root, 'public', 'data', 'history.json'), 'utf8'));
const deals = JSON.parse(fs.readFileSync(path.join(root, 'public', 'data', 'deals.json'), 'utf8')).deals;
const byName = new Map(data.fields.map((f) => [f.name.toUpperCase(), f]));
const cpi = new Map(H.cpi), brent = new Map(H.prices.map(([y, b]) => [y, b]));
const cpiNow = cpi.get(H.cpiBaseYear);
const BOE = V.BOE_PER_SM3, RATE = 0.08;

// Which seller entities (Sodir names) and which fields, per deal id. Deals without an entry are assessed qualitatively.
const SPEC = {
  '2016-aker-bp-merger': { sellers: ['BP Norge AS'] },
  '2017-akerbp-hess': { sellers: ['Hess Norge AS'] },
  '2017-point-exxonmobil': { sellers: ['ExxonMobil Exploration and Production Norway AS'], fields: ['BALDER', 'RINGHORNE ØST', 'JOTUN'] },
  '2017-ineos-dong': { sellers: ['DONG E&P Norge AS'] },
  '2018-okea-shell': { sellers: ['A/S Norske Shell'], fields: ['DRAUGEN', 'GJØA'] },
  '2019-dno-faroe': { sellers: ['Faroe Petroleum Norge AS'], partial: true, note: 'Norwegian part only; Faroe also had UK assets' },
  '2019-var-exxonmobil': { sellers: ['ExxonMobil Exploration and Production Norway AS'] },
  '2020-sval-edison': { sellers: ['Edison Norge AS'] },
  '2021-sval-spirit': { sellers: ['Spirit Energy Norway AS', 'Spirit Energy Norge AS'], price: 1100 },
  '2021-akerbp-lundin': { sellers: ['Lundin Energy Norway AS', 'Lundin Norway AS'] },
  '2022-okea-wintershalldea': { sellers: ['Wintershall Dea Norge AS'], fields: ['BRAGE', 'IVAR AASEN', 'NOVA'], shares: { BRAGE: 35.2, 'IVAR AASEN': 6.4615, NOVA: 6 } },
  '2023-var-neptune': { sellers: ['Neptune Energy Norge AS'] },
  '2025-dno-sval': { sellers: ['Sval Energi AS', 'Sval Norge AS'] },
  '2026-var-pandion': { sellers: ['Pandion Energy AS', 'Pandion Energy Norge AS'], fields: ['NOVA'], partial: true },
  '2026-var-goliat-fenja': { shares: { GOLIAT: 20, FENJA: 25 }, fields: ['GOLIAT', 'FENJA'], seller: 'Vår Energi' },
  '2026-var-conocophillips': { sellers: ['ConocoPhillips Skandinavia AS'] },
  '2026-equinor-japex-swap': { shares: { GOLIAT: 8 }, fields: ['GOLIAT'], partial: true },
};

function stakesAt(sellers, date, onlyFields) {
  const out = new Map();
  for (const r of lic) {
    if (!sellers.includes(r.cmpLongName)) continue;
    if (onlyFields && !onlyFields.includes(r.fldName)) continue;
    const from = D(r.fldLicenseeFrom), to = D(r.fldLicenseeTo);
    if (from && from > date) continue;
    if (to && to < date) continue;
    out.set(r.fldName, (out.get(r.fldName) || 0) + parseFloat(r.fldCompanyShare));
  }
  return out;
}
function reservesAt(fieldName, year) {
  let best = null;
  for (const r of resv) if (r.fldName === fieldName && +r.fldVersion <= year && (!best || +r.fldVersion > +best.fldVersion)) best = r;
  return best ? parseFloat(best.fldRemainingOE) : 0;
}

// Hindsight value of a stake bought in the deal year: actual years (Sodir production and investment, historical prices,
// fixed opex anchored to the production rate at the time of the deal) + Feltverdi forecast from next year. Real USD, 8 % real.
const fx = new Map(H.usdnok);
const priceY = new Map(H.prices.map(([y, b, g]) => [y, { b, g }]));
function hindsightValue(f, s, year) {
  const opexBoe = V.OPEX_BY_TYPE[f.hc] ?? 10;
  const pRef = f.prod.find((r) => r[0] === year - 1) || f.prod.find((r) => r[0] === year);
  const qRef = pRef ? pRef[5] * BOE : 0;
  let v = 0;
  for (let y = year; y <= data.lastFullYear; y++) {
    const p = f.prod.find((r) => r[0] === y), pr = priceY.get(y), rf = cpiNow / cpi.get(y);
    const q = p ? p[5] * BOE : 0;
    const rev = p && pr ? ((p[1] + p[4]) * BOE * (pr.b - 1) + p[3] * BOE * 0.6 * pr.b + p[2] * BOE * pr.g * 5.87) * rf : 0;
    const inv = (f.inv.find((r) => r[0] === y) || [0, 0])[1] / (fx.get(y) || 10) * rf;
    const opex = q > 0 ? opexBoe * (0.6 * Math.max(qRef, q) + 0.4 * q) : 0;
    v += (rev - opex - inv) * (1 - 0.78) * s * Math.pow(1 + RATE, -(y - year + 0.5));
  }
  const fut = V.valueField(f, {}, data.lastFullYear);
  for (const r of fut.years) v += r.fcf * s * Math.pow(1 + RATE, -(r.year - year + 0.5));
  return v;
}

const out = {};
for (const d of deals) {
  const spec = SPEC[d.id];
  if (!spec) continue;
  const date = new Date(d.date + 'T00:00:00Z'), year = +d.date.slice(0, 4);
  const stakes = spec.shares ? new Map(Object.entries(spec.shares)) : stakesAt(spec.sellers, date, spec.fields);
  let prod = 0, rem = 0, hindsight = 0, prodNow = 0, remNow = 0, prodAfter = 0;
  const items = [];
  for (const [name, sh] of stakes) {
    const f = byName.get(name); if (!f || sh <= 0) continue;
    const s = sh / 100;
    const p = f.prod.find((r) => r[0] === year - 1); const q = p ? p[5] * BOE * s : 0;
    const r0 = reservesAt(name, year - 1) * BOE * s;
    prod += q; rem += r0;
    hindsight += hindsightValue(f, s, year);
    prodAfter += f.prod.filter((r) => r[0] >= year && r[0] <= data.lastFullYear).reduce((t, r) => t + r[5] * BOE * s, 0);
    remNow += (f.rem ? f.rem.oe : 0) * BOE * s;
    items.push({ field: f.name, slug: f.slug, share: Math.round(sh * 1000) / 1000, prodKboed: Math.round(q / 0.365 * 10000) / 10, remMmboe: Math.round(r0 * 10) / 10 });
  }
  if (!items.length) continue;
  const price = spec.price ?? d.valueUsdM;
  const realF = cpiNow / cpi.get(year);
  const b = brent.get(year) ?? brent.get(year - 1);
  const m = {
    year, seller: spec.seller, partial: !!spec.partial, note: spec.note || null, items: items.sort((a, z) => z.remMmboe - a.remMmboe),
    prodKboed: Math.round(prod / 0.365 * 10) / 10, remMmboe: Math.round(rem), brent: b,
    priceUsdM: price, priceReal: price != null ? Math.round(price * realF) : null,
    perFlowing: price != null && prod > 0 ? Math.round(price * 1e6 / (prod / 0.365 * 1000)) : null,
    perBoe: price != null && rem > 0 ? Math.round(price / rem * 100) / 100 : null,
    perBoePctBrent: price != null && rem > 0 && b ? Math.round(price / rem / b * 1000) / 10 : null,
    hindsightValue: Math.round(hindsight), // real USD of the CPI base year, at the deal year
    ratio: price != null && hindsight > 0 ? Math.round(price * realF / hindsight * 100) / 100 : null,
    reserveGrowth: rem > 0 ? Math.round((prodAfter + remNow) / rem * 100) / 100 : null,
  };
  out[d.id] = m;
}
// Baseline: median price/value ratio of complete packages with a disclosed price. Systematic model gaps (tax balances,
// upside, buyers' price decks and required returns) affect all deals alike, so each deal is judged relative to this.
const ratios = Object.values(out).filter((m) => m.ratio && !m.partial).map((m) => m.ratio).sort((a, b) => a - b);
const baseline = ratios.length ? (ratios.length % 2 ? ratios[(ratios.length - 1) / 2] : (ratios[ratios.length / 2 - 1] + ratios[ratios.length / 2]) / 2) : 1;
for (const m of Object.values(out)) m.relative = m.ratio && !m.partial ? Math.round(m.ratio / baseline * 100) / 100 : null;
fs.writeFileSync(path.join(root, 'public', 'data', 'deal-metrics.json'), JSON.stringify({ generated: new Date().toISOString().slice(0, 10), baseYear: H.cpiBaseYear, discount: RATE, baseline: Math.round(baseline * 100) / 100, n: ratios.length, metrics: out }, null, 1));
for (const [id, m] of Object.entries(out)) {
  console.log(`${id.padEnd(28)} prod ${String(m.prodKboed).padStart(6)} kboe/d  rem ${String(m.remMmboe).padStart(5)} MMboe  Brent ${m.brent}  price ${m.priceUsdM ?? '-'} (real ${m.priceReal ?? '-'})  $/flow ${m.perFlowing ?? '-'}  $/boe ${m.perBoe ?? '-'} (${m.perBoePctBrent ?? '-'}% Brent)  hindsight ${m.hindsightValue}  ratio ${m.ratio ?? '-'}  growth ${m.reserveGrowth}`);
}
