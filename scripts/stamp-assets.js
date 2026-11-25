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
fs.writeFileSync(indexPath, html);
console.log(`Stamped ${n} asset references in public/index.html`);
