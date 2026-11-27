// Fields that Sodir lists separately but that are developed and known as one asset.
// Each merge replaces its parts with a single field: production, investments and reserves are summed,
// and owner shares are weighted by each part's recoverable volumes (remaining, if none are recoverable yet).
const MERGES = [
  {
    name: 'Yggdrasil', slug: 'yggdrasil',
    parts: ['HUGIN', 'MUNIN', 'FULLA', 'HUGIN SATELLITTER'], // Sodir names
    statusText: 'Yggdrasil is the joint development of the Hugin, Munin, Fulla and Hugin Satellites fields, operated by Aker BP, with a shared processing platform and power from shore. Production is planned to start in 2027. Feltverdi shows the four Sodir fields as one asset; owner shares are weighted by each field\'s recoverable volumes.',
  },
];

const r3 = (v) => Math.round(v * 1000) / 1000;
const sumYears = (lists) => {
  const m = new Map();
  for (const list of lists) for (const row of list) {
    const cur = m.get(row[0]) || row.map((v, i) => (i === 0 ? v : 0));
    for (let i = 1; i < row.length; i++) cur[i] = r3(cur[i] + row[i]);
    m.set(row[0], cur);
  }
  return [...m.values()].sort((a, b) => a[0] - b[0]);
};
const sumVol = (vols) => {
  const keys = ['oil', 'gas', 'ngl', 'cond', 'oe'];
  if (vols.every((v) => !v)) return null;
  return Object.fromEntries(keys.map((k) => [k, r3(vols.reduce((s, v) => s + (v ? v[k] : 0), 0))]));
};
// Facility profiles of the parts added together; the merged field is a tie-back only if every part is one
function mergeFac(list) {
  const ps = list.filter(Boolean);
  if (!ps.length) return null;
  const own = {}, wells = { platform: 0, subsea: 0 };
  for (const p of ps) { for (const k in p.own) own[k] = (own[k] || 0) + p.own[k]; wells.platform += p.wells.platform; wells.subsea += p.wells.subsea; }
  return { own, wells, tieback: ps.every((p) => p.tieback), host: ps.every((p) => p.tieback) ? ps[0].host : null };
}
const STATUS_ORDER = ['Producing', 'Approved for production', 'Shut down'];

// fields: the list built from Sodir (names in title case); `upper` maps a field to its Sodir name.
function applyMerges(fields, upper = (f) => f.name.toUpperCase()) {
  let out = fields;
  for (const m of MERGES) {
    const parts = out.filter((f) => m.parts.includes(upper(f)));
    if (parts.length < 2) continue;
    const w = parts.map((f) => (f.rec && f.rec.oe) || (f.rem && f.rem.oe) || 0);
    const wSum = w.reduce((s, v) => s + v, 0) || parts.length;
    const wt = (i) => (w.reduce((s, v) => s + v, 0) ? w[i] / wSum : 1 / parts.length);
    const owners = new Map();
    parts.forEach((f, i) => { for (const [c, s] of f.owners) owners.set(c, (owners.get(c) || 0) + s * wt(i)); });
    const main = parts.reduce((a, b, i) => (w[i] > w[parts.indexOf(a)] ? b : a), parts[0]);
    const merged = {
      id: 'merged-' + m.slug, name: m.name, slug: m.slug,
      status: STATUS_ORDER.find((s) => parts.some((f) => f.status === s)) || main.status,
      area: main.area, hc: main.hc,
      operator: main.operator, discovered: Math.min(...parts.map((f) => f.discovered || 9999)),
      lat: r3(parts.reduce((s, f, i) => s + f.lat * wt(i), 0)), lon: r3(parts.reduce((s, f, i) => s + f.lon * wt(i), 0)),
      url: main.url,
      approved: Math.min(...parts.map((f) => f.approved || 9999)) < 9999 ? Math.min(...parts.map((f) => f.approved || 9999)) : null,
      invExp: parts.some((f) => f.invExp) ? { mnok: parts.reduce((s, f) => s + (f.invExp ? f.invExp.mnok : 0), 0), year: Math.max(...parts.map((f) => (f.invExp ? f.invExp.year : 0))) } : null,
      resYear: Math.max(...parts.map((f) => f.resYear || 0)) || null,
      rem: sumVol(parts.map((f) => f.rem)), rec: sumVol(parts.map((f) => f.rec)),
      prod: sumYears(parts.map((f) => f.prod)), inv: sumYears(parts.map((f) => f.inv)),
      owners: [...owners].map(([c, s]) => [c, r3(s)]).sort((a, b) => b[1] - a[1]),
      statusText: m.statusText,
      outlook: { plateau: null },
      fac: mergeFac(parts.map((f) => f.fac)),
      parts: parts.map((f) => ({ name: f.name, url: f.url, share: r3(wt(parts.indexOf(f)) * 100) })),
    };
    out = out.filter((f) => !parts.includes(f)).concat(merged);
  }
  return out;
}

// Sodir field name → { merged field name, weight of that part } (for scripts that read Sodir tables by field name)
function partMap(fields) {
  const map = new Map();
  for (const m of MERGES) {
    const merged = fields.find((f) => f.slug === m.slug);
    if (!merged || !merged.parts) continue;
    for (const p of merged.parts) map.set(p.name.toUpperCase(), { name: m.name.toUpperCase(), weight: p.share / 100 });
  }
  return map;
}

module.exports = { MERGES, applyMerges, partMap };
