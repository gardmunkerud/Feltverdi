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
const has = (f) => fs.existsSync(path.join(root, 'data', 'raw', f));
const prl = has('licence_licensee_hst.csv') ? parseCsv(raw('licence_licensee_hst.csv')) : [];
const dsc = has('discovery.csv') ? parseCsv(raw('discovery.csv')) : [];
const wlb = parseCsv(raw('wellbore_exploration_all.csv'));
const fieldTbl = parseCsv(raw('field.csv'));
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
  '2019-var-exxonmobil': { sellers: ['ExxonMobil Exploration and Production Norway AS'], }, // cross-check: Breidablikk unit (2021) 34.4 % for Vår, all from ex-Exxon licences 001 CS, 027 FS, 028 C, 169, 169 B1, 169 B2
  '2020-sval-edison': { sellers: ['Edison Norge AS'] },
  '2021-sval-spirit': { sellers: ['Spirit Energy Norway AS', 'Spirit Energy Norge AS'], price: 1100 },
  '2021-akerbp-lundin': { sellers: ['Lundin Energy Norway AS', 'Lundin Norway AS'] },
  '2022-okea-wintershalldea': { sellers: ['Wintershall Dea Norge AS'], fields: ['BRAGE', 'IVAR AASEN', 'NOVA'], shares: { BRAGE: 35.2, 'IVAR AASEN': 6.4615, NOVA: 6 } },
  '2023-var-neptune': { sellers: ['Neptune Energy Norge AS'] },
  '2025-dno-sval': { sellers: ['Sval Energi AS', 'Sval Norge AS'] },
  '2026-var-pandion': { sellers: ['Pandion Energy AS', 'Pandion Energy Norge AS'], fields: ['NOVA'], partial: true },
  '2026-var-goliat-fenja': { shares: { GOLIAT: 20, FENJA: 25 }, fields: ['GOLIAT', 'FENJA'], seller: 'Vår Energi' },
  '2026-var-conocophillips': { sellers: ['ConocoPhillips Skandinavia AS'] },
  '2026-equinor-japex-swap': { legs: [
    { from: 'Equinor', to: 'JAPEX', shares: { GOLIAT: 8 }, note: { nb: 'I tillegg 20 % i Arkenstone og 10 % i Rhadamanthys (funn/prospekter, ikke verdsatt)', en: 'Plus 20 % of Arkenstone and 10 % of Rhadamanthys (discoveries/prospects, not valued)' } },
    { from: 'JAPEX', to: 'Equinor', shares: { VERDANDE: 3.5 }, cash: 65, note: { nb: 'I tillegg en lete-carry (ikke verdsatt)', en: 'Plus an exploration carry (not valued)' } },
  ] },
  '2026-var-dno-swap': { legs: [
    { from: 'Vår Energi', to: 'DNO', shares: { GJØA: 5 }, cash: 17.5 },
    { from: 'DNO', to: 'Vår Energi', shares: { NOVA: 5 }, note: { nb: 'I tillegg 15 % i Ringhorne Nord (ikke et eget felt i Sodirs data, ikke verdsatt)', en: 'Plus 15 % of Ringhorne North (not a separate field in Sodir data, not valued)' } },
  ] },
  // Effective 1 Jan 2025: share changes read from Sodir licence history (31.12.2024 → 01.01.2025)
  '2024-equinor-petoro-swap': { legs: [
    { from: 'Petoro', to: 'Equinor', diff: { company: 'Equinor Energy AS', before: '2024-12-31', after: '2025-01-01', sign: 1 }, note: { nb: 'I tillegg økt andel i Noatun-funnet (ikke verdsatt)', en: 'Plus a higher share of the Noatun discovery (not valued)' } },
    { from: 'Equinor', to: 'Petoro', diff: { company: 'Equinor Energy AS', before: '2024-12-31', after: '2025-01-01', sign: -1 }, note: { nb: 'I tillegg andeler i funnene Carmen og Beta (ikke verdsatt)', en: 'Plus shares of the Carmen and Beta discoveries (not valued)' } },
  ] },
};
// Buyer / seller labels where parties[0] / parties[1] is not right
const ROLES = { '2026-var-goliat-fenja': { buyer: 'Orlen Upstream Norway / Concedo', seller: 'Vår Energi' } };

function shareDiff({ company, before, after, sign }) {
  const b = stakesAt([company], new Date(before + 'T00:00:00Z')), a = stakesAt([company], new Date(after + 'T00:00:00Z'));
  const out = new Map();
  for (const k of new Set([...a.keys(), ...b.keys()])) { const d = ((a.get(k) || 0) - (b.get(k) || 0)) * sign; if (d > 1e-6) out.set(k, d); }
  return out;
}

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
// ---- Fields that did not exist at the deal date but grew out of discoveries in the seller's licences ----
// A field formed later (e.g. Breidablikk, 2021) is not in the seller's field stakes on the deal date. We find the production
// licences behind the field (field owner licence + licences of the discovery wells), estimate each licence's tract share
// from the licensees' field shares at field creation (non-negative least squares), and apply the seller's licence shares
// on the deal date. Only discoveries made before the deal are included (later exploration success is not part of the package).
const wlbLicence = new Map(wlb.map((w) => [w.wlbWellboreName, w.wlbProductionLicence]));
function licShares(company, date) {
  const out = new Map();
  for (const r of prl) {
    if (company && r.cmpLongName !== company) continue;
    const from = D(r.prlLicenseeDateValidFrom), to = D(r.prlLicenseeDateValidTo);
    if ((from && from > date) || (to && to < date)) continue;
    const k = r.prlName + '|' + r.cmpLongName;
    out.set(k, (out.get(k) || 0) + parseFloat(r.prlLicenseeInterest || 0));
  }
  return out;
}
const trace = [];
const fieldCreated = new Map();
for (const r of lic) { const d = D(r.fldLicenseeFrom); if (d && (!fieldCreated.has(r.fldName) || d < fieldCreated.get(r.fldName))) fieldCreated.set(r.fldName, d); }
function laterFields(sellers, date, onlyFields, completed) {
  // Successor method: for a field formed after the deal from a discovery made before it, find the discovery licences where
  // the seller held a share on the deal date, identify who took that share over at completion (the buyer, as Sodir records it),
  // and attribute to the deal the buyer's field share at creation × the part of the buyer's licence holding that came from the seller.
  const out = new Map(); if (!prl.length || !dsc.length) return out;
  const year = date.getUTCFullYear();
  const after = completed || new Date(date.getTime() + 365 * 864e5);
  const allAt = (d) => licShares(null, d);
  const atDeal = allAt(date), atDone = allAt(after);
  const shareIn = (m, L, c) => m.get(L + '|' + c) || 0;
  const holders = (m, L) => [...m.keys()].filter((k) => k.startsWith(L + '|')).map((k) => k.slice(L.length + 1));
  for (const [fld, created] of fieldCreated) {
    if (created <= date || (onlyFields && !onlyFields.includes(fld))) continue;
    const ds = dsc.filter((x) => x.fldName === fld && +x.dscDiscoveryYear && +x.dscDiscoveryYear <= year);
    if (!ds.length) continue;
    const L = [...new Set(ds.map((x) => wlbLicence.get(x.wlbName)).filter(Boolean))];
    const atCreate = allAt(created);
    const fieldShare = new Map(lic.filter((r) => r.fldName === fld && D(r.fldLicenseeFrom).getTime() === created.getTime()).map((r) => [r.cmpLongName, parseFloat(r.fldCompanyShare)]));
    let best = 0, how = null;
    for (const l of L) {
      const sell = sellers.reduce((t, c) => t + shareIn(atDeal, l, c), 0);
      if (sell <= 0) continue;
      // buyers: companies whose share in the licence rose between the deal date and completion
      // the seller must actually have left (or reduced in) the licence, and the buyer's gain must match that reduction
      const dropped = sell - sellers.reduce((t, c) => t + shareIn(atDone, l, c), 0);
      if (dropped <= 0.5) continue;
      const buyers = holders(atDone, l).filter((c) => !sellers.includes(c) && Math.abs((shareIn(atDone, l, c) - shareIn(atDeal, l, c)) - dropped) <= 0.2 * dropped);
      for (const c of buyers) {
        const gained = shareIn(atDone, l, c) - shareIn(atDeal, l, c);
        // field share at creation may sit with the buyer or its renamed successor (same company, new Sodir name)
        const fs0 = fieldShare.get(c) ?? [...fieldShare.entries()].find(([n]) => n.split(' ')[0] === c.split(' ')[0])?.[1] ?? 0;
        const holdNow = shareIn(atCreate, l, c) || [...atCreate.entries()].filter(([k]) => k.startsWith(l + '|' + c.split(' ')[0])).reduce((t, [, v]) => t + v, 0);
        if (fs0 <= 0 || holdNow <= 0) continue;
        const est = fs0 * Math.min(1, Math.min(gained, sell) / holdNow);
        if (est > best) { best = est; how = `${fld}: ${c} ${fs0} % × ${Math.min(gained, sell).toFixed(1)}/${holdNow.toFixed(1)} (licence ${l})`; }
      }
    }
    if (best > 0.05) { out.set(fld, Math.round(best * 1000) / 1000); trace.push(how); }
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
// Same engine as the deal pages (V.stakeCashflow), so tax deductions from investments made before the deal – which the
// buyer takes over – are included; `inh` is their present value.
function hindsightValue(f, s, year) {
  let v = 0, inh = 0;
  for (const r of V.stakeCashflow(f, H, {}, data.lastFullYear, {}, year)) {
    const df = Math.pow(1 + RATE, -(r.year - year + 0.5));
    v += r.fcf * s * df; inh += (r.taxInh || 0) * s * df;
  }
  return { v, inh };
}

// Sodir fields that Feltverdi shows as one asset (e.g. Hugin, Munin, Fulla → Yggdrasil): a stake in a part
// counts as that part's weight of the merged field.
const PARTS = require('./merge-fields').partMap(data.fields);
function mergeParts(stakes) {
  const out = new Map();
  for (const [name, sh] of stakes) {
    const p = PARTS.get(name);
    const key = p ? p.name : name;
    out.set(key, (out.get(key) || 0) + (p ? sh * p.weight : sh));
  }
  return out;
}

function evalPackage(stakesIn, year, later = new Set()) {
  const stakes = mergeParts(stakesIn);
  let prod = 0, rem = 0, hindsight = 0, taxInh = 0, remNow = 0, prodAfter = 0;
  const items = [];
  for (const [name, sh] of stakes) {
    const f = byName.get(name); if (!f || sh <= 0) continue;
    const s = sh / 100;
    const p = f.prod.find((r) => r[0] === year - 1); const q = p ? p[5] * BOE * s : 0;
    const r0 = reservesAt(name, year - 1) * BOE * s;
    prod += q; rem += r0;
    const hv = hindsightValue(f, s, year);
    hindsight += hv.v; taxInh += hv.inh;
    prodAfter += f.prod.filter((r) => r[0] >= year && r[0] <= data.lastFullYear).reduce((t, r) => t + r[5] * BOE * s, 0);
    remNow += (f.rem ? f.rem.oe : 0) * BOE * s;
    items.push({ field: f.name, slug: f.slug, ...(later.has(name) ? { later: true } : {}), share: Math.round(sh * 1000) / 1000, prodKboed: Math.round(q / 0.365 * 10) / 10, remMmboe: Math.round(r0 * 10) / 10 });
  }
  return { prod, rem, hindsight, taxInh, remNow, prodAfter, items: items.sort((a, z) => z.remMmboe - a.remMmboe) };
}

const out = {};
for (const d of deals) {
  const spec = SPEC[d.id];
  if (!spec) continue;
  const date = new Date(d.date + 'T00:00:00Z'), year = +d.date.slice(0, 4);
  if (spec.legs) {
    const legs = spec.legs.map((L) => {
      const st = L.diff ? shareDiff(L.diff) : new Map(Object.entries(L.shares));
      const r = evalPackage(st, year);
      return { from: L.from, to: L.to, cash: L.cash || 0, note: L.note || null, items: r.items,
        prodKboed: Math.round(r.prod / 0.365 * 10) / 10, remMmboe: Math.round(r.rem * 10) / 10, hindsightValue: Math.round(r.hindsight), taxInheritedUsdM: Math.round(r.taxInh) };
    });
    out[d.id] = { year, swap: true, legs, brent: brent.get(year) ?? brent.get(year - 1), items: legs.flatMap((l) => l.items) };
    continue;
  }
  const stakes = spec.shares ? new Map(Object.entries(spec.shares)) : stakesAt(spec.sellers, date, spec.fields);
  const later = spec.shares ? new Map() : laterFields(spec.sellers, date, spec.fields, d.completed ? new Date(d.completed + 'T00:00:00Z') : null);
  for (const [k, v] of Object.entries(spec.extra || {})) later.set(k, v);
  for (const [k, v] of later) if (!stakes.has(k)) stakes.set(k, v);
  const { prod, rem, hindsight: fieldValue, taxInh, remNow, prodAfter, items } = evalPackage(stakes, year, new Set(later.keys()));
  if (!items.length) continue;
  // Adjusted price (shares valued at completion, tax assets taken out) when public; otherwise the headline price
  const price = spec.price ?? (d.priceAdjusted ? d.priceAdjusted.valueUsdM : d.valueUsdM);
  const realF = cpiNow / cpi.get(year);
  // Company tax positions bought with the company (e.g. losses carried forward), where public – value at the deal date
  const taxPos = d.taxPosition ? d.taxPosition.valueUsdM * realF : 0;
  const hindsight = fieldValue + taxPos * Math.pow(1 + RATE, -0.5); // booked in the deal year, mid-year like the deal pages
  const b = brent.get(year) ?? brent.get(year - 1);
  const m = {
    year, ...(ROLES[d.id] || {}), partial: !!spec.partial, note: spec.note || null, items,
    prodKboed: Math.round(prod / 0.365 * 10) / 10, remMmboe: Math.round(rem), brent: b,
    priceUsdM: price, headlineUsdM: d.valueUsdM, priceBasis: d.priceAdjusted ? d.priceAdjusted.basis : spec.price != null ? 'estimate' : 'headline', priceReal: price != null ? Math.round(price * realF) : null,
    perFlowing: price != null && prod > 0 ? Math.round(price * 1e6 / (prod / 0.365 * 1000)) : null,
    perBoe: price != null && rem > 0 ? Math.round(price / rem * 100) / 100 : null,
    perBoePctBrent: price != null && rem > 0 && b ? Math.round(price / rem / b * 1000) / 10 : null,
    hindsightValue: Math.round(hindsight), // real USD of the CPI base year, at the deal year (incl. tax deductions taken over)
    taxInheritedUsdM: Math.round(taxInh), // PV of deductions from the seller's past investments in the stakes
    taxPositionUsdM: taxPos ? Math.round(taxPos) : 0, // company tax positions (real)
    ratio: price != null && hindsight > 0 ? Math.round(price * realF / hindsight * 100) / 100 : null,
    reserveGrowth: rem > 0 ? Math.round((prodAfter + remNow) / rem * 100) / 100 : null,
  };
  out[d.id] = m;
}
// Baseline: median price/value ratio of complete packages with a disclosed price. Systematic model gaps (upside,
// buyers' price decks and required returns) affect all deals alike, so each deal is judged relative to this.
// Deals marked 'early' (value depends on things not yet in Sodir's reserves) do not set the norm.
const verdictOf = (id) => (deals.find((x) => x.id === id) || {}).assessment?.verdict;
const ratios = Object.entries(out).filter(([id, m]) => m.ratio && !m.partial && verdictOf(id) !== 'early').map(([, m]) => m.ratio).sort((a, b) => a - b);
const baseline = ratios.length ? (ratios.length % 2 ? ratios[(ratios.length - 1) / 2] : (ratios[ratios.length / 2 - 1] + ratios[ratios.length / 2]) / 2) : 1;
for (const m of Object.values(out)) m.relative = m.ratio && !m.partial ? Math.round(m.ratio / baseline * 100) / 100 : null;
fs.writeFileSync(path.join(root, 'public', 'data', 'deal-metrics.json'), JSON.stringify({ generated: new Date().toISOString().slice(0, 10), baseYear: H.cpiBaseYear, discount: RATE, baseline: Math.round(baseline * 100) / 100, n: ratios.length, metrics: out }, null, 1));
if (trace.length) console.log('Later fields:\n  ' + trace.join('\n  '));
for (const [id, m] of Object.entries(out)) {
  if (m.swap) { console.log(`${id.padEnd(28)} swap ` + m.legs.map((l) => `${l.from}→${l.to}: ${l.items.map((i) => i.field + ' ' + i.share + '%').join(', ')} value ${l.hindsightValue} cash ${l.cash}`).join(' | ')); continue; }
  console.log(`${id.padEnd(28)} prod ${String(m.prodKboed).padStart(6)} kboe/d  rem ${String(m.remMmboe).padStart(5)} MMboe  Brent ${m.brent}  price ${m.priceUsdM ?? '-'} (real ${m.priceReal ?? '-'})  $/flow ${m.perFlowing ?? '-'}  $/boe ${m.perBoe ?? '-'} (${m.perBoePctBrent ?? '-'}% Brent)  hindsight ${m.hindsightValue} (tax ${m.taxInheritedUsdM}+${m.taxPositionUsdM})  ratio ${m.ratio ?? '-'}  growth ${m.reserveGrowth}`);
}
