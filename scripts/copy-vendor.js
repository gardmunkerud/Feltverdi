// Copies browser libraries from node_modules into public/vendor, so public/ can be hosted as a plain static site.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'public', 'vendor');
const nm = (...p) => path.join(root, 'node_modules', ...p);

function copy(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}
function copyDir(src, dest, filter = () => true) {
  fs.mkdirSync(dest, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f);
    const d = path.join(dest, f);
    if (fs.statSync(s).isDirectory()) copyDir(s, d, filter);
    else if (filter(f)) copy(s, d);
  }
}

try {
  copy(nm('chart.js', 'dist', 'chart.umd.js'), path.join(out, 'chart.umd.js'));
  copy(nm('leaflet', 'dist', 'leaflet.js'), path.join(out, 'leaflet', 'leaflet.js'));
  copy(nm('leaflet', 'dist', 'leaflet.css'), path.join(out, 'leaflet', 'leaflet.css'));
  copyDir(nm('leaflet', 'dist', 'images'), path.join(out, 'leaflet', 'images'));
  // Inter (variable font, latin + latin-ext covers æøå)
  const inter = nm('@fontsource-variable', 'inter', 'files');
  copyDir(inter, path.join(out, 'inter'), (f) => /inter-(latin|latin-ext)-wght-normal\.woff2$/.test(f));
  console.log('Vendor files copied to public/vendor');
} catch (e) {
  console.error('Could not copy vendor files:', e.message);
  process.exitCode = 1;
}
