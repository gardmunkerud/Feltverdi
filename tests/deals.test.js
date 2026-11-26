// deals.json must pass the quality check (scripts/validate-deals.js) before anything is committed.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { validate } = require('../scripts/validate-deals.js');

test('deals.json passes the quality check', () => {
  const { errors } = validate();
  assert.deepEqual(errors, []);
});

test('the quality check catches broken deals', () => {
  const good = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'deals.json'), 'utf8'));
  const bad = structuredClone(good);
  const d = bad.deals[0];
  bad.deals.push({ ...structuredClone(d) }); // duplicate id and same deal
  bad.deals.push({ ...structuredClone(d), id: '2026-broken', source: 'http://insecure.example', title: { nb: '', en: 'x' }, assessment: { verdict: 'cheap', confidence: 'low', text: { nb: 'a', en: '<script>x</script>' } } });
  const file = path.join(os.tmpdir(), `fv-deals-${process.pid}.json`);
  fs.writeFileSync(file, JSON.stringify(bad));
  try {
    const { errors } = validate(file);
    const all = errors.join('\n');
    assert.match(all, /duplicate id/);
    assert.match(all, /look like the same deal/);
    assert.match(all, /source must be an https link/);
    assert.match(all, /title needs nb and en/);
    assert.match(all, /needs calculated metrics/);
    assert.match(all, /plain text/);
  } finally { fs.unlinkSync(file); }
});
