// Fetches open data from the Norwegian Offshore Directorate (Sodir FactPages) and writes public/data/fields.json.
// Data licence: Norwegian Licence for Open Government Data (NLOD). Run: npm run build:data
const fs = require('fs');
const path = require('path');

const BASE = 'https://factpages.sodir.no/public?/Factpages/external/tableview/';
const QS = '&rs:Command=Render&rc:Toolbar=false&rc:Parameters=f&IpAddress=not_used&CultureCode=en&rs:Format=CSV&Top100=false';
const TABLES = ['field', 'field_reserves', 'field_production_yearly', 'field_investment_yearly', 'field_licensee_hst', 'wellbore_exploration_all', 'field_description', 'licence_licensee_hst', 'discovery'];

// Production outlook from Sodir's "Status" description text.
// 'plateau' = Sodir describes the field as on plateau / stable / capacity-limited; 'off' = explicitly off plateau.
const MANUAL_OUTLOOK = {
  // Troll: Sodir does not use the word plateau, but describes capacity-limited gas production with measures to
  // increase gas capacity and a new gas export route (2025) – i.e. production is held up by capacity, not reservoir.
  TROLL: { plateau: 'plateau', basis: 'capacity' },
};
function outlookFrom(name, text) {
  if (MANUAL_OUTLOOK[name]) return MANUAL_OUTLOOK[name];
  if (!text) return { plateau: null };
  if (/(off|come off|went off|gone off) plateau/i.test(text)) return { plateau: 'off', basis: 'text' };
  const late = /late phase|on decline|is declining|tail production/i.test(text);
  if (/\bplateau\b/i.test(text) && !late) return { plateau: 'plateau', basis: 'text' };
  if (!late && /(stable production|stable on plateau|in accordance with the reserved capacity|secure stable production)/i.test(text)) return { plateau: 'plateau', basis: 'stable' };
  return { plateau: null };
}
const RAW = path.join(__dirname, '..', 'data', 'raw');
const OUT = path.join(__dirname, '..', 'public', 'data', 'fields.json');

// Minimal RFC 4180 CSV parser (handles quoted fields with commas, quotes and newlines)
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

async function fetchTable(name, useCache) {
  const file = path.join(RAW, name + '.csv');
  if (useCache && fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  const res = await fetch(BASE + name + QS, { headers: { 'User-Agent': 'feltverdi-data-build' } });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const text = (await res.text()).replace(/^﻿/, '');
  fs.mkdirSync(RAW, { recursive: true });
  fs.writeFileSync(file, text);
  return text;
}

const num = (s) => { const v = parseFloat(String(s).replace(',', '.')); return Number.isFinite(v) ? v : 0; };
const r3 = (v) => Math.round(v * 1000) / 1000;
const slugify = (s) => s.toLowerCase().normalize('NFKD')
  .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const titleCase = (s) => s.toLowerCase().replace(/(^|[\s\-/(])([a-zæøå])/g, (m, a, b) => a + b.toUpperCase());

async function main() {
  const useCache = process.argv.includes('--cache');
  const t = {};
  for (const name of TABLES) {
    t[name] = parseCsv(await fetchTable(name, useCache));
    console.log(`${name}: ${t[name].length} rows`);
  }
  const thisYear = new Date().getFullYear();
  const lastFullYear = thisYear - 1;

  const coords = new Map(t.wellbore_exploration_all.map((w) => [w.wlbWellboreName, [num(w.wlbNsDecDeg), num(w.wlbEwDecDeg)]]));

  // latest reserve estimate per field
  const reserves = new Map();
  for (const r of t.field_reserves) {
    const prev = reserves.get(r.fldNpdidField);
    if (!prev || num(r.fldVersion) > num(prev.fldVersion)) reserves.set(r.fldNpdidField, r);
  }
  const prod = new Map();
  for (const p of t.field_production_yearly) {
    const y = num(p.prfYear);
    if (y > lastFullYear) continue; // full history (needed for the historical value page)
    const k = p.prfNpdidInformationCarrier;
    if (!prod.has(k)) prod.set(k, []);
    prod.get(k).push([y, r3(num(p.prfPrdOilNetMillSm3)), r3(num(p.prfPrdGasNetBillSm3)), r3(num(p.prfPrdNGLNetMillSm3)), r3(num(p.prfPrdCondensateNetMillSm3)), r3(num(p.prfPrdOeNetMillSm3))]);
  }
  const inv = new Map();
  for (const i of t.field_investment_yearly) {
    const y = num(i.prfYear), v = num(i.prfInvestmentsMillNOK);
    if (y > lastFullYear || !v) continue; // full history, nominal NOK million
    const k = i.prfNpdidInformationCarrier;
    if (!inv.has(k)) inv.set(k, []);
    inv.get(k).push([y, Math.round(v)]);
  }
  const owners = new Map();
  for (const l of t.field_licensee_hst) {
    if (l.fldLicenseeTo) continue; // current licensees only
    const k = l.fldNpdidField;
    if (!owners.has(k)) owners.set(k, new Map());
    const m = owners.get(k);
    m.set(l.cmpLongName, (m.get(l.cmpLongName) || 0) + num(l.fldCompanyShare));
  }

  const statusText = new Map(t.field_description.filter((d) => d.fldDescriptionHeading === 'Status').map((d) => [d.fldNpdidField, d.fldDescriptionText.replace(/\s+/g, ' ').trim()]));

  const fields = [];
  for (const f of t.field) {
    const id = f.fldNpdidField;
    const res = reserves.get(id);
    const [lat, lon] = coords.get(f.wlbName) || [0, 0];
    const rem = res ? { oil: num(res.fldRemainingOil), gas: num(res.fldRemainingGas), ngl: num(res.fldRemainingNGL), cond: num(res.fldRemainingCondensate), oe: num(res.fldRemainingOE) } : null;
    const rec = res ? { oil: num(res.fldRecoverableOil), gas: num(res.fldRecoverableGas), ngl: num(res.fldRecoverableNGL), cond: num(res.fldRecoverableCondensate), oe: num(res.fldRecoverableOE) } : null;
    const own = [...(owners.get(id) || new Map())].map(([c, s]) => [c, Math.round(s * 1000) / 1000]).sort((a, b) => b[1] - a[1]);
    fields.push({
      id, name: titleCase(f.fldName), slug: slugify(f.fldName),
      status: f.fldCurrentActivitySatus, area: f.fldMainArea.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
      hc: f.fldHcType, operator: f.cmpLongName, discovered: num((f.wlbCompletionDate || '').slice(-4)) || null,
      lat: r3(lat), lon: r3(lon), url: f.fldFactPageUrl,
      resYear: res ? num(res.fldVersion) : null, rem, rec,
      prod: (prod.get(id) || []).sort((a, b) => a[0] - b[0]),
      inv: (inv.get(id) || []).sort((a, b) => a[0] - b[0]),
      owners: own,
      statusText: statusText.get(id) || '',
      outlook: outlookFrom(f.fldName, statusText.get(id)),
    });
  }
  fields.sort((a, b) => a.name.localeCompare(b.name, 'nb'));
  const out = { generated: new Date().toISOString().slice(0, 10), lastFullYear, source: 'Sokkeldirektoratet (Sodir) FactPages, NLOD', fields };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out));
  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log(`Wrote ${fields.length} fields to public/data/fields.json (${kb} kB); producing: ${fields.filter((f) => f.status === 'Producing').length}`);
  console.log('Plateau per Sodir:', fields.filter((f) => f.outlook.plateau === 'plateau').map((f) => `${f.name} (${f.outlook.basis})`).join(', '));
  console.log('Off plateau:', fields.filter((f) => f.outlook.plateau === 'off').map((f) => f.name).join(', '));
  await buildCoast(useCache);
  await buildHistory(useCache, lastFullYear);
}

// ---------- Historical prices, exchange rates and inflation (for the "Historisk" page) ----------
// World Bank Commodity Price Data (Pink Sheet), annual nominal: Crude oil Brent ($/bbl) and Natural gas Europe ($/mmbtu)
const WB_URL = 'https://thedocs.worldbank.org/en/doc/18675f1d1639c7a34d463f59263ba0a2-0050012025/related/CMO-Historical-Data-Annual.xlsx';
// US CPI-U, all items (BLS), via FRED – used to express everything in real 2026 dollars
const CPI_URL = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPIAUCSL';
// Norges Bank official exchange rates, annual average USD/NOK
const FX_URL = 'https://data.norges-bank.no/api/data/EXR/A.USD.NOK.SP?format=csv&startPeriod=1960&locale=en';

async function fetchRaw(name, url, useCache, binary = false) {
  const file = path.join(RAW, name);
  if (useCache && fs.existsSync(file)) return binary ? fs.readFileSync(file) : fs.readFileSync(file, 'utf8');
  const res = await fetch(url, { headers: { 'User-Agent': 'feltverdi-data-build' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(file, buf);
  return binary ? buf : buf.toString('utf8');
}

async function buildHistory(useCache, lastFullYear) {
  const { readXlsx } = require('./xlsx-lite');
  const wb = readXlsx(await fetchRaw('wb.xlsx', WB_URL, useCache, true));
  const rows = wb.rows('Annual Prices (Nominal)');
  const names = rows.find((r) => r.includes('Crude oil, Brent'));
  const ib = names.indexOf('Crude oil, Brent'), ig = names.indexOf('Natural gas, Europe');
  const updated = (rows.find((r) => typeof r[0] === 'string' && /^Updated on/i.test(r[0])) || [''])[0].replace(/^Updated on\s*/i, '');
  const prices = rows.filter((r) => /^\d{4}$/.test(String(r[0])) && +r[0] >= 1960 && +r[0] <= lastFullYear)
    .map((r) => [+r[0], Math.round(+r[ib] * 100) / 100, Math.round(+r[ig] * 100) / 100]);

  const cpiRows = (await fetchRaw('fred_cpi.csv', CPI_URL, useCache)).trim().split(/\r?\n/).slice(1).map((l) => l.split(','));
  const byYear = new Map();
  for (const [d, v] of cpiRows) { const y = +d.slice(0, 4); if (!byYear.has(y)) byYear.set(y, []); byYear.get(y).push(+v); }
  const cpi = [...byYear.entries()].filter(([y]) => y >= 1960).map(([y, v]) => [y, Math.round(v.reduce((s, x) => s + x, 0) / v.length * 1000) / 1000]);
  const cpiLast = cpiRows[cpiRows.length - 1][0];

  const fxText = (await fetchRaw('nb_usdnok.csv', FX_URL, useCache)).trim().split(/\r?\n/);
  const h = fxText[0].split(';'), iy = h.indexOf('TIME_PERIOD'), iv = h.indexOf('OBS_VALUE');
  const usdnok = fxText.slice(1).map((l) => l.split(';')).map((c) => [+c[iy], +c[iv]]).filter(([y, v]) => y && v);

  const cpiBaseYear = Math.max(...cpi.map((c) => c[0]));
  const out = {
    generated: new Date().toISOString().slice(0, 10), cpiBaseYear, prices, usdnok, cpi,
    sources: [
      { key: 'prices', name: 'World Bank – Commodity Price Data (The Pink Sheet), annual prices, nominal US dollars', series: 'Crude oil, UK Brent 38° API ($/bbl); Natural gas, Europe ($/mmbtu) – import border price, from April 2015 Netherlands TTF', url: 'https://www.worldbank.org/en/research/commodity-markets', note: `Updated ${updated}` },
      { key: 'fx', name: 'Norges Bank – official exchange rates, annual average', series: 'USD/NOK (EXR A.USD.NOK.SP)', url: 'https://www.norges-bank.no/en/topics/Statistics/exchange_rates/', note: '' },
      { key: 'cpi', name: 'U.S. Bureau of Labor Statistics – Consumer Price Index (CPI-U, all items), via FRED, Federal Reserve Bank of St. Louis', series: 'CPIAUCSL, annual average', url: 'https://fred.stlouisfed.org/series/CPIAUCSL', note: `Latest observation ${cpiLast}` },
      { key: 'sodir', name: 'Sokkeldirektoratet (Sodir) FactPages', series: 'Production per field (Sm³), investments per field (NOK million, nominal)', url: 'https://factpages.sodir.no', note: 'NLOD' },
    ],
  };
  fs.writeFileSync(path.join(path.dirname(OUT), 'history.json'), JSON.stringify(out));
  console.log(`Wrote history: prices ${prices[0][0]}–${prices[prices.length - 1][0]}, USD/NOK ${usdnok[0][0]}–${usdnok[usdnok.length - 1][0]}, CPI ${cpi[0][0]}–${cpiBaseYear} (base ${cpiBaseYear})`);
}

// Base map: country outlines from Natural Earth 1:50m (public domain), clamped to the North Atlantic/Barents window.
const COAST_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson';
const COUNTRIES = new Set(['NOR', 'SWE', 'FIN', 'DNK', 'GBR', 'IRL', 'ISL', 'FRO', 'DEU', 'NLD', 'BEL', 'FRA', 'POL', 'EST', 'LVA', 'LTU', 'RUS', 'GRL', 'SJM']);
const BOX = { w: -30, e: 50, s: 46, n: 83 };
async function buildCoast(useCache) {
  const file = path.join(RAW, 'countries.geojson');
  let text;
  if (useCache && fs.existsSync(file)) text = fs.readFileSync(file, 'utf8');
  else {
    const res = await fetch(COAST_URL, { headers: { 'User-Agent': 'feltverdi-data-build' } });
    if (!res.ok) throw new Error('countries: HTTP ' + res.status);
    text = await res.text();
    fs.writeFileSync(file, text);
  }
  const gj = JSON.parse(text);
  const clampRing = (ring) => {
    const out = [];
    for (const [x, y] of ring) {
      const p = [Math.round(Math.min(BOX.e, Math.max(BOX.w, x)) * 100) / 100, Math.round(Math.min(BOX.n, Math.max(BOX.s, y)) * 100) / 100];
      const prev = out[out.length - 1];
      if (!prev || prev[0] !== p[0] || prev[1] !== p[1]) out.push(p);
    }
    return out;
  };
  const inBox = (poly) => poly[0].some(([x, y]) => x > BOX.w && x < BOX.e && y > BOX.s && y < BOX.n);
  const features = [];
  for (const f of gj.features) {
    const iso = f.properties.ADM0_A3 || f.properties.ISO_A3;
    if (!COUNTRIES.has(iso)) continue;
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const kept = polys.filter(inBox).map((poly) => poly.map(clampRing)).filter((poly) => poly[0].length > 3);
    if (kept.length) features.push({ type: 'Feature', properties: { iso }, geometry: { type: 'MultiPolygon', coordinates: kept } });
  }
  const outFile = path.join(path.dirname(OUT), 'coast.json');
  fs.writeFileSync(outFile, JSON.stringify({ type: 'FeatureCollection', features }));
  console.log(`Wrote base map with ${features.length} countries (${(fs.statSync(outFile).size / 1024).toFixed(0)} kB)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
