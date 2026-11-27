// Cache-busting: adds ?v=<content hash> to the local CSS/JS references in public/index.html,
// so browsers always fetch the new version after a deploy. Runs as part of `npm run build`.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const pub = path.join(__dirname, '..', 'public');
const indexPath = path.join(pub, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
let n = 0;
html = html.replace(/(<(?:script|link)\b[^>]*?\s(?:src|href)=")(\/(?:js|css|vendor)\/[^"?]+)(?:\?v=[a-f0-9]+)?(")/g, (m, pre, url, post) => {
  const file = path.join(pub, url);
  if (!fs.existsSync(file)) return m;
  const hash = crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 10);
  n++;
  return `${pre}${url}?v=${hash}${post}`;
});
// Data version: one hash over the data files the app loads. app.js adds it as ?v= to every /data request, so a deploy
// never mixes new code with cached old data (or deals.json with an older deal-metrics.json).
const DATA = ['fields.json', 'coast.json', 'history.json', 'deals.json', 'deal-metrics.json'];
const dh = crypto.createHash('sha1');
for (const f of DATA) { const p = path.join(pub, 'data', f); if (fs.existsSync(p)) dh.update(fs.readFileSync(p)); }
const dataVersion = dh.digest('hex').slice(0, 10);
const meta = `<meta name="fv-data-version" content="${dataVersion}">`;
if (/<meta name="fv-data-version" content="[a-f0-9]*">/.test(html)) html = html.replace(/<meta name="fv-data-version" content="[a-f0-9]*">/, meta);
else html = html.replace(/(<meta charset="utf-8">)(\r?\n)/, (m, c, nl) => `${c}${nl}  ${meta}${nl}`);
if (!html.includes(meta)) throw new Error('could not add the data version to index.html');
fs.writeFileSync(indexPath, html);
console.log(`Stamped ${n} asset references and data version ${dataVersion} in public/index.html`);
