// Facility and well profile per field, from Sodir's facility register and development wells.
// Used for field-specific operating costs and decommissioning costs (public/js/valuation.js).
//
// For each field:
//   own:   facilities that belong to the field and are not removed, by class
//          gbs (concrete gravity-based / Condeep), steelLarge (jacket 8–12 legs), steelSmall (jacket 3–6 legs,
//          tripod, monotower, jack-up), floater (semi-submersible, TLP, SPAR, FPSO, FSU), template (subsea templates and structures)
//   host:  name of another field's facility that processes this field's production (tie-back), if any
//   wells: development wells not yet permanently plugged and abandoned, split into platform and subsea wells
const CLASS = (kind) => {
  const k = String(kind || '').toUpperCase();
  if (/CONDEEP|CONCRETE STRUCTURE|DORIS|TLP CONCRETE|SEMISUB CONCRETE/.test(k)) return k.includes('SEMISUB') || k.includes('TLP') ? 'floater' : 'gbs';
  if (/JACKET (8|12) LEGS/.test(k)) return 'steelLarge';
  if (/JACKET|TRIPOD|MONOTOWER|JACK-UP|MOPUSTOR/.test(k)) return 'steelSmall';
  if (/SEMISUB|TLP|SPAR|FPSO|FSU|VESSEL/.test(k)) return 'floater';
  if (/TEMPLATE|SUBSEA STRUCTURE/.test(k)) return 'template';
  if (/ONSHORE FACILITY/.test(k)) return 'onshore';
  return null; // landfalls, loading systems, wind turbines: not counted
};
const GONE = /REMOVED|DISPOSAL COMPLETED|ABANDONED IN PLACE|DECOMMISSIONED/;

function facilityProfiles(fixed, moveable, wells) {
  const byField = new Map();
  const get = (f) => { if (!byField.has(f)) byField.set(f, { own: { gbs: 0, steelLarge: 0, steelSmall: 0, floater: 0, onshore: 0, template: 0 }, host: null, tieback: false, wells: { platform: 0, subsea: 0 } }); return byField.get(f); };
  // facility name → { field it belongs to, class }
  const fac = new Map();
  for (const x of fixed) {
    const cls = CLASS(x.fclKind);
    fac.set(x.fclName.toUpperCase(), { field: x.fclBelongsToKind === 'FIELD' ? x.fclBelongsToName : null, cls, gone: GONE.test(x.fclPhase) });
    if (!cls || GONE.test(x.fclPhase) || x.fclBelongsToKind !== 'FIELD' || x.fclPhase === 'FUTURE') continue;
    get(x.fclBelongsToName).own[cls]++;
  }
  for (const x of moveable) {
    const cls = CLASS(x.fclKind);
    if (!fac.has(x.fclName.toUpperCase())) fac.set(x.fclName.toUpperCase(), { field: null, cls: cls === 'floater' ? 'floater' : null, moveable: true });
  }
  // Production facilities used by each field's wells; a moveable production unit (FPSO, semi) is assigned to the field
  // with the most wells on it, other fields using it are tie-backs.
  const use = new Map(); // facility -> Map(field -> wells)
  const live = new Map(); // field|well -> { subsea }
  for (const w of wells) {
    const field = w.wlbField;
    if (!field) continue;
    const pf = (w.wlbProductionFacility || '').toUpperCase();
    if (pf) { if (!use.has(pf)) use.set(pf, new Map()); const m = use.get(pf); m.set(field, (m.get(field) || 0) + 1); }
    const key = field + '|' + w.wlbWell;
    const open = !/P&A|WILL NEVER BE DRILLED|JUNKED/.test(w.wlbStatus) && w.wlbStatus !== '';
    if (!live.has(key)) live.set(key, { open: false, subsea: w.wlbSubSea === 'YES' });
    if (open) live.get(key).open = true;
  }
  for (const [key, v] of live) if (v.open) get(key.split('|')[0]).wells[v.subsea ? 'subsea' : 'platform']++;
  for (const [pf, m] of use) {
    const f = fac.get(pf);
    if (!f || !f.cls || f.cls === 'template') continue;
    const fields = [...m.entries()].sort((a, b) => b[1] - a[1]);
    const owner = f.field || fields[0][0];
    if (f.moveable && f.cls === 'floater' && !f.field) get(owner).own.floater++; // moveable FPSO/semi owned by its main user
    for (const [field] of fields) if (field !== owner && !get(field).host) get(field).host = pf;
  }
  // A field with no surface facility of its own but production through another field's facility is a tie-back.
  for (const p of byField.values()) {
    const surface = p.own.gbs + p.own.steelLarge + p.own.steelSmall + p.own.floater + p.own.onshore;
    if (surface > 0) p.host = null;
    p.tieback = surface === 0; // subsea-only fields produce through another field's (or a shared) facility
  }
  return byField;
}

module.exports = { facilityProfiles, CLASS };
