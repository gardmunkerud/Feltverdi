// Minimal, dependency-free .xlsx reader (enough for simple numeric/text sheets such as the World Bank Pink Sheet).
// Reads the ZIP central directory, inflates the needed XML parts with zlib and parses cells with regular expressions.
const zlib = require('zlib');

function unzip(buf) {
  // find End Of Central Directory record
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error('Not a zip file');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const files = new Map();
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('Bad central directory');
    const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28), elen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen);
    files.set(name, { method, csize, local });
    p += 46 + nlen + elen + clen;
  }
  return (name) => {
    const f = files.get(name);
    if (!f) return null;
    const lnlen = buf.readUInt16LE(f.local + 26), lelen = buf.readUInt16LE(f.local + 28);
    const start = f.local + 30 + lnlen + lelen;
    const data = buf.subarray(start, start + f.csize);
    return (f.method === 8 ? zlib.inflateRawSync(data) : data).toString('utf8');
  };
}

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

function colIndex(ref) {
  const letters = ref.match(/^[A-Z]+/)[0];
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/** Returns { sheetNames: [...], rows(sheetName) -> array of arrays } */
function readXlsx(buf) {
  const get = unzip(buf);
  const wb = get('xl/workbook.xml');
  const rels = get('xl/_rels/workbook.xml.rels');
  const relMap = new Map([...rels.matchAll(/<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)].map((m) => [m[1], m[2]]));
  const sheets = [...wb.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)].map((m) => ({ name: decode(m[1]), target: relMap.get(m[2]) }));
  const ssXml = get('xl/sharedStrings.xml') || '';
  const shared = [...ssXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => decode([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join('')));
  return {
    sheetNames: sheets.map((s) => s.name),
    rows(name) {
      const s = sheets.find((x) => x.name === name);
      if (!s) return null;
      const path = s.target.startsWith('/') ? s.target.slice(1) : 'xl/' + s.target.replace(/^\.\//, '');
      const xml = get(path);
      const out = [];
      for (const rm of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
        const row = [];
        for (const cm of rm[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
          const [, ref, attrs, inner = ''] = cm;
          const type = (attrs.match(/t="([^"]+)"/) || [])[1];
          const v = (inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
          let val = null;
          if (type === 's') val = shared[+v];
          else if (type === 'inlineStr') val = decode((inner.match(/<t[^>]*>([\s\S]*?)<\/t>/) || [])[1] || '');
          else if (v != null) val = isNaN(+v) ? decode(v) : +v;
          row[colIndex(ref)] = val;
        }
        out.push(row);
      }
      return out;
    },
  };
}

module.exports = { readXlsx };
