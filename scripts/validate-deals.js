// Quality check for public/data/deals.json. Run before every commit that changes deals (also part of `npm test`).
// Errors block a commit; warnings are printed for a human to look at.
// Usage: node scripts/validate-deals.js   (exit code 1 if there are errors)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const TYPES = ['merger', 'corporate', 'asset', 'swap'];
const STATUS = ['pending', 'completed'];
const VERDICTS = ['cheap', 'fair', 'full', 'expensive', 'early', 'na'];
const MODELLED = ['cheap', 'fair', 'full', 'expensive']; // these need numbers in deal-metrics.json
const CONF = ['low', 'medium', 'high'];
const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z'));
const isText = (s) => typeof s === 'string' && s.trim().length > 0;
const bothLangs = (o) => o && isText(o.nb) && isText(o.en);
const norm = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').replace(/[^a-z0-9]+/g, ' ').trim();

function validate(dealsFile = path.join(root, 'public', 'data', 'deals.json')) {
  const errors = [], warnings = [];
  let j;
  try { j = JSON.parse(fs.readFileSync(dealsFile, 'utf8')); } catch (e) { return { errors: [`deals.json is not valid JSON: ${e.message}`], warnings }; }
  const fields = JSON.parse(fs.readFileSync(path.join(root, 'public', 'data', 'fields.json'), 'utf8')).fields;
  const fieldNames = new Set(fields.map((f) => norm(f.name)));
  let metrics = {};
  try { metrics = JSON.parse(fs.readFileSync(path.join(root, 'public', 'data', 'deal-metrics.json'), 'utf8')).metrics || {}; } catch { /* metrics optional */ }
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);

  if (!isDate(j.updated)) errors.push('"updated" must be a date (YYYY-MM-DD)');
  if (!Array.isArray(j.deals) || !j.deals.length) return { errors: [...errors, '"deals" must be a non-empty list'], warnings };

  const ids = new Set();
  j.deals.forEach((d, i) => {
    const at = `deal ${d && d.id ? d.id : '#' + i}`;
    const err = (m) => errors.push(`${at}: ${m}`);
    const warn = (m) => warnings.push(`${at}: ${m}`);
    if (!d || typeof d !== 'object') return err('not an object');
    if (!/^\d{4}-[a-z0-9-]+$/.test(d.id || '')) err('id must look like "2026-buyer-seller" (lowercase, digits, hyphens)');
    else if (ids.has(d.id)) err('duplicate id'); else ids.add(d.id);
    if (!isDate(d.date)) err('date must be YYYY-MM-DD');
    else {
      if (d.id && !d.id.startsWith(d.date.slice(0, 4))) err('id must start with the year of the date');
      if (d.date > tomorrow) err('date is in the future');
    }
    if (d.datePrecision != null && !['day', 'month'].includes(d.datePrecision)) err('datePrecision must be "day" or "month"');
    if (!TYPES.includes(d.type)) err(`type must be one of ${TYPES.join(', ')}`);
    if (!STATUS.includes(d.status)) err(`status must be one of ${STATUS.join(', ')}`);
    if (d.completed != null && (!isDate(d.completed) || (isDate(d.date) && d.completed < d.date))) err('completed must be a date on or after the announcement');
    if (!Array.isArray(d.parties) || d.parties.length < 2 || !d.parties.every(isText)) err('parties must list at least two companies');
    if (!bothLangs(d.title)) err('title needs nb and en');
    if (!bothLangs(d.summary)) err('summary needs nb and en');
    if (!bothLangs(d.valueNote)) err('valueNote needs nb and en');
    if (!Array.isArray(d.fields) || !d.fields.every(isText)) err('fields must be a list of field names (may be empty)');
    else for (const f of d.fields) if (!fieldNames.has(norm(f))) warn(`field "${f}" is not a Sodir field name (it will show without a link)`);
    if (d.valueUsdM !== null && !(typeof d.valueUsdM === 'number' && d.valueUsdM > 0 && d.valueUsdM < 200000)) err('valueUsdM must be null or a positive number in USD million');
    if (typeof d.source !== 'string' || !/^https:\/\/[^\s"<>]+$/.test(d.source)) err('source must be an https link');
    const a = d.assessment;
    if (!a) err('assessment is missing');
    else {
      if (!VERDICTS.includes(a.verdict)) err(`assessment.verdict must be one of ${VERDICTS.join(', ')}`);
      if (!CONF.includes(a.confidence)) err(`assessment.confidence must be one of ${CONF.join(', ')}`);
      if (!bothLangs(a.text)) err('assessment.text needs nb and en');
      if (MODELLED.includes(a.verdict) && !metrics[d.id]) err(`verdict "${a.verdict}" needs calculated metrics (run scripts/evaluate-deals.js); use "early" or "na" otherwise`);
    }
    const texts = [d.title, d.summary, d.valueNote, a && a.text].filter(Boolean).flatMap((o) => [o.nb, o.en]);
    if (texts.some((s) => /<\s*\/?\s*(script|iframe|img|a)\b|javascript:/i.test(String(s)))) err('texts must be plain text (no HTML)');
    if (d.upside != null && !(Array.isArray(d.upside) && d.upside.every((u) => isText(u.slug) && typeof u.remAdd === 'number' && bothLangs(u.label)))) err('upside entries need slug, remAdd and label nb/en');
    if (d.views != null && !(typeof d.views === 'object' && bothLangs(d.views.note))) err('views needs a note in nb and en');
    if (d.priceAdjusted != null) {
      const pa = d.priceAdjusted;
      if (!(typeof pa.valueUsdM === 'number' && pa.valueUsdM > 0)) err('priceAdjusted.valueUsdM must be a positive number');
      if (!['shares-at-completion', 'completion', 'tax-assets'].includes(pa.basis)) err('priceAdjusted.basis must be shares-at-completion, completion or tax-assets');
      if (!bothLangs(pa.note)) err('priceAdjusted.note needs nb and en');
      if (!Array.isArray(pa.sources) || !pa.sources.length || !pa.sources.every((u) => /^https:\/\/[^\s"<>]+$/.test(u))) err('priceAdjusted.sources must list https links');
    }
    // Company tax positions bought with the company (losses carried forward etc.): value at the deal date, USD million
    if (d.taxPosition != null) {
      const tp = d.taxPosition;
      if (!(typeof tp.valueUsdM === 'number' && tp.valueUsdM > 0)) err('taxPosition.valueUsdM must be a positive number');
      if (!bothLangs(tp.note)) err('taxPosition.note needs nb and en');
      if (!Array.isArray(tp.sources) || !tp.sources.length || !tp.sources.every((u) => /^https:\/\/[^\s"<>]+$/.test(u))) err('taxPosition.sources must list https links');
    }
  });

  // The same deal twice: same parties (any order) announced within 45 days of each other.
  const key = (d) => (d.parties || []).map(norm).sort().join('|');
  for (let x = 0; x < j.deals.length; x++) {
    for (let y = x + 1; y < j.deals.length; y++) {
      const a = j.deals[x], b = j.deals[y];
      if (!isDate(a.date) || !isDate(b.date) || key(a) !== key(b)) continue;
      const days = Math.abs(Date.parse(a.date) - Date.parse(b.date)) / 864e5;
      const sameFields = (a.fields || []).some((f) => (b.fields || []).map(norm).includes(norm(f)));
      if (days <= 45 && (sameFields || (!a.fields.length && !b.fields.length))) errors.push(`deals ${a.id} and ${b.id} look like the same deal (same parties, ${Math.round(days)} days apart)`);
    }
  }
  return { errors, warnings };
}

if (require.main === module) {
  const { errors, warnings } = validate();
  for (const w of warnings) console.log('warning: ' + w);
  for (const e of errors) console.log('ERROR:   ' + e);
  console.log(errors.length ? `\n${errors.length} error(s) – fix before committing.` : `\ndeals.json OK (${warnings.length} warning(s)).`);
  process.exit(errors.length ? 1 : 0);
}

module.exports = { validate };
