/* Feltverdi.no – front end (no framework). Hash routes: #/, #/felt/<slug>, #/selskap/<slug>, #/rangering, #/metode */
(function () {
  'use strict';
  const V = window.FVValuation;
  const I18N = window.FV_I18N;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slugify = (s) => s.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const BOE = V.BOE_PER_SM3;
  // Colours come from the CSS custom properties (granite palette), so charts and map follow light/dark mode.
  let COLORS = {};
  function refreshColors() {
    const cs = getComputedStyle(document.documentElement);
    const v = (n) => cs.getPropertyValue('--' + n).trim();
    COLORS = { oil: v('oil'), gas: v('gas'), ngl: v('ngl'), mixed: v('mixed'), shut: v('shut'), accent: v('accent'), accentSoft: v('accent-soft'),
      grid: v('grid'), text: v('text-2'), ink: v('text'), neg: v('neg'), land: v('land'), surface: v('surface-solid'), border: v('border-strong') };
    if (window.Chart) {
      Chart.defaults.color = COLORS.text;
      Chart.defaults.borderColor = COLORS.grid;
      Object.assign(Chart.defaults.plugins.tooltip, { backgroundColor: COLORS.surface, titleColor: COLORS.ink, bodyColor: COLORS.text, borderColor: COLORS.border });
    }
  }

  // ---------- state & persistence ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('fv:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('fv:' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  const DEFAULT_A = { brent: V.DEFAULTS.brent, gasEur: V.DEFAULTS.gasEur, usdnok: V.DEFAULTS.usdnok, discount: V.DEFAULTS.discount, reserveGrowth: V.DEFAULTS.reserveGrowth };
  const state = {
    data: null, vals: null, companies: [],
    lang: store.get('lang', (navigator.language || 'nb').startsWith('en') ? 'en' : 'nb'),
    cur: store.get('cur', 'NOK'),
    a: { ...DEFAULT_A, ...store.get('a', {}) },
    overrides: store.get('ov', {}), dealViews: store.get('dv', {}),
    shares: {}, lastField: store.get('lastField', 'johan-sverdrup'), lastCompany: store.get('lastCompany', 'var-energi-asa'),
    rank: { tab: 'fields', sort: 'npv', asc: false, q: '', area: '', status: '' },
  };
  const t = (k, ...args) => { const v = I18N[state.lang][k] ?? I18N.nb[k] ?? k; return typeof v === 'function' ? v(...args) : v; };
  const tmap = (group, k) => (I18N[state.lang][group] || {})[k] || k;

  // ---------- formatting ----------
  const locale = () => (state.lang === 'nb' ? 'nb-NO' : 'en-GB');
  const nf = (v, d = 0) => new Intl.NumberFormat(locale(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  const toCur = (usdMM) => (state.cur === 'NOK' ? usdMM * state.a.usdnok : usdMM);
  function money(usdMM, opts = {}) {
    const v = toCur(usdMM);
    const a = Math.abs(v);
    let s;
    if (a >= 1e6) s = `${nf(v / 1e6, 2)} ${state.lang === 'nb' ? 'bill.' : 'tn'}`;
    else if (a >= 1000) s = `${nf(v / 1000, a >= 1e5 ? 0 : 1)} ${t('bn')}`;
    else s = `${nf(v, a >= 10 ? 0 : 1)} ${t('mn')}`;
    return opts.bare ? s : `${state.cur} ${s}`;
  }
  const perBoe = (usdMM, boe) => (boe > 0 ? `${state.cur === 'NOK' ? 'NOK' : 'USD'} ${nf(toCur(usdMM) / boe, state.cur === 'NOK' ? 0 : 1)}` : '–');
  const kboed = (mmboe) => mmboe * 1000 / 365;
  const pct = (v, d = 1) => `${nf(v, d)} %`; // non-breaking space: "8 %" never splits over two lines

  // ---------- data ----------
  // Data files carry the build's data version (?v=…, set in index.html by scripts/stamp-assets.js), so a browser never
  // combines new code with cached old data, or deals.json with an older deal-metrics.json.
  const DATA_V = (document.querySelector('meta[name="fv-data-version"]') || {}).content || '';
  const dataUrl = (f) => `/data/${f}${DATA_V ? '?v=' + DATA_V : ''}`;
  async function load() {
    const res = await fetch(dataUrl('fields.json'));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    state.data = await res.json();
    try { const c = await fetch(dataUrl('coast.json')); if (c.ok) state.coast = await c.json(); } catch { /* map without coastline */ }
    try { const h = await fetch(dataUrl('history.json')); if (h.ok) state.hist = await h.json(); } catch { /* historical page unavailable */ }
    try { const d = await fetch(dataUrl('deals.json')); if (d.ok) { state.deals = await d.json(); state.deals.deals.sort((a, b) => b.date.localeCompare(a.date)); } } catch { /* deals unavailable */ }
    try { const m = await fetch(dataUrl('deal-metrics.json')); if (m.ok) state.dealMetrics = await m.json(); } catch { /* deal metrics unavailable */ }
    renderTicker();
    state.companies = V.companies(state.data.fields).map((c) => ({ ...c, slug: slugify(c.name) }));
    $('#snapshot').textContent = state.data.generated;
    recompute();
  }
  function recompute() {
    state.vals = V.valueAll(state.data.fields, state.a, state.data.lastFullYear, state.overrides);
  }
  const fieldBySlug = (s) => state.data.fields.find((f) => f.slug === s);
  const companyBySlug = (s) => state.companies.find((c) => c.slug === s);
  const hcColor = (f) => (f.status === 'Shut down' ? COLORS.shut : f.hc === 'OIL' ? COLORS.oil : /^GAS/.test(f.hc) ? COLORS.gas : COLORS.mixed);

  // ---------- chrome: language, currency, assumptions ----------
  function applyChrome() {
    document.documentElement.lang = state.lang === 'nb' ? 'nb' : 'en';
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-lang]').forEach((b) => b.classList.toggle('on', b.dataset.lang === state.lang));
    $$('[data-cur]').forEach((b) => b.classList.toggle('on', b.dataset.cur === state.cur));
    renderAssumptions();
    if (state.deals) renderTicker();
  }
  const ASSUMPTIONS = [
    { k: 'brent', label: 'brent', min: 40, max: 130, step: 1, fmt: (v) => `$${nf(v)}`, hint: 'brentHint' },
    { k: 'gasEur', label: 'gas', min: 10, max: 100, step: 1, fmt: (v) => `€${nf(v)}/MWh`, hint: 'gasHint',
      note: (v) => { const eurusd = V.DEFAULTS.eurusd; return t('gasConv', nf(eurusd, 2), nf(1.72 * eurusd, 2), nf(v), nf(v * 1.72 * eurusd, 1), nf(v * eurusd / 3.412, 1)); } },
    { k: 'usdnok', label: 'usdnok', min: 7, max: 13, step: 0.1, fmt: (v) => nf(v, 1), hint: 'usdnokHint' },
    { k: 'discount', label: 'discount', min: 0.04, max: 0.14, step: 0.005, fmt: (v) => pct(v * 100, 1), hint: 'discountHint' },
    { k: 'reserveGrowth', label: 'growth', min: 1, max: 2, step: 0.1, fmt: (v) => `×${nf(v, 1)}`, hint: 'growthHint' },
  ];
  let openPop = null;
  function renderAssumptions() {
    const bar = $('#assume-bar');
    bar.innerHTML = `<span class="assume-label">${t('assumptions')}</span>` + ASSUMPTIONS.map((x) => `
      <div class="chip" data-k="${x.k}">
        <button type="button" aria-expanded="false" aria-haspopup="dialog"><span class="k">${t(x.label)}</span><span class="v">${x.fmt(state.a[x.k])}</span></button>
      </div>`).join('') + `<button type="button" class="reset" id="reset-a">${t('reset')}</button>`;
    $$('.chip', bar).forEach((chip) => {
      const x = ASSUMPTIONS.find((a) => a.k === chip.dataset.k);
      $('button', chip).addEventListener('click', (e) => { e.stopPropagation(); togglePop(chip, x); });
    });
    $('#reset-a').addEventListener('click', () => { state.a = { ...DEFAULT_A }; store.set('a', state.a); closePop(); recompute(); applyChrome(); route(); });
  }
  function togglePop(chip, x) {
    if (openPop && openPop.chip === chip) return closePop();
    closePop();
    const pop = document.createElement('div');
    pop.className = 'pop'; pop.setAttribute('role', 'dialog');
    pop.innerHTML = `<label><span>${t(x.label)}</span><strong class="num">${x.fmt(state.a[x.k])}</strong></label>
      <input type="range" min="${x.min}" max="${x.max}" step="${x.step}" value="${state.a[x.k]}" aria-label="${t(x.label)}">
      <p class="hint">${t(x.hint)}</p>${x.note ? `<p class="hint conv">${x.note(state.a[x.k])}</p>` : ''}`;
    pop.addEventListener('click', (e) => e.stopPropagation());
    chip.appendChild(pop);
    $('button', chip).setAttribute('aria-expanded', 'true');
    const range = $('input', pop);
    range.focus();
    let timer;
    range.addEventListener('input', () => {
      state.a[x.k] = parseFloat(range.value);
      $('strong', pop).textContent = x.fmt(state.a[x.k]);
      $('.v', chip).textContent = x.fmt(state.a[x.k]);
      if (x.note) $('.conv', pop).innerHTML = x.note(state.a[x.k]);
      clearTimeout(timer);
      timer = setTimeout(() => { store.set('a', state.a); recompute(); route({ keepScroll: true }); }, 90);
    });
    openPop = { chip, pop };
  }
  function closePop() {
    if (!openPop) return;
    openPop.pop.remove();
    $('button', openPop.chip).setAttribute('aria-expanded', 'false');
    openPop = null;
  }
  document.addEventListener('click', closePop);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePop(); });
  // Two-way toggles: a click anywhere in the box switches to the other option
  const TOGGLES = { lang: ['nb', 'en'], cur: ['NOK', 'USD'] };
  $$('[data-toggle]').forEach((box) => box.addEventListener('click', () => {
    const key = box.dataset.toggle, [a, b] = TOGGLES[key];
    state[key] = state[key] === a ? b : a;
    store.set(key, state[key]); applyChrome(); route({ keepScroll: true });
  }));

  // ---------- charts & map lifecycle ----------
  let charts = [], map = null;
  function cleanup() {
    charts.forEach((c) => c.destroy()); charts = [];
    if (map) { map.remove(); map = null; }
  }
  if (window.Chart) {
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Chart.defaults.color = COLORS.text;
    Chart.defaults.borderColor = COLORS.grid;
    Chart.defaults.plugins.legend.labels.boxWidth = 10;
    Chart.defaults.plugins.legend.labels.boxHeight = 10;
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.cornerRadius = 4;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.tooltip.padding = 10;
  }

  // ---------- views ----------
  function totals() {
    let npv = 0, gross = 0, tax = 0, rem = 0, prod = 0, grossByHc = { oil: 0, gas: 0, ngl: 0 };
    const byArea = {};
    const p = V.prices({ ...V.DEFAULTS, ...state.a });
    for (const f of state.data.fields) {
      const v = state.vals.get(f.slug);
      npv += v.npv; gross += v.grossValue; tax += v.taxPv; rem += v.remBoe;
      if (f.status === 'Producing') prod++;
      byArea[f.area] = (byArea[f.area] || 0) + v.npv;
      grossByHc.oil += v.remBoe * v.mix.liquids * p.oil;
      grossByHc.gas += v.remBoe * v.mix.gas * p.gas;
      grossByHc.ngl += v.remBoe * v.mix.ngl * p.ngl;
    }
    return { npv, gross, tax, rem, prod, byArea, grossByHc };
  }

  function barsHtml(items) {
    const max = Math.max(...items.map((i) => i.value), 1);
    const total = items.reduce((s, i) => s + Math.max(0, i.value), 0) || 1;
    return `<div class="bars">${items.map((i) => `
      <div class="bar-row"><span class="name" title="${esc(i.name)}">${i.href ? `<a href="${i.href}">${esc(i.name)}</a>` : esc(i.name)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(Math.max(0, i.value) / max * 100).toFixed(1)}%${i.color ? `;background:${i.color}` : ''}"></div></div>
        <span class="pct">${i.label ?? pct(i.value / total * 100, 0)}</span></div>`).join('')}</div>`;
  }
  function animateBars() { /* bars are rendered at their final width */ }

  function viewHome(el) {
    const T = totals();
    const fields = state.data.fields;
    const valued = fields.filter((f) => state.vals.get(f.slug).kind !== 'none').length;
    const top = [...fields].sort((a, b) => state.vals.get(b.slug).npv - state.vals.get(a.slug).npv).slice(0, 10);
    const comps = state.companies.map((c) => ({ c, v: V.valueCompany(c.name, fields, state.vals) })).sort((a, b) => b.v.npv - a.v.npv).slice(0, 8);
    el.innerHTML = `
      <section class="hero hero-grid">
        <div>
          <div class="eyebrow">${t('heroEyebrow')}</div>
          <h1>${t('heroTitle')}</h1>
          <div class="hero-value">${money(T.npv)}</div>
          <p class="hero-sub">${t('heroSub', valued, state.data.lastFullYear)}</p>
        </div>
        <div class="hero-search card" role="search">
          <h2>${t('heroSearchTitle')}</h2>
          <p class="muted">${t('heroSearchSub', fields.length, state.companies.length)}</p>
          <div class="picker" id="hero-picker"></div>
          <div class="quick"><span class="muted">${t('popular')}</span>
            ${[['felt', 'troll', 'Troll'], ['felt', 'johan-sverdrup', 'Johan Sverdrup'], ['felt', 'johan-castberg', 'Johan Castberg'], ['selskap', 'equinor-energy-as', 'Equinor'], ['selskap', 'var-energi-asa', 'Vår Energi'], ['selskap', 'aker-bp-asa', 'Aker BP']]
              .map(([p, s, n]) => `<a class="tag" href="#/${p}/${s}">${esc(n)}</a>`).join('')}
          </div>
        </div>
      </section>
      <div class="kpis">
        <div class="kpi hl"><div class="l">${t('kpiNpv')}</div><div class="v">${money(T.npv)}</div><div class="s">${perBoe(T.npv, T.rem)} ${t('perBoe')}</div></div>
        <div class="kpi"><div class="l">${t('kpiGross')}</div><div class="v">${money(T.gross)}</div><div class="s">${t('kpiGrossSub')}</div></div>
        <div class="kpi"><div class="l">${t('kpiState')}</div><div class="v">${money(T.tax)}</div><div class="s">${t('kpiStateSub')}</div></div>
        <div class="kpi"><div class="l">${t('kpiReserves')}</div><div class="v">${nf(T.rem / 1000, 1)} ${state.lang === 'nb' ? 'mrd. fat' : 'bn boe'}</div><div class="s">${T.prod} ${t('kpiFields').toLowerCase()} · ${t('kpiFieldsSub', fields.length)}</div></div>
      </div>
      <div class="grid g-map section-gap">
        <div class="card">
          <div class="card-head"><h2>${t('mapTitle')}</h2><span class="muted">${t('mapSub')}</span></div>
          <div id="map" class="map" role="img" aria-label="${t('mapTitle')}"></div>
          <div class="legend"><span><i class="dot" style="background:${COLORS.oil}"></i>${t('legOil')}</span><span><i class="dot" style="background:${COLORS.gas}"></i>${t('legGas')}</span><span><i class="dot" style="background:${COLORS.mixed}"></i>${t('legMixed')}</span><span><i class="dot" style="background:${COLORS.shut}"></i>${t('legShut')}</span></div>
        </div>
        <div class="card">
          <div class="card-head"><h2>${t('topFields')}</h2></div>
          <ol class="rank-list">${top.map((f) => `<li><span><a href="#/felt/${f.slug}">${esc(f.name)}</a><span class="meta">${esc(tmap('area', f.area))} · ${esc(tmap('hc', f.hc))}</span></span><span class="val">${money(state.vals.get(f.slug).npv)}</span></li>`).join('')}</ol>
          <p style="margin:14px 0 0"><a href="#/rangering">${t('allRankings')}</a></p>
        </div>
      </div>
      <div class="grid g-3 section-gap">
        <div class="card"><div class="card-head"><h2>${t('byArea')}</h2></div>${barsHtml(Object.entries(T.byArea).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ name: tmap('area', k), value: v })))}</div>
        <div class="card"><div class="card-head"><h2>${t('byHc')}</h2></div>${barsHtml([{ name: t('gasProd'), value: T.grossByHc.gas, color: COLORS.gas }, { name: t('oil'), value: T.grossByHc.oil, color: COLORS.oil }, { name: t('ngl'), value: T.grossByHc.ngl, color: COLORS.ngl }])}</div>
        <div class="card"><div class="card-head"><h2>${t('topCompanies')}</h2></div>${barsHtml(comps.map(({ c, v }) => ({ name: shortCompany(c.name), href: `#/selskap/${c.slug}`, value: v.npv, label: money(v.npv, { bare: true }) })))}</div>
      </div>`;
    animateBars(el);
    const items = fields.map((f) => ({ name: f.name, sub: `${t('modeField')} · ${tmap('area', f.area)}`, href: `#/felt/${f.slug}` }))
      .concat(state.companies.map((c) => ({ name: c.name, sub: `${t('modeCompany')} · ${c.fields} ${t('nFields').toLowerCase()}`, href: `#/selskap/${c.slug}` })));
    picker($('#hero-picker', el), items, t('heroSearchPh'), (i) => { location.hash = i.href; }, 'hero-list');
    drawMap();
  }

  const shortCompany = (n) => n.replace(/ (ASA|AS|AB|Norge|Norway|Skandinavia|Energy AS|EP Norge AS|E&P Norge AS)$/g, '').replace(/ (AS|ASA)$/g, '');

  function drawMap() {
    const box = $('#map');
    if (!box || !window.L) return;
    map = L.map(box, { zoomControl: true, scrollWheelZoom: false, attributionControl: true, minZoom: 3, maxZoom: 9, zoomSnap: 0.5,
      maxBounds: [[46, -30], [83, 50]] }).setView([65.2, 9], 4);
    map.attributionControl.setPrefix(false);
    if (state.coast) {
      L.geoJSON(state.coast, { interactive: false, style: { stroke: false, fillColor: COLORS.land, fillOpacity: 1 } }).addTo(map);
    }
    map.attributionControl.addAttribution('<a href="https://www.naturalearthdata.com" target="_blank" rel="noopener">Natural Earth</a> · Sodir');
    const seaLabel = (latlng, key) => L.marker(latlng, { interactive: false, keyboard: false, icon: L.divIcon({ className: 'sea-label', html: esc(tmap('area', key)), iconSize: [140, 16], iconAnchor: [70, 8] }) }).addTo(map);
    seaLabel([56.4, -0.6], 'North sea'); seaLabel([68.2, 0.5], 'Norwegian sea'); seaLabel([74.2, 30], 'Barents sea');
    const maxNpv = Math.max(...state.data.fields.map((f) => state.vals.get(f.slug).npv));
    const fields = [...state.data.fields].filter((f) => f.lat).sort((a, b) => state.vals.get(b.slug).npv - state.vals.get(a.slug).npv);
    map.fitBounds(L.latLngBounds(fields.map((f) => [f.lat, f.lon])), { padding: [28, 28], maxZoom: 5 });
    for (const f of fields) {
      const v = state.vals.get(f.slug);
      const r = v.npv > 0 ? 4 + 26 * Math.sqrt(v.npv / maxNpv) : 3;
      const c = hcColor(f);
      const m = L.circleMarker([f.lat, f.lon], { radius: r, color: c, weight: 1.2, opacity: 0.95, fillColor: c, fillOpacity: f.status === 'Shut down' ? 0.25 : 0.5 }).addTo(map);
      m.bindTooltip(`<strong>${esc(f.name)}</strong><br>${esc(tmap('status', f.status))}<br>${money(v.npv)}`, { className: 'fv-tip', direction: 'top', offset: [0, -r] });
      m.on('click', () => { location.hash = `#/felt/${f.slug}`; });
    }
  }

  // ----- picker (searchable combobox) -----
  function picker(el, items, placeholder, onPick, listId = 'pick-list') {
    el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input type="search" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="${listId}">
      <div class="picker-list" id="${listId}" role="listbox" hidden></div>`;
    const input = $('input', el), list = $('.picker-list', el);
    let hi = 0, shown = [];
    const fold = (s) => s.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').normalize('NFKD').replace(/[̀-ͯ]/g, '');
    const draw = () => {
      const q = fold(input.value.trim());
      // matches at the start of the name (or a word) rank first; æøå match ae/o/a too
      const score = (i) => { const n = fold(i.name); if (!q) return 1; if (n.startsWith(q)) return 3; if (n.includes(' ' + q)) return 2; return n.includes(q) ? 1 : 0; };
      shown = items.map((i) => [i, score(i)]).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).map(([i]) => i).slice(0, 60);
      list.innerHTML = shown.map((i, n) => `<button type="button" role="option" data-n="${n}" class="${n === hi ? 'hi' : ''}"><span>${esc(i.name)}</span><span class="sub">${esc(i.sub || '')}</span></button>`).join('') || `<div class="empty">–</div>`;
      list.hidden = false; input.setAttribute('aria-expanded', 'true');
    };
    const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); };
    input.addEventListener('focus', () => { hi = 0; draw(); });
    input.addEventListener('input', () => { hi = 0; draw(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { hi = Math.min(hi + 1, shown.length - 1); draw(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { hi = Math.max(hi - 1, 0); draw(); e.preventDefault(); }
      else if (e.key === 'Enter' && shown[hi]) { onPick(shown[hi]); close(); }
      else if (e.key === 'Escape') { close(); input.blur(); }
    });
    list.addEventListener('mousedown', (e) => { const b = e.target.closest('button'); if (b) { e.preventDefault(); onPick(shown[+b.dataset.n]); close(); } });
    input.addEventListener('blur', () => setTimeout(close, 120));
  }

  function explorerHead(mode) {
    return `<div class="explorer-head">
      <div class="seg seg-toggle" id="mode-toggle" data-current="${mode}" role="group" aria-label="Modus">
        <button type="button" data-mode="field" class="${mode === 'field' ? 'on' : ''}">${t('modeField')}</button>
        <button type="button" data-mode="company" class="${mode === 'company' ? 'on' : ''}">${t('modeCompany')}</button>
      </div>
      <div class="picker" id="picker"></div>
    </div>`;
  }
  function wireExplorer(el, mode) {
    // Two-way toggle: a click anywhere in the box switches to the other mode
    $('#mode-toggle', el).addEventListener('click', () => {
      location.hash = mode === 'field' ? `#/selskap/${state.lastCompany}` : `#/felt/${state.lastField}`;
    });
    if (mode === 'field') {
      const items = state.data.fields.map((f) => ({ name: f.name, sub: tmap('area', f.area), slug: f.slug })).sort((a, b) => a.name.localeCompare(b.name, 'nb'));
      picker($('#picker', el), items, t('searchField'), (i) => { location.hash = `#/felt/${i.slug}`; });
    } else {
      const items = state.companies.map((c) => ({ name: c.name, sub: `${c.fields} ${t('nFields').toLowerCase()}`, slug: c.slug }));
      picker($('#picker', el), items, t('searchCompany'), (i) => { location.hash = `#/selskap/${i.slug}`; });
    }
  }

  // ----- field view -----
  function shareOf(f) {
    const sel = state.shares[f.slug] || { type: 'gross' };
    if (sel.type === 'owner') { const o = f.owners.find((x) => x[0] === sel.company); return { ...sel, pct: o ? o[1] : 100 }; }
    if (sel.type === 'custom') return sel;
    return { type: 'gross', pct: 100 };
  }

  // "Basis: 4 large steel platforms, 13 subsea templates · 81 open wells · fixed opex USD 205 m/yr · decommissioning USD 2.2 bn"
  function facBasisText(f, v) {
    const p = f.fac, o = p.own;
    const parts = ['gbs', 'steelLarge', 'steelSmall', 'floater', 'onshore', 'template'].filter((k) => o[k] > 0).map((k) => `${o[k]} ${t('fac_' + k, o[k])}`);
    const fo = V.facilityOpex(f), fd = V.facilityDecom(f);
    const wells = p.wells.platform + p.wells.subsea;
    return t('facBasis', parts.join(', ') || t('facNone'), wells, p.tieback ? (p.host ? t('facTieHost', p.host) : t('facTie')) : '',
      fo ? money(fo.fixed) : '–', fd != null ? money(Math.max(fd, 0.5 * (f.rec ? f.rec.oe * BOE : 0))) : '–');
  }

  function viewField(el, slug) {
    const f = fieldBySlug(slug);
    if (!f) return viewNotFound(el);
    state.lastField = slug; store.set('lastField', slug);
    const v = state.vals.get(slug);
    const sh = shareOf(f), k = sh.pct / 100;
    const y = state.data.lastFullYear;
    const ov = state.overrides[slug] || {};
    const statusCls = f.status === 'Producing' ? 'prod' : f.status === 'Shut down' ? 'shut' : 'appr';
    const note = v.kind === 'none' ? t('noValue') : v.kind === 'new' ? t('newField') : v.kind === 'ramp' ? t('rampField')
      : v.kind === 'plateau' ? t('plateauNote', nf(kboed(v.plateauRate), 0), v.plateauYears, v.plateauEnd, t('plateauSrc_' + v.plateauSource), nf(v.decline * 100, 1), nf(v.impliedGrowth, 2))
      : v.kind === 'decline' ? [f.outlook && f.outlook.plateau === 'off' ? t('offPlateauNote') : '', declineNote(v)].filter(Boolean).join(' ')
      : f.outlook && f.outlook.plateau === 'off' ? t('offPlateauNote') : '';
    const shareOptions = [`<option value="gross"${sh.type === 'gross' ? ' selected' : ''}>${t('gross100')}</option>`]
      .concat(f.owners.map(([c, s]) => `<option value="owner:${esc(c)}"${sh.type === 'owner' && sh.company === c ? ' selected' : ''}>${esc(c)} – ${pct(s, 2)}</option>`))
      .concat([`<option value="custom"${sh.type === 'custom' ? ' selected' : ''}>${sh.type === 'custom' ? `${t('custom').replace(' …', '')}: ${pct(sh.pct, 2)}` : t('custom')}</option>`]).join('');
    const recBoe = f.rec ? f.rec.oe * BOE : 0;
    const facDec = V.facilityDecom(f);
    const decomAutoBoe = facDec != null && recBoe > 0 ? Math.max(facDec, 0.5 * recBoe) / recBoe : V.DEFAULTS.decomPerBoe;
    el.innerHTML = explorerHead('field') + `
      <div class="title-row">
        <div>
          <h1>${esc(f.name)}</h1>
          <div class="tags">
            <span class="tag ${statusCls}">${esc(tmap('status', f.status))}</span>
            <span class="tag">${esc(tmap('area', f.area))}</span>
            <span class="tag">${esc(tmap('hc', f.hc))}</span>
            ${v.kind === 'plateau' ? `<span class="tag plat">${t('plateauTag', v.plateauEnd)}</span>` : ''}
            <span class="tag">${t('operator')}: ${esc(f.operator)}</span>
            ${f.discovered ? `<span class="tag">${t('discovered')} ${f.discovered}</span>` : ''}
            ${f.parts ? `<span class="tag">${t('partsOf')}: ${f.parts.map((p) => `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a>`).join(', ')}</span>`
              : `<a class="tag" href="${esc(f.url)}" target="_blank" rel="noopener">${t('sodirLink')}</a>`}
          </div>
        </div>
        <label class="share-pick">${t('valueFor')} <select id="share">${shareOptions}</select></label>
      </div>
      <div class="kpis k6">
        <div class="kpi hl"><div class="l">${t('fieldValue')}${k < 1 ? ` (${pct(sh.pct, 1)})` : ''}</div><div class="v">${money(v.npv * k)}</div><div class="s">${perBoe(v.npv, v.remBoe)} ${t('perBoe')}</div></div>
        <div class="kpi"><div class="l">${t('remaining')}</div><div class="v">${nf(v.remBoe * k, v.remBoe * k < 10 ? 1 : 0)}</div><div class="s">${t('mmboe')}${f.resYear ? ` · Sodir ${f.resYear}` : ''}${v.cum > 0 ? ` · ${t('modelProd', nf(v.cum * k, v.cum * k < 10 ? 1 : 0), nf(v.impliedGrowth, 2))}` : ''}</div></div>
        <div class="kpi"><div class="l">${t('production', y)}</div><div class="v">${nf(kboed(v.q0 * k), 1)}</div><div class="s">${t('kboed')}</div></div>
        <div class="kpi"><div class="l">${t('lifetime')}</div><div class="v">${v.endYear || '–'}</div><div class="s">${t('lifetimeSub')}</div></div>
        <div class="kpi"><div class="l">${t('taxState')}</div><div class="v">${money(v.taxPv * k)}</div><div class="s">${t('taxSub')}</div></div>
        <div class="kpi"><div class="l">${t('kpiGross')}</div><div class="v">${money(v.grossValue * k)}</div><div class="s">$${nf(v.price, 1)}/boe</div></div>
      </div>
      ${note ? `<p class="model-note">${note}</p>` : ''}
      ${f.statusText ? `<figure class="sodir-status"><figcaption>${t('sodirStatus')}</figcaption><blockquote lang="en">${esc(f.statusText)}</blockquote></figure>` : ''}
      <div class="grid g-2 section-gap">
        <div class="card"><div class="card-head"><h2>${t('prodChart')}</h2><span class="muted">${t('prodChartSub')}</span></div><div class="chart-box"><canvas id="c-prod"></canvas></div></div>
        <div class="card"><div class="card-head"><h2>${t('cfChart')}</h2><span class="muted">${t('cfChartSub', state.cur)}</span></div><div class="chart-box"><canvas id="c-cf"></canvas></div></div>
      </div>
      ${v.kind !== 'none' || f.prod.some((p) => p[5] > 0) ? `<div class="card section-gap">
        <div class="card-head"><h2>${t('cumChart')}</h2><span class="muted">${t('cumChartSub')}</span></div>
        <div class="chart-box" style="height:320px"><canvas id="c-cum"></canvas></div>
      </div>` : ''}
      ${lifeCard(f, k)}
      <div class="grid g-2 section-gap">
        <div class="card">
          <div class="card-head"><h2>${t('owners')}</h2></div>
          <div class="tbl-wrap"><table><thead><tr><th>${t('company')}</th><th class="r">${t('share')}</th><th class="r">${t('value')}</th></tr></thead><tbody>
          ${f.owners.map(([c, s]) => `<tr class="link" data-href="#/selskap/${slugify(c)}"><td><a href="#/selskap/${slugify(c)}">${esc(c)}</a>${c === f.operator ? ` <span class="tag">${t('operator')}</span>` : ''}</td><td class="r">${pct(s, 2)}</td><td class="r">${money(v.npv * s / 100)}</td></tr>`).join('')}
          </tbody></table></div>
        </div>
        <div class="card">
          <div class="card-head"><h2>${t('fieldAssumptions')}</h2><button type="button" class="reset" id="ov-reset">${t('resetField')}</button></div>
          <div class="ov">
            <div><label for="ov-opex">${t('opexBoe')}</label><input id="ov-opex" type="number" min="0" max="60" step="0.5" value="${ov.opexBoe ?? ''}" placeholder="${nf(v.opexBoe, 1)}"><div class="auto">${t('auto')}: ${nf(ov.opexBoe != null ? (V.facilityOpex(f) ? (V.facilityOpex(f).fixed + V.facilityOpex(f).variable * Math.max(v.q0, 0.01)) / Math.max(v.q0, 0.01) : V.OPEX_BY_TYPE[f.hc] ?? 10) : v.opexBoe, 1)}${v.opexBasis === 'facilities' ? ` (${t('basisFac')})` : ''}</div></div>
            <div><label for="ov-capex">${t('capexBoe')}</label><input id="ov-capex" type="number" min="0" max="60" step="0.5" value="${ov.capexBoe ?? ''}" placeholder="${nf(v.capexBoe, 1)}"><div class="auto">${t('auto')}: ${nf(v.capexBoe, 1)}</div></div>
            <div><label for="ov-dec">${t('declineRate')}</label><input id="ov-dec" type="number" min="0" max="60" step="0.5" value="${ov.decline != null ? nf(ov.decline * 100, 1).replace(',', '.') : ''}" placeholder="${nf(v.decline * 100, 1)}"><div class="auto">${t('autoDecl', nf(v.decline * 100, 1))}</div></div>
            <div><label for="ov-plat">${t('plateauYearsLbl')}</label><input id="ov-plat" type="number" min="0" max="30" step="1" value="${ov.plateauYears ?? ''}" placeholder="${v.plateauYears || 0}"><div class="auto">${t('auto')}: ${v.kind === 'plateau' && v.plateauSource !== 'user' ? t('plateauAuto', v.plateauYears) : '0'}</div></div>
            <div><label for="ov-decom">${t('decomBoe')}</label><input id="ov-decom" type="number" min="0" max="10" step="0.1" value="${ov.decomPerBoe ?? ''}" placeholder="${nf(decomAutoBoe, 1)}"><div class="auto">${t('auto')}: ${nf(decomAutoBoe, 1)}${V.facilityDecom(f) != null ? ` (${t('basisFac')})` : ''}</div></div>
          </div>
          ${f.fac ? `<p class="muted fac-basis">${facBasisText(f, v)} ${tipBtn(t('facTip'))}</p>` : ''}
          <details class="cf section-gap"><summary>${t('cashflowTable')}</summary>
            <div style="margin:12px 0"><button type="button" class="btn" id="csv">${t('exportCsv')}</button></div>
            <div class="tbl-wrap">${cashflowTable(v, k)}</div>
          </details>
        </div>
      </div>`;
    wireExplorer(el, 'field');
    $('#share', el).addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'gross') state.shares[slug] = { type: 'gross' };
      else if (val === 'custom') {
        const p = parseFloat(String(prompt(t('customPrompt'), String(sh.pct)) || '').replace(',', '.'));
        if (Number.isFinite(p) && p >= 0 && p <= 100) state.shares[slug] = { type: 'custom', pct: p };
      } else state.shares[slug] = { type: 'owner', company: val.slice(6) };
      route({ keepScroll: true });
    });
    $$('tr.link', el).forEach((tr) => tr.addEventListener('click', (e) => { if (!e.target.closest('a')) location.hash = tr.dataset.href; }));
    const setOv = (key, raw, scale = 1) => {
      const o = { ...(state.overrides[slug] || {}) };
      const n = parseFloat(String(raw).replace(',', '.'));
      if (raw === '' || !Number.isFinite(n)) delete o[key]; else o[key] = n * scale;
      if (Object.keys(o).length) state.overrides[slug] = o; else delete state.overrides[slug];
      store.set('ov', state.overrides); recompute(); route({ keepScroll: true });
    };
    $('#ov-opex', el).addEventListener('change', (e) => setOv('opexBoe', e.target.value));
    $('#ov-capex', el).addEventListener('change', (e) => setOv('capexBoe', e.target.value));
    $('#ov-dec', el).addEventListener('change', (e) => setOv('decline', e.target.value, 0.01));
    $('#ov-decom', el).addEventListener('change', (e) => setOv('decomPerBoe', e.target.value));
    $('#ov-plat', el).addEventListener('change', (e) => setOv('plateauYears', e.target.value));
    $('#ov-reset', el).addEventListener('click', () => { delete state.overrides[slug]; store.set('ov', state.overrides); recompute(); route({ keepScroll: true }); });
    $('#csv', el).addEventListener('click', () => downloadCsv(f, v, k));
    drawFieldCharts(f, v, k);
  }

  // Explains how the decline rate was chosen for a field in ordinary decline
  function declineNote(v) {
    const p = (x) => (x == null ? '–' : nf(x * 100, 1));
    const args = [p(v.decline), p(v.observedDecline), p(v.dLow), p(v.dHigh), nf(v.reserveGrowth, 1), nf(v.impliedGrowth, 2)];
    return t('declNote_' + (v.declineBasis || 'reserves'), ...args);
  }

  function lifeCard(f, k) {
    if (!state.hist) return '';
    const h = V.valueHistory(f, state.hist, state.a, state.data.lastFullYear, state.overrides[f.slug] || {});
    if (!h) return '';
    return `<div class="card section-gap">
      <div class="card-head"><h2>${t('lifeCard')}</h2><a href="#/historisk">${t('lifeMore')}</a></div>
      <div class="life-grid">
        <div><div class="l">${t('lifeStart')}</div><div class="v">${h.startYear}</div></div>
        <div><div class="l">${t('colLifeProd')}</div><div class="v">${nf(h.prodTotal * k, 0)}</div></div>
        <div><div class="l">${t('colCapexReal')}</div><div class="v">${money(h.capex * k)}</div></div>
        <div><div class="l">${t('lifePre')}</div><div class="v ${h.pre < 0 ? 'neg' : ''}">${money(h.pre * k)}</div></div>
        <div><div class="l">${t('lifeOrig')}</div><div class="v ${h.npvPost < 0 ? 'neg' : ''}">${money(h.npvPost * k)}</div></div>
        <div><div class="l">${t('lifeIrr')}</div><div class="v">${irrText(h.irr)}</div></div>
      </div></div>`;
  }

  function cashflowTable(v, k) {
    if (!v.years.length) return `<p class="muted">–</p>`;
    const c = (x) => nf(toCur(x * k), 0);
    return `<table><thead><tr><th>${t('year')}</th><th class="r">${t('prodCol')}</th><th class="r">${t('revenue')}</th><th class="r">${t('opex')}</th><th class="r">${t('capex')}</th><th class="r">${t('tax')}</th><th class="r">${t('fcf')}</th><th class="r">${t('pv')}</th></tr></thead><tbody>
      ${v.years.map((r) => `<tr><td>${r.year}${r.decom ? ` (${t('decom').toLowerCase()})` : ''}</td><td class="r">${nf(r.q * k, 2)}</td><td class="r">${c(r.rev)}</td><td class="r">${c(r.opex)}</td><td class="r">${c(r.capex + (r.decom || 0))}</td><td class="r">${c(r.tax)}</td><td class="r ${r.fcf < 0 ? 'neg' : ''}">${c(r.fcf)}</td><td class="r">${c(r.pv)}</td></tr>`).join('')}
      </tbody></table>`;
  }

  function downloadCsv(f, v, k) {
    const head = ['year', 'production_mmboe', 'revenue', 'opex', 'capex', 'decommissioning', 'tax', 'cash_flow', 'present_value'];
    const rows = v.years.map((r) => [r.year, (r.q * k).toFixed(3), ...[r.rev, r.opex, r.capex, r.decom || 0, r.tax, r.fcf, r.pv].map((x) => (toCur(x * k)).toFixed(1))]);
    const meta = `# Feltverdi.no – ${f.name} – ${state.cur} million (real) – share ${(k * 100).toFixed(2)}% – Brent ${state.a.brent}, gas EUR ${state.a.gasEur}/MWh, USDNOK ${state.a.usdnok}, discount ${(state.a.discount * 100).toFixed(1)}%`;
    const csv = [meta, head.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `feltverdi-${f.slug}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // Whole-life chart: cumulative production (MMboe, left) + annual rate (kboe/d, right), history and forecast
  function drawCumChart(f, v, k) {
    const canvas = $('#c-cum');
    if (!canvas || !window.Chart) return;
    const y0 = state.data.lastFullYear;
    const hist = f.prod.filter((p) => p[0] <= y0 && p[5] > 0);
    const fc = v.years.filter((r) => r.q > 0);
    if (!hist.length && !fc.length) return;
    const first = hist.length ? hist[0][0] : fc[0].year;
    const last = fc.length ? fc[fc.length - 1].year : y0;
    const labels = []; for (let y = first; y <= last; y++) labels.push(y);
    const histQ = new Map(hist.map((p) => [p[0], p[5] * BOE * k]));   // MMboe per year
    const fcQ = new Map(fc.map((r) => [r.year, r.q * k]));
    let c = 0; const cumHist = [], cumFc = [];
    for (const y of labels) {
      if (y <= y0) { c += histQ.get(y) || 0; cumHist.push(c); cumFc.push(y === y0 ? c : null); }
      else { c += fcQ.get(y) || 0; cumHist.push(null); cumFc.push(c); }
    }
    if (!hist.length) cumFc[0] = cumFc[0] ?? 0;
    const rateHist = labels.map((y) => (y <= y0 && histQ.has(y) ? kboed(histQ.get(y)) : null));
    const rateFc = labels.map((y) => (y > y0 && fcQ.has(y) ? kboed(fcQ.get(y)) : null));
    const sodirTotal = f.rec ? f.rec.oe * BOE * k : null;
    const datasets = [
      { type: 'bar', label: t('cumRateHist'), data: rateHist, backgroundColor: color(COLORS.text, 0.28), borderRadius: 2, yAxisID: 'y1', order: 3 },
      { type: 'bar', label: t('cumRateFc'), data: rateFc, backgroundColor: COLORS.accentSoft, borderColor: COLORS.accent, borderWidth: 1, borderRadius: 2, yAxisID: 'y1', order: 3 },
      { type: 'line', label: t('cumHist'), data: cumHist, borderColor: COLORS.ink, backgroundColor: color(COLORS.ink, 0.06), fill: true, borderWidth: 2.5, pointRadius: 0, tension: 0.15, yAxisID: 'y', order: 1 },
      { type: 'line', label: t('cumFc'), data: cumFc, borderColor: COLORS.accent, borderDash: [6, 4], borderWidth: 2.5, pointRadius: 0, tension: 0.15, yAxisID: 'y', order: 1 },
    ];
    if (sodirTotal) datasets.push({ type: 'line', label: t('cumSodir'), data: labels.map(() => sodirTotal), borderColor: COLORS.oil, borderDash: [2, 4], borderWidth: 1.5, pointRadius: 0, yAxisID: 'y', order: 2 });
    charts.push(new Chart(canvas, {
      data: { labels, datasets },
      options: {
        maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { maxTicksLimit: 12 } },
          y: { beginAtZero: true, title: { display: true, text: t('mmboe') }, ticks: { callback: (x) => nf(x) } },
          y1: { position: 'right', beginAtZero: true, stacked: true, grid: { display: false }, title: { display: true, text: t('kboed') }, ticks: { callback: (x) => nf(x) } },
        },
        plugins: { tooltip: { callbacks: { label: (ctx) => ctx.raw == null ? null : `${ctx.dataset.label}: ${nf(ctx.raw, ctx.dataset.yAxisID === 'y1' ? 1 : 0)} ${ctx.dataset.yAxisID === 'y1' ? t('kboed') : t('mmboe')}` } } },
      },
    }));
  }
  // Colour with alpha from a CSS colour string (hex or rgb[a])
  function color(c, a) {
    if (!c) return `rgba(128,128,128,${a})`;
    if (c.startsWith('#')) { const h = c.length === 4 ? c.slice(1).split('').map((x) => x + x).join('') : c.slice(1, 7); const n = parseInt(h, 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
    const m = c.match(/rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(',').map((s) => s.trim()); return `rgba(${p[0]},${p[1]},${p[2]},${a})`; }
    return c;
  }

  function drawFieldCharts(f, v, k) {
    if (!window.Chart) return;
    const y0 = state.data.lastFullYear;
    const hist = f.prod.filter((p) => p[0] >= y0 - 19);
    const fc = v.years.filter((r) => r.q > 0);
    const lastY = Math.max(y0, ...fc.map((r) => r.year));
    const labels = []; for (let y = (hist[0] ? hist[0][0] : y0 - 5); y <= Math.min(lastY, y0 + 30); y++) labels.push(y);
    const at = (y) => hist.find((p) => p[0] === y);
    const conv = (sm3) => sm3 * BOE * 1000 / 365 * k;
    const ds = (label, idx, color) => ({ type: 'bar', label, data: labels.map((y) => { const p = at(y); return p ? conv(idx(p)) : null; }), backgroundColor: color, borderRadius: 3, stack: 'h' });
    const fcLine = labels.map((y) => { const r = fc.find((x) => x.year === y); if (r) return kboed(r.q * k); if (y === y0) { const p = at(y); return p ? conv(p[5]) : null; } return null; });
    charts.push(new Chart($('#c-prod'), {
      data: {
        labels,
        datasets: [
          ds(t('oil'), (p) => p[1] + p[4], COLORS.oil),
          ds(t('gasProd'), (p) => p[2], COLORS.gas),
          ds(t('ngl'), (p) => p[3], COLORS.ngl),
          { type: 'line', label: t('forecast'), data: fcLine, borderColor: COLORS.accent, backgroundColor: COLORS.accentSoft, borderDash: [6, 4], borderWidth: 2, pointRadius: 0, fill: true, tension: 0.25, spanGaps: false },
        ],
      },
      options: {
        maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        scales: { x: { stacked: true, grid: { display: false }, ticks: { maxTicksLimit: 10 } }, y: { stacked: true, beginAtZero: true, ticks: { callback: (x) => nf(x) } } },
        plugins: { tooltip: { callbacks: { label: (c) => c.raw == null ? null : `${c.dataset.label}: ${nf(c.raw, 1)}` } } },
      },
    }));
    drawCumChart(f, v, k);
    const cf = v.years;
    let cum = 0;
    const cumPv = cf.map((r) => { cum += r.pv * k; return toCur(cum); });
    charts.push(new Chart($('#c-cf'), {
      data: {
        labels: cf.map((r) => r.year),
        datasets: [
          { type: 'bar', label: t('fcf'), data: cf.map((r) => toCur(r.fcf * k)), backgroundColor: cf.map((r) => (r.fcf < 0 ? COLORS.neg : COLORS.gas)), borderRadius: 2, yAxisID: 'y' },
          { type: 'line', label: t('cumPv'), data: cumPv, borderColor: COLORS.accent, borderWidth: 2, pointRadius: 0, tension: 0.25, yAxisID: 'y1' },
        ],
      },
      options: {
        maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } },
          y: { ticks: { callback: (x) => nf(x) } },
          y1: { position: 'right', grid: { display: false }, ticks: { callback: (x) => nf(x) } },
        },
        plugins: { tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${nf(c.raw, 0)}` } } },
      },
    }));
  }

  // ----- company view -----
  function viewCompany(el, slug) {
    const c = companyBySlug(slug);
    if (!c) return viewNotFound(el);
    state.lastCompany = slug; store.set('lastCompany', slug);
    const r = V.valueCompany(c.name, state.data.fields, state.vals);
    const shelf = totals().npv;
    const y = state.data.lastFullYear;
    el.innerHTML = explorerHead('company') + `
      <div class="title-row"><div><h1>${esc(c.name)}</h1>
        <div class="tags"><span class="tag">${r.rows.length} ${t('nFields').toLowerCase()}</span>${r.operated ? `<span class="tag prod">${t('operated', r.operated)}</span>` : ''}</div></div></div>
      <div class="kpis k6">
        <div class="kpi hl"><div class="l">${t('companyValue')}</div><div class="v">${money(r.npv)}</div><div class="s">${pct(r.npv / shelf * 100, 1)} ${state.lang === 'nb' ? 'av sokkelen' : 'of the shelf'}</div></div>
        <div class="kpi"><div class="l">${t('netProd', y)}</div><div class="v">${nf(kboed(r.q0), 0)}</div><div class="s">${t('kboed')}</div></div>
        <div class="kpi"><div class="l">${t('netRem')}</div><div class="v">${nf(r.remBoe, 0)}</div><div class="s">${t('mmboe')}</div></div>
        <div class="kpi"><div class="l">${t('perBoeNet')}</div><div class="v">${perBoe(r.npv, r.remBoe)}</div><div class="s">${t('net')}</div></div>
        <div class="kpi"><div class="l">${t('nFields')}</div><div class="v">${r.rows.length}</div><div class="s">${t('operated', r.operated)}</div></div>
        <div class="kpi"><div class="l">${t('taxState')}</div><div class="v">${money(r.rows.reduce((s, x) => s + x.v.taxPv * x.share / 100, 0))}</div><div class="s">${t('taxSub')}</div></div>
      </div>
      <div class="grid g-2 section-gap">
        <div class="card"><div class="card-head"><h2>${t('topContrib')}</h2><span class="muted">${state.cur} ${t('mn')}</span></div><div class="chart-box" style="height:${Math.max(220, Math.min(12, r.rows.length) * 30 + 40)}px"><canvas id="c-comp"></canvas></div></div>
        <div class="card"><div class="card-head"><h2>${t('byArea')}</h2></div>${barsHtml(groupBy(r.rows, (x) => x.field.area, (x) => x.npv).map(([k, v]) => ({ name: tmap('area', k), value: v })))}
          <div class="card-head section-gap"><h2>${t('byHc')}</h2></div>${barsHtml(hcSplit(r.rows))}</div>
      </div>
      <div class="card section-gap">
        <div class="card-head"><h2>${t('fieldsOwned')}</h2></div>
        <div class="tbl-wrap"><table><thead><tr><th>${t('colField')}</th><th>${t('colArea')}</th><th>${t('colOperator')}</th><th class="r">${t('share')}</th><th class="r">${t('colRem')}</th><th class="r">${t('colProd', y)}</th><th class="r">${t('colValue')}</th><th class="r">${t('colPerBoe')}</th></tr></thead><tbody>
        ${r.rows.map((x) => `<tr class="link" data-href="#/felt/${x.field.slug}"><td><a href="#/felt/${x.field.slug}">${esc(x.field.name)}</a></td><td>${esc(tmap('area', x.field.area))}</td><td>${x.operator ? `<span class="tag prod">${t('operator')}</span>` : esc(shortCompany(x.field.operator))}</td><td class="r">${pct(x.share, 2)}</td><td class="r">${nf(x.remBoe, 1)}</td><td class="r">${nf(kboed(x.q0), 1)}</td><td class="r ${x.npv < 0 ? 'neg' : ''}">${money(x.npv, { bare: true })}</td><td class="r">${perBoe(x.npv, x.remBoe)}</td></tr>`).join('')}
        </tbody></table></div>
      </div>`;
    wireExplorer(el, 'company');
    $$('tr.link', el).forEach((tr) => tr.addEventListener('click', (e) => { if (!e.target.closest('a')) location.hash = tr.dataset.href; }));
    animateBars(el);
    if (window.Chart && r.rows.length) {
      const top = r.rows.slice(0, 12);
      charts.push(new Chart($('#c-comp'), {
        type: 'bar',
        data: { labels: top.map((x) => x.field.name), datasets: [{ label: t('value'), data: top.map((x) => toCur(x.npv)), backgroundColor: top.map((x) => hcColor(x.field)), borderRadius: 4 }] },
        options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => money(top[c.dataIndex].npv) } } }, scales: { x: { ticks: { callback: (x) => nf(x) } }, y: { grid: { display: false } } }, onClick: (e, els) => { if (els[0]) location.hash = `#/felt/${top[els[0].index].field.slug}`; } },
      }));
    }
  }
  function groupBy(rows, key, val) {
    const m = new Map(); for (const r of rows) m.set(key(r), (m.get(key(r)) || 0) + val(r));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }
  function hcSplit(rows) {
    const p = V.prices({ ...V.DEFAULTS, ...state.a }); const g = { oil: 0, gas: 0, ngl: 0 };
    for (const r of rows) { g.oil += r.remBoe * r.v.mix.liquids * p.oil; g.gas += r.remBoe * r.v.mix.gas * p.gas; g.ngl += r.remBoe * r.v.mix.ngl * p.ngl; }
    return [{ name: t('gasProd'), value: g.gas, color: COLORS.gas }, { name: t('oil'), value: g.oil, color: COLORS.oil }, { name: t('ngl'), value: g.ngl, color: COLORS.ngl }];
  }

  // ----- rankings -----
  function viewRank(el) {
    const R = state.rank, y = state.data.lastFullYear;
    const tabs = `<div class="seg" role="tablist"><button type="button" data-tab="fields" class="${R.tab === 'fields' ? 'on' : ''}">${t('rankFields')}</button><button type="button" data-tab="companies" class="${R.tab === 'companies' ? 'on' : ''}">${t('rankCompanies')}</button></div>`;
    let rows, cols;
    if (R.tab === 'fields') {
      rows = state.data.fields.map((f) => { const v = state.vals.get(f.slug); return { href: `#/felt/${f.slug}`, name: f.name, area: tmap('area', f.area), areaKey: f.area, status: tmap('status', f.status), statusKey: f.status, operator: shortCompany(f.operator), rem: v.remBoe, prod: kboed(v.q0), npv: v.npv, perBoe: v.remBoe > 0 ? v.npv / v.remBoe : -Infinity, end: v.endYear || 0 }; })
        .filter((r) => (!R.q || r.name.toLowerCase().includes(R.q.toLowerCase())) && (!R.area || r.areaKey === R.area) && (!R.status || r.statusKey === R.status));
      cols = [['name', t('colField')], ['area', t('colArea')], ['status', t('colStatus')], ['operator', t('colOperator')], ['rem', t('colRem'), 'r'], ['prod', t('colProd', y), 'r'], ['npv', t('colValue'), 'r'], ['perBoe', t('colPerBoe'), 'r'], ['end', t('colEnd'), 'r']];
    } else {
      rows = state.companies.map((c) => { const v = V.valueCompany(c.name, state.data.fields, state.vals); return { href: `#/selskap/${c.slug}`, name: c.name, fields: v.rows.length, operated: v.operated, rem: v.remBoe, prod: kboed(v.q0), npv: v.npv, perBoe: v.remBoe > 0 ? v.npv / v.remBoe : -Infinity }; })
        .filter((r) => r.fields && (!R.q || r.name.toLowerCase().includes(R.q.toLowerCase())));
      cols = [['name', t('company')], ['fields', t('colFields'), 'r'], ['operated', t('operator'), 'r'], ['rem', t('colRem'), 'r'], ['prod', t('colProd', y), 'r'], ['npv', t('colValue'), 'r'], ['perBoe', t('colPerBoe'), 'r']];
    }
    const sortKey = cols.some((c) => c[0] === R.sort) ? R.sort : 'npv';
    rows.sort((a, b) => { const x = a[sortKey], z = b[sortKey]; const c = typeof x === 'string' ? x.localeCompare(z, 'nb') : x - z; return R.asc ? c : -c; });
    const cell = (r, k) => {
      if (k === 'name') return `<a href="${r.href}">${esc(r.name)}</a>`;
      if (k === 'npv') return `<span class="${r.npv < 0 ? 'neg' : ''}">${money(r.npv, { bare: true })}</span>`;
      if (k === 'perBoe') return Number.isFinite(r.perBoe) ? nf(toCur(r.perBoe), state.cur === 'NOK' ? 0 : 1) : '–';
      if (k === 'rem') return nf(r.rem, 1);
      if (k === 'prod') return nf(r.prod, 1);
      if (k === 'end') return r.end || '–';
      return esc(String(r[k]));
    };
    el.innerHTML = `<div class="title-row"><h1>${t('rankTitle')}</h1>${tabs}</div>
      <div class="card">
        <div class="filters">
          <input type="search" id="rq" placeholder="${t('search')}" value="${esc(R.q)}" aria-label="${t('search')}">
          ${R.tab === 'fields' ? `<select id="ra" aria-label="${t('filterArea')}"><option value="">${t('filterArea')}</option>${['North sea', 'Norwegian sea', 'Barents sea'].map((a) => `<option value="${a}"${R.area === a ? ' selected' : ''}>${tmap('area', a)}</option>`).join('')}</select>
          <select id="rs" aria-label="${t('filterStatus')}"><option value="">${t('filterStatus')}</option>${['Producing', 'Approved for production', 'Shut down'].map((s) => `<option value="${s}"${R.status === s ? ' selected' : ''}>${tmap('status', s)}</option>`).join('')}</select>` : ''}
          <span class="muted" style="align-self:center;margin-left:auto">${rows.length} · ${state.cur} ${t('mn')}/${t('bn')}</span>
        </div>
        <div class="tbl-wrap"><table><thead><tr>${cols.map(([k, l, c]) => `<th class="sortable ${c || ''} ${sortKey === k ? 'sorted' + (R.asc ? ' asc' : '') : ''}" data-sort="${k}" scope="col">${esc(l)}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((r) => `<tr class="link" data-href="${r.href}">${cols.map(([k, , c]) => `<td class="${c || ''}">${cell(r, k)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${cols.length}" class="empty">–</td></tr>`}</tbody></table></div>
      </div>`;
    $$('[data-tab]', el).forEach((b) => b.addEventListener('click', () => { R.tab = b.dataset.tab; R.sort = 'npv'; R.asc = false; route(); }));
    $$('th[data-sort]', el).forEach((th) => th.addEventListener('click', () => { const k = th.dataset.sort; if (R.sort === k) R.asc = !R.asc; else { R.sort = k; R.asc = ['name', 'area', 'status', 'operator'].includes(k); } route({ keepScroll: true }); }));
    const q = $('#rq', el); let tm;
    q.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { R.q = q.value; route({ keepScroll: true, refocus: '#rq' }); }, 150); });
    if ($('#ra', el)) $('#ra', el).addEventListener('change', (e) => { R.area = e.target.value; route({ keepScroll: true }); });
    if ($('#rs', el)) $('#rs', el).addEventListener('change', (e) => { R.status = e.target.value; route({ keepScroll: true }); });
    $$('tr.link', el).forEach((tr) => tr.addEventListener('click', (e) => { if (!e.target.closest('a')) location.hash = tr.dataset.href; }));
  }

  // ----- historical (whole-life) view -----
  function histAll() {
    const out = new Map();
    if (!state.hist) return out;
    for (const f of state.data.fields) {
      const h = V.valueHistory(f, state.hist, state.a, state.data.lastFullYear, state.overrides[f.slug] || {});
      if (h) out.set(f.slug, h);
    }
    return out;
  }
  const irrText = (irr) => (irr == null ? '–' : irr < 0 ? '< 0 %' : irr >= 3 ? '> 300 %' : pct(irr * 100, 0));

  function viewHistory(el) {
    if (!state.hist) { el.innerHTML = `<div class="empty">${t('loadError')}</div>`; return; }
    const H = histAll();
    const R = state.hrank || (state.hrank = { sort: 'pre', asc: false, q: '', area: '' });
    const all = [...H.values()];
    const s = (k) => all.reduce((x, r) => x + r[k], 0);
    const pre = s('pre'), preHist = s('preHist'), prod = s('prodTotal'), prodHist = s('prodHist');
    const base = state.hist.cpiBaseYear;
    // shelf time series
    const byYear = new Map();
    for (const r of all) for (const row of r.rows) {
      const o = byYear.get(row.year) || { hist: 0, fc: 0 };
      if (row.hist) o.hist += row.pre; else o.fc += row.pre;
      byYear.set(row.year, o);
    }
    const years = [...byYear.keys()].filter((y) => y >= 1970 && y <= 2060).sort((a, b) => a - b);
    // shelf production by product (million boe per day): Sodir history + forecast × each field's remaining-reserve mix
    const lastY = state.data.lastFullYear, D = V.BOE_PER_SM3 / 365;
    const prodBy = new Map();
    const addP = (y, k, v) => { const o = prodBy.get(y) || { oil: 0, gas: 0, ngl: 0, fOil: 0, fGas: 0, fNgl: 0 }; o[k] += v; prodBy.set(y, o); };
    for (const f of state.data.fields) {
      for (const p of f.prod) if (p[0] <= lastY) { addP(p[0], 'oil', (p[1] + p[4]) * D); addP(p[0], 'gas', p[2] * D); addP(p[0], 'ngl', p[3] * D); }
      const h = H.get(f.slug); if (!h) continue;
      const m = V.mix(f);
      for (const r of h.rows) if (!r.hist && r.year > lastY && r.q > 0) { const q = r.q / 365; addP(r.year, 'fOil', q * m.liquids); addP(r.year, 'fGas', q * m.gas); addP(r.year, 'fNgl', q * m.ngl); }
    }
    const pYears = [...prodBy.keys()].filter((y) => y >= 1970 && y <= 2060).sort((a, b) => a - b);
    const cpi = new Map(state.hist.cpi), cpiNow = cpi.get(base);
    const brentReal = new Map(state.hist.prices.map(([y, b]) => [y, b * cpiNow / cpi.get(y)]));

    let rows = state.data.fields.filter((f) => H.has(f.slug)).map((f) => {
      const h = H.get(f.slug);
      return { f, href: `#/felt/${f.slug}`, name: f.name, area: tmap('area', f.area), areaKey: f.area, start: h.startYear, prodTotal: h.prodTotal, capex: h.capex, pre: h.pre, orig: h.npvPost, irr: h.irr == null ? -2 : h.irr, realised: h.prodTotal > 0 ? h.prodHist / h.prodTotal : 0 };
    }).filter((r) => (!R.q || r.name.toLowerCase().includes(R.q.toLowerCase())) && (!R.area || r.areaKey === R.area));
    const cols = [['name', t('colField')], ['area', t('colArea')], ['start', t('colStart'), 'r'], ['prodTotal', t('colLifeProd'), 'r'], ['capex', t('colCapexReal'), 'r'], ['pre', t('colPre'), 'r'], ['orig', t('colOrig'), 'r'], ['irr', t('colIrr'), 'r'], ['realised', t('colRealised'), 'r']];
    const key = cols.some((c) => c[0] === R.sort) ? R.sort : 'pre';
    rows.sort((a, b) => { const x = a[key], z = b[key]; const c = typeof x === 'string' ? x.localeCompare(z, 'nb') : x - z; return R.asc ? c : -c; });
    const cell = (r, k) => {
      if (k === 'name') return `<a href="${r.href}">${esc(r.name)}</a>`;
      if (k === 'prodTotal') return nf(r.prodTotal, 0);
      if (['capex', 'pre', 'orig'].includes(k)) return `<span class="${r[k] < 0 ? 'neg' : ''}">${money(r[k], { bare: true })}</span>`;
      if (k === 'irr') return irrText(r.irr === -2 ? null : r.irr);
      if (k === 'realised') return pct(r.realised * 100, 0);
      return esc(String(r[k]));
    };
    const src = state.hist.sources;
    el.innerHTML = `
      <section class="hero hero-grid">
        <div>
          <div class="eyebrow">${t('histEyebrow')}</div>
          <h1>${t('histTitle')}</h1>
          <div class="hero-value">${money(pre)}</div>
          <p class="hero-sub">${t('histIntro', base)}</p>
        </div>
      </section>
      <div class="kpis">
        <div class="kpi hl"><div class="l">${t('histKpiPre')}</div><div class="v">${money(pre)}</div><div class="s">${t('histKpiPreSub', pct(preHist / pre * 100, 0))}</div></div>
        <div class="kpi"><div class="l">${t('histKpiTax')}</div><div class="v">${money(s('tax'))}</div><div class="s">${t('histKpiTaxSub')}</div></div>
        <div class="kpi"><div class="l">${t('histKpiCapex')}</div><div class="v">${money(s('capex'))}</div><div class="s">${t('histKpiCapexSub')}</div></div>
        <div class="kpi"><div class="l">${t('histKpiProd')}</div><div class="v">${nf(prod / 1000, 1)}</div><div class="s">${t('histKpiProdSub', pct(prodHist / prod * 100, 0))}</div></div>
      </div>
      <div class="card section-gap">
        <div class="card-head"><h2>${t('histProdChart')}</h2><span class="muted">${t('histProdSub')}</span></div>
        <div class="chart-box" style="height:340px"><canvas id="c-hprod"></canvas></div>
      </div>
      <div class="card section-gap">
        <div class="card-head"><h2>${t('histChart')}</h2><span class="muted">${t('histChartSub', state.cur)}</span></div>
        <div class="chart-box" style="height:340px"><canvas id="c-hist"></canvas></div>
      </div>
      <div class="card section-gap">
        <div class="card-head"><h2>${t('histTable')}</h2></div>
        <div class="filters">
          <input type="search" id="hq" placeholder="${t('search')}" value="${esc(R.q)}" aria-label="${t('search')}">
          <select id="ha" aria-label="${t('filterArea')}"><option value="">${t('filterArea')}</option>${['North sea', 'Norwegian sea', 'Barents sea'].map((a) => `<option value="${a}"${R.area === a ? ' selected' : ''}>${tmap('area', a)}</option>`).join('')}</select>
          <span class="muted" style="align-self:center;margin-left:auto">${rows.length} · ${state.cur} ${t('mn')}/${t('bn')}</span>
        </div>
        <div class="tbl-wrap"><table><thead><tr>${cols.map(([k, l, c]) => {
          const tip = I18N[state.lang].histTips[k](base, pct(state.a.discount * 100, 1));
          return `<th class="sortable ${c || ''} ${key === k ? 'sorted' + (R.asc ? ' asc' : '') : ''}" data-sort="${k}" scope="col">${esc(l)}<button type="button" class="info" data-tip="${esc(tip)}" aria-label="${esc(t('infoLabel'))}: ${esc(l)}">i</button></th>`;
        }).join('')}</tr></thead>
        <tbody>${rows.map((r) => `<tr class="link" data-href="${r.href}">${cols.map(([k, , c]) => `<td class="${c || ''}">${cell(r, k)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      </div>
      <div class="grid g-2 section-gap">
        <div class="card"><div class="card-head"><h2>${t('histSources')}</h2></div>
          <ul class="src-list">${src.map((x) => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)}</a><span>${esc(x.series)}${x.note ? ` · ${esc(x.note)}` : ''}</span></li>`).join('')}</ul></div>
        <div class="card"><div class="card-head"><h2>${t('histLimits')}</h2></div>
          <ul class="src-list plain">${t('histLimitList').map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      </div>`;
    $$('th[data-sort]', el).forEach((th) => th.addEventListener('click', (e) => { if (e.target.closest('.info')) return; const k = th.dataset.sort; if (R.sort === k) R.asc = !R.asc; else { R.sort = k; R.asc = ['name', 'area', 'start'].includes(k); } route({ keepScroll: true }); }));
    const q = $('#hq', el); let tm;
    q.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { R.q = q.value; route({ keepScroll: true, refocus: '#hq' }); }, 150); });
    $('#ha', el).addEventListener('change', (e) => { R.area = e.target.value; route({ keepScroll: true }); });
    $$('tr.link', el).forEach((tr) => tr.addEventListener('click', (e) => { if (!e.target.closest('a')) location.hash = tr.dataset.href; }));
    if (window.Chart) {
      const soft = (c) => (/^#[0-9a-f]{6}$/i.test(c) ? c + '59' : c);
      const pd = (k) => pYears.map((y) => { const v = prodBy.get(y)[k]; return v > 0.0005 ? v : null; });
      const pBar = (label, k, c, fc) => ({ label, data: pd(k), backgroundColor: fc ? soft(c) : c, borderColor: c, borderWidth: fc ? 1 : 0, stack: 'p', barPercentage: 1, categoryPercentage: 0.9 });
      charts.push(new Chart($('#c-hprod'), {
        type: 'bar',
        data: {
          labels: pYears,
          datasets: [
            pBar(t('histOil'), 'oil', COLORS.oil), pBar(t('histGas'), 'gas', COLORS.gas), pBar(t('histNgl'), 'ngl', COLORS.ngl),
            pBar(t('histOilFc'), 'fOil', COLORS.oil, true), pBar(t('histGasFc'), 'fGas', COLORS.gas, true), pBar(t('histNglFc'), 'fNgl', COLORS.ngl, true),
          ],
        },
        options: {
          maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
          scales: { x: { stacked: true, grid: { display: false }, ticks: { maxTicksLimit: 12 } }, y: { stacked: true, ticks: { callback: (x) => nf(x, 1) } } },
          plugins: {
            legend: { labels: { filter: (i) => i.datasetIndex < 3 }, onClick: (e, item, lg) => { const ch = lg.chart; [item.datasetIndex, item.datasetIndex + 3].forEach((k) => ch.setDatasetVisibility(k, !ch.isDatasetVisible(k))); ch.update(); } },
            tooltip: { callbacks: {
            label: (c) => (c.raw == null ? null : `${c.dataset.label}: ${nf(c.raw, 2)}`),
            footer: (items) => { const s = items.reduce((x, i) => x + (i.raw || 0), 0); return s ? `${t('histProdTotal')}: ${nf(s, 2)}` : ''; },
          } } },
        },
      }));
      const conv = (v) => toCur(v) / 1000;
      charts.push(new Chart($('#c-hist'), {
        data: {
          labels: years,
          datasets: [
            { type: 'bar', label: t('histRealised'), data: years.map((y) => conv(byYear.get(y).hist) || null), backgroundColor: COLORS.accent, borderRadius: 2, stack: 's', yAxisID: 'y' },
            { type: 'bar', label: t('histForecast'), data: years.map((y) => conv(byYear.get(y).fc) || null), backgroundColor: COLORS.accentSoft, borderColor: COLORS.accent, borderWidth: 1, borderRadius: 2, stack: 's', yAxisID: 'y' },
            { type: 'line', label: t('histBrent'), data: years.map((y) => brentReal.get(y) ?? null), borderColor: COLORS.oil, borderWidth: 2, pointRadius: 0, tension: 0.2, yAxisID: 'y1', spanGaps: false },
          ],
        },
        options: {
          maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
          scales: { x: { stacked: true, grid: { display: false }, ticks: { maxTicksLimit: 12 } }, y: { stacked: true, ticks: { callback: (x) => nf(x) } }, y1: { position: 'right', grid: { display: false }, ticks: { callback: (x) => '$' + nf(x) } } },
          plugins: { tooltip: { callbacks: { label: (c) => c.raw == null ? null : c.dataset.yAxisID === 'y1' ? `${c.dataset.label}: $${nf(c.raw, 0)}` : `${c.dataset.label}: ${nf(c.raw, 1)} ${t('bn')}` } } },
        },
      }));
    }
  }

  // ----- Wiki (petroleum economics glossary, Investopedia-style) -----
  const WIKI = () => window.FV_WIKI || [];
  const wikiCat = (k) => (window.FV_WIKI_CATS[k] || {})[state.lang] || k;
  const wikiTitle = (e) => e.title[state.lang] || e.title.nb;
  const bySlug = (s) => WIKI().find((e) => e.slug === s);
  // English rendering of formulas written with Norwegian words (longest phrases first) + decimal point
  const EN_FORMULA = [
    ['avregnes mot endelig skatt året etter', 'settled against final tax the year after'], ['Anslått skatt for inntektsåret', 'Estimated tax for the income year'],
    ['Skattepliktig inntekt (olje)', 'Taxable income (oil)'], ['Særskattegrunnlag', 'Special tax base'], ['Fremført verdi', 'Carried-forward value'],
    ['Utbetaling', 'Payout'], ['Underskudd', 'Loss'], ['Skatteverdi', 'Tax value'], ['Normpris', 'Norm price'], ['Solgt volum', 'Volume sold'],
    ['Før 2022', 'Before 2022'], ['Fra 2022', 'From 2022'], ['fremført', 'carried forward'], ['(år 0)', '(year 0)'], ['Termin', 'Instalment'],
    ['Skatt + avgifter + statens kontantstrøm', 'Tax + fees + state cash flow'], ['Faste kostnader + variable kostnader', 'Fixed costs + variable costs'],
    ['netto kontantstrøm siden virkningsdato', 'net cash flow since effective date'], ['Lete- og utbyggingskostnader', 'Exploration and development costs'],
    ['Betaling ved gjennomføring', 'Payment at closing'], ['Produksjon (fat o.e./d)', 'Production (boe/d)'], ['Tilstedeværende volum', 'Volume in place'],
    ['Gjenværende reserver', 'Remaining reserves'], ['Nåverdi etter skatt', 'After-tax present value'], ['Overskudd før skatt', 'Pre-tax profit'],
    ['EV per flytende fat', 'EV per flowing barrel'], ['Risikojustert verdi', 'Risked value'], ['Synergi etter skatt', 'After-tax synergy'],
    ['Synergi før skatt', 'Pre-tax synergy'], ['Verdi etter skatt', 'After-tax value'], ['Utvinnbart volum', 'Recoverable volume'], ['Årlig produksjon', 'Annual production'],
    ['kvalitetsjustering', 'quality adjustment'], ['andre justeringer', 'other adjustments'], ['bankens prisbane', 'bank price deck'], ['Reservetilvekst', 'Reserve additions'],
    ['Utvinningsgrad', 'Recovery factor'], ['Statens andel', 'Government take'], ['Selskapsskatt', 'Corporate tax'], ['Letekostnader', 'Exploration costs'],
    ['Investeringer', 'Investments'], ['Netto gevinst', 'Net gain'], ['Verdi mottatt', 'Value received'], ['Verdi avgitt', 'Value given'], ['2P-reserver', '2P reserves'],
    ['Capex per fat', 'Capex per barrel'], ['Opex per fat', 'Opex per barrel'], ['Markedspris', 'Market price'], ['prosessering', 'processing'], ['belåningsgrad', 'advance rate'],
    ['Lånegrense', 'Borrowing base'], ['Produksjon', 'Production'], ['Inntekter', 'Revenue'], ['utbygging', 'development'], ['Platåår', 'Plateau years'], ['Reserver', 'Reserves'],
    ['Refusjon', 'Refund'], ['Helning', 'Slope'], ['Kostnad', 'Cost'], ['kontanter', 'cash'], ['Skatt', 'Tax'], ['Avskr.', 'Depr.'], ['Inv.', 'Capex'], ['Pris', 'Price'],
    ['mrd. Sm³ gass', 'bn Sm³ gas'], ['mill. fat o.e.', 'MMboe'], ['fat o.e.', 'boe'], ['USD/fat', 'USD/bbl'],
  ];
  function wikiExpr(expr) {
    if (state.lang !== 'en') return expr;
    let s = expr;
    for (const [nb, en] of EN_FORMULA) s = s.split(nb).join(en);
    return s.replace(/(\d),(\d)/g, '$1.$2');
  }
  const wikiLinks = (html) => html.replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (m, s, text) => {
    const e = bySlug(s);
    return e ? `<a href="#/wiki/${s}">${text || esc(wikiTitle(e))}</a>` : (text || s);
  });
  const sortTitle = (e) => wikiTitle(e).replace(/^[«"(]/, '');

  function viewWiki(el, slug) {
    if (slug) return viewWikiArticle(el, slug);
    const W = state.wiki || (state.wiki = { q: '', cat: '' });
    const fold = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
    const q = fold(W.q.trim());
    const hits = WIKI().filter((e) => (!W.cat || e.cat === W.cat) &&
      (!q || fold([wikiTitle(e), e.short[state.lang], ...(e.keys[state.lang] || [])].join(' ')).includes(q)))
      .sort((a, b) => sortTitle(a).localeCompare(sortTitle(b), state.lang === 'nb' ? 'nb' : 'en'));
    const groups = new Map();
    for (const e of hits) { const L = sortTitle(e)[0].toUpperCase(); if (!groups.has(L)) groups.set(L, []); groups.get(L).push(e); }
    const featured = WIKI().filter((e) => e.featured);
    el.innerHTML = `
      <section class="wiki-hero">
        <div class="eyebrow">Feltverdi Wiki</div>
        <h1>${t('wikiTitle')}</h1>
        <p class="hero-sub">${t('wikiIntro', WIKI().length)}</p>
        <div class="picker wiki-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" id="wq" placeholder="${t('wikiSearch')}" value="${esc(W.q)}" aria-label="${t('wikiSearch')}"></div>
        <div class="wiki-cats" role="group" aria-label="${t('wikiCategories')}">
          <button type="button" data-cat="" class="${!W.cat ? 'on' : ''}">${t('wikiAll')}</button>
          ${Object.keys(window.FV_WIKI_CATS).map((k) => `<button type="button" data-cat="${k}" class="${W.cat === k ? 'on' : ''}">${esc(wikiCat(k))}</button>`).join('')}
        </div>
      </section>
      ${!q && !W.cat ? `<section class="section-gap"><h2 class="wiki-h2">${t('wikiFeatured')}</h2>
        <div class="wiki-feature-grid">${featured.map((e) => `<a class="wiki-feature" href="#/wiki/${e.slug}"><span class="wiki-cat-label">${esc(wikiCat(e.cat))}</span><strong>${esc(wikiTitle(e))}</strong><span>${esc(e.short[state.lang])}</span></a>`).join('')}</div></section>` : ''}
      <section class="section-gap">
        <div class="az" aria-label="A–Å">${[...groups.keys()].map((L) => `<button type="button" data-letter="${L}">${L}</button>`).join('')}</div>
        ${hits.length ? [...groups.entries()].map(([L, list]) => `
          <div class="az-group" id="az-${L}"><div class="az-letter">${L}</div>
            <ul class="wiki-list">${list.map((e) => `<li><a href="#/wiki/${e.slug}">${esc(wikiTitle(e))}</a><span class="wiki-cat-label">${esc(wikiCat(e.cat))}</span><p>${esc(e.short[state.lang])}</p></li>`).join('')}</ul>
          </div>`).join('') : `<div class="empty">${t('wikiNoHits')}</div>`}
      </section>`;
    const input = $('#wq', el); let tm;
    input.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { W.q = input.value; route({ keepScroll: true, refocus: '#wq' }); }, 120); });
    $$('[data-cat]', el).forEach((b) => b.addEventListener('click', () => { W.cat = b.dataset.cat; route({ keepScroll: true }); }));
    $$('[data-letter]', el).forEach((b) => b.addEventListener('click', () => { const g = $('#az-' + CSS.escape(b.dataset.letter), el); if (g) window.scrollTo({ top: g.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' }); }));
  }

  function viewWikiArticle(el, slug) {
    const e = bySlug(slug);
    if (!e) return viewNotFound(el);
    const L = state.lang, title = wikiTitle(e);
    const sorted = [...WIKI()].sort((a, b) => sortTitle(a).localeCompare(sortTitle(b), L === 'nb' ? 'nb' : 'en'));
    const i = sorted.indexOf(e), prev = sorted[i - 1], next = sorted[i + 1];
    const sameCat = WIKI().filter((x) => x.cat === e.cat && x !== e);
    const sections = [['what', t('wikiWhat', title)], ['keys', t('wikiKeys')], ['understand', t('wikiUnderstand', title)]]
      .concat(e.formula ? [['formula', t('wikiFormula')]] : []).concat(e.example ? [['example', t('wikiExample')]] : []).concat(e.related && e.related.length ? [['related', t('wikiRelated')]] : []);
    el.innerHTML = `
      <nav class="crumbs" aria-label="Brødsmuler"><a href="#/wiki">Wiki</a><span>›</span><button type="button" class="crumb-cat" data-cat="${e.cat}">${esc(wikiCat(e.cat))}</button><span>›</span><span aria-current="page">${esc(title)}</span></nav>
      <div class="wiki-layout">
        <article class="wiki-article">
          <h1>${esc(title)}</h1>
          <p class="wiki-meta">Feltverdi Wiki · ${esc(wikiCat(e.cat))}</p>
          <section id="sec-what"><h2>${t('wikiWhat', esc(title))}</h2><p class="wiki-lead">${esc(e.short[L])}</p></section>
          <aside id="sec-keys" class="wiki-keys"><h2>${t('wikiKeys')}</h2><ul>${e.keys[L].map((k) => `<li>${esc(k)}</li>`).join('')}</ul></aside>
          <section id="sec-understand"><h2>${t('wikiUnderstand', esc(title))}</h2>${wikiLinks(e.body[L])}</section>
          ${e.formula ? `<section id="sec-formula"><h2>${t('wikiFormula')}</h2>
            <div class="formula" role="math" aria-label="${esc(title)}">${wikiExpr(e.formula.expr)}</div>
            ${e.formula.vars && e.formula.vars.length ? `<p class="formula-where">${t('wikiWhere')}</p><dl class="formula-vars">${e.formula.vars.map(([sym, nb, en]) => `<dt>${wikiExpr(sym)}</dt><dd>${esc(L === 'nb' ? nb : en)}</dd>`).join('')}</dl>` : ''}</section>` : ''}
          ${e.example ? `<section id="sec-example"><h2>${t('wikiExample')}</h2><div class="wiki-example">${wikiLinks(e.example[L])}</div></section>` : ''}
          ${e.feltverdi ? `<p class="wiki-use"><a href="${e.feltverdi}">${t('wikiUse')}</a></p>` : ''}
          ${e.related && e.related.length ? `<section id="sec-related"><h2>${t('wikiRelated')}</h2><div class="wiki-related">${e.related.map(bySlug).filter(Boolean).map((r) => `<a href="#/wiki/${r.slug}"><strong>${esc(wikiTitle(r))}</strong><span>${esc(r.short[L])}</span></a>`).join('')}</div></section>` : ''}
          <nav class="wiki-pager">${prev ? `<a href="#/wiki/${prev.slug}"><span>← ${t('wikiPrev')}</span><strong>${esc(wikiTitle(prev))}</strong></a>` : '<span></span>'}${next ? `<a class="nx" href="#/wiki/${next.slug}"><span>${t('wikiNext')} →</span><strong>${esc(wikiTitle(next))}</strong></a>` : ''}</nav>
        </article>
        <aside class="wiki-side">
          <div class="wiki-toc"><h3>${t('wikiContents')}</h3><ol>${sections.map(([id, label]) => `<li><button type="button" data-sec="${id}">${esc(label)}</button></li>`).join('')}</ol></div>
          <div class="wiki-toc"><h3>${t('wikiMoreIn', esc(wikiCat(e.cat)))}</h3><ul>${sameCat.map((x) => `<li><a href="#/wiki/${x.slug}">${esc(wikiTitle(x))}</a></li>`).join('')}</ul></div>
        </aside>
      </div>`;
    $$('[data-sec]', el).forEach((b) => b.addEventListener('click', () => { const s = $('#sec-' + b.dataset.sec, el); if (s) window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' }); }));
    const cc = $('.crumb-cat', el); if (cc) cc.addEventListener('click', () => { (state.wiki || (state.wiki = { q: '', cat: '' })).cat = cc.dataset.cat; state.wiki.q = ''; location.hash = '#/wiki'; });
  }

  // ----- Deals: ticker + list of NCS transactions -----
  const DEAL_TYPES = ['merger', 'corporate', 'asset', 'swap'];
  // Headline with the price where one is stated: "X buys Y for 4.43 billion USD"
  function dealAmount(v) {
    if (v >= 1000) { const b = v / 1000; const dec = Math.abs(b * 10 - Math.round(b * 10)) < 1e-9 ? (Number.isInteger(b) ? 0 : 1) : 2; return t('amtBn', nf(b, dec)); }
    return t('amtMn', nf(v, Number.isInteger(v) ? 0 : 1));
  }
  function dealHeadline(d) {
    const title = d.title[state.lang];
    if (d.valueUsdM == null) return title;
    const a = dealAmount(d.valueUsdM);
    const kind = d.type === 'swap' ? 'swap' : d.type === 'merger' ? 'merger' : /up to/i.test(d.valueNote.en || '') ? 'upto' : 'for';
    return t('dealHead_' + kind, title, a);
  }
  function dealDate(d) {
    const dt = new Date(d.date + 'T12:00:00');
    const opts = d.datePrecision === 'month' ? { month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' };
    return new Intl.DateTimeFormat(locale(), opts).format(dt);
  }
  // Deal values are shown in nominal USD as reported at announcement
  function renderTicker() {
    const box = $('#ticker');
    if (!box || !state.deals) return;
    const latest = state.deals.deals.slice(0, 5);
    const item = (d) => `<a href="#/deal/${d.id}" class="tick-item"><span class="tick-date">${esc(dealDate(d))}</span><span class="tick-type t-${d.type}">${esc(t('dealType_' + d.type))}</span><span class="tick-title">${esc(d.title[state.lang])}</span>${d.valueUsdM != null ? `<span class="tick-val">USD ${d.valueUsdM >= 1000 ? nf(d.valueUsdM / 1000, 2) + ' ' + t('bn') : nf(d.valueUsdM, Number.isInteger(d.valueUsdM) ? 0 : 1) + ' ' + t('mn')}</span>` : ''}</a>`;
    const items = latest.map(item).join('<span class="tick-sep" aria-hidden="true">•</span>');
    box.innerHTML = `<div class="wrap ticker-inner"><a class="tick-label" href="#/deals">${t('tickerLabel')}</a>
      <div class="tick-viewport"><div class="tick-track"><div class="tick-set">${items}</div><div class="tick-set" aria-hidden="true">${items.replace(/href=/g, 'tabindex="-1" href=')}</div></div></div></div>`;
    box.hidden = false;
  }

  // Assessment block for one deal: verdict, confidence, key metrics (Sodir-based) and written rationale
  function dealAssessment(d, m) {
    const a = d.assessment;
    if (!a) return '';
    const base = state.dealMetrics ? state.dealMetrics.baseYear : 2026;
    const usd = (v) => (v >= 1000 ? `${nf(v / 1000, 2)} ${t('bn')}` : `${nf(v, 0)} ${t('mn')}`);
    const cells = [];
    if (m) {
      cells.push([t('dmProd'), `${nf(m.prodKboed, 1)} ${t('kboed')}`]);
      // [label, value, explanation]
      cells.push([t('dmRem'), `${nf(m.remMmboe, 0)} ${t('mmboe')}`]);
      if (m.perFlowing) cells.push([t('dmFlowing'), `USD ${nf(m.perFlowing, 0)}`, t('dmT_flowing')]);
      if (m.perBoe) cells.push([t('dmPerBoe'), `USD ${nf(m.perBoe, 1)} <span class="muted">(${nf(m.perBoePctBrent, 0)} % ${t('dmOfBrent')})</span>`, t('dmT_perBoe')]);
      cells.push([t('dmHindsight', base), `USD ${usd(m.hindsightValue)}`, t('dmT_hindsight')]);
      if (m.ratio && !m.partial) cells.push([t('dmRatio'), `${nf(m.ratio, 2)}× <span class="muted">(${nf(m.relative, 2)}× ${t('dmMedian')})</span>`, t('dmT_ratio')]);
      if (m.reserveGrowth && m.year < state.data.lastFullYear) cells.push([t('dmGrowth'), `${nf(m.reserveGrowth, 2)}×`, t('dmT_growth')]);
    }
    return `<div class="deal-assess v-${a.verdict}">
      <div class="da-head"><span class="verdict v-${a.verdict}">${esc(t('verdict_' + a.verdict))}</span></div>
      ${m && m.relative && !m.partial ? `<p class="da-plain">${esc(Math.abs(m.relative - 1) < 0.05 ? t('dealsPlainNear') : t(m.relative > 1 ? 'dealsPlainAbove' : 'dealsPlainBelow', pct(Math.abs(m.relative - 1) * 100, 0)))}</p>` : ''}
      ${cells.length ? `<dl class="da-metrics">${cells.map(([k, v, tip]) => `<div><dt>${esc(k)}${tip ? tipBtn(tip) : ''}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}
      <p>${esc(a.text[state.lang])}</p>
      ${m && m.items && m.items.length ? `<p class="da-stakes muted">${t('dmStakes')}: ${m.items.slice(0, 8).map((i) => `<a href="#/felt/${i.slug}">${esc(i.field)}</a> ${nf(i.share, i.share % 1 ? 2 : 0)} %`).join(' · ')}${m.items.length > 8 ? ' …' : ''}</p>` : ''}
    </div>`;
  }

  function viewDeals(el, focusId) {
    if (!state.deals) { el.innerHTML = `<div class="empty">${t('loadError')}</div>`; return; }
    const D = state.dealsUi || (state.dealsUi = { q: '', type: '', status: '', verdict: '' });
    const all = state.deals.deals;
    const DM = (state.dealMetrics && state.dealMetrics.metrics) || {};
    const fold = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
    const q = fold(D.q.trim());
    const list = all.filter((d) => (!D.type || d.type === D.type) && (!D.status || d.status === D.status) && (!D.verdict || (d.assessment && d.assessment.verdict === D.verdict)) &&
      (!q || fold([d.title[state.lang], d.summary[state.lang], ...d.parties, ...d.fields].join(' ')).includes(q)));
    const disclosed = all.filter((d) => d.valueUsdM != null);
    const largest = [...disclosed].sort((a, b) => b.valueUsdM - a.valueUsdM)[0];
    const years = [...new Set(all.map((d) => +d.date.slice(0, 4)))].sort((a, b) => a - b);
    const byYear = new Map(years.map((y) => [y, { n: 0, v: 0 }]));
    for (const d of all) { const o = byYear.get(+d.date.slice(0, 4)); o.n++; o.v += d.valueUsdM || 0; }
    const groups = new Map();
    for (const d of list) { const y = d.date.slice(0, 4); if (!groups.has(y)) groups.set(y, []); groups.get(y).push(d); }
    const fieldLink = (n) => { const s = slugify(n); return fieldBySlug(s) ? `<a class="tag" href="#/felt/${s}">${esc(n)}</a>` : `<span class="tag">${esc(n)}</span>`; };
    el.innerHTML = `
      <section class="hero hero-grid">
        <div>
          <div class="eyebrow">${t('dealsEyebrow')}</div>
          <h1>Deals</h1>
          <p class="hero-sub">${t('dealsIntroPlain', all.length, years[0], years[years.length - 1])}</p>
        </div>
      </section>
      <div class="kpis">
        <div class="kpi hl"><div class="l">${t('dealsKpiCount')}</div><div class="v">${all.length}</div><div class="s">${years[0]}–${years[years.length - 1]}</div></div>
        <div class="kpi"><div class="l">${t('dealsKpiValue')}</div><div class="v">USD ${nf(disclosed.reduce((s, d) => s + d.valueUsdM, 0) / 1000, 1)} ${t('bn')}</div><div class="s">${t('dealsKpiValueSub', disclosed.length)}</div></div>
        <div class="kpi"><div class="l">${t('dealsKpiLargest')}</div><div class="v">USD ${nf(largest.valueUsdM / 1000, 1)} ${t('bn')}</div><div class="s">${esc(largest.parties.join(' / '))}</div></div>
        <div class="kpi"><div class="l">${t('dealsKpiPending')}</div><div class="v">${all.filter((d) => d.status === 'pending').length}</div><div class="s">${t('dealsKpiPendingSub')}</div></div>
      </div>
      <div class="grid g-2 section-gap">
        <div class="card">
          <div class="card-head"><h2>${t('dealsChart')}</h2><span class="muted">${t('dealsChartSub')}</span></div>
          <div class="chart-box" style="height:260px"><canvas id="c-deals"></canvas></div>
        </div>
        <div class="card deal-method">
          <div class="card-head"><h2>${t('dealsMethodTitle')}</h2></div>
          ${t('dealsMethodPlain', state.dealMetrics ? nf(state.dealMetrics.baseline, 2) : '–', state.dealMetrics ? state.dealMetrics.n : 0)}
          <div class="verdict-legend">${['cheap', 'fair', 'full', 'expensive'].map((v) => `<span class="verdict v-${v}">${t('verdict_' + v)}</span><span class="muted">${t('verdictPlain_' + v)}</span>`).join('')}</div>
          <details class="dd-caveats"><summary>${t('dealsMethodMore')}</summary>${t('dealsMethod', state.dealMetrics ? nf(state.dealMetrics.baseline, 2) : '–', state.dealMetrics ? state.dealMetrics.n : 0, pct((state.dealMetrics ? state.dealMetrics.discount : 0.08) * 100, 0))}</details>
        </div>
      </div>
      <div class="card section-gap">
        <div class="filters">
          <input type="search" id="dq" placeholder="${t('dealsSearch')}" value="${esc(D.q)}" aria-label="${t('dealsSearch')}">
          <div class="wiki-cats deal-types" role="group" aria-label="${t('dealsTypeLabel')}">
            <button type="button" data-dtype="" class="${!D.type ? 'on' : ''}">${t('wikiAll')}</button>
            ${DEAL_TYPES.map((k) => `<button type="button" data-dtype="${k}" class="${D.type === k ? 'on' : ''}">${t('dealType_' + k)}</button>`).join('')}
          </div>
          <select id="dst" aria-label="Status"><option value="">${t('dealsAllStatus')}</option><option value="completed"${D.status === 'completed' ? ' selected' : ''}>${t('dealStatus_completed')}</option><option value="pending"${D.status === 'pending' ? ' selected' : ''}>${t('dealStatus_pending')}</option></select>
          <select id="dvd" aria-label="${t('dealsVerdictLabel')}"><option value="">${t('dealsAllVerdicts')}</option>${['cheap', 'fair', 'full', 'expensive', 'early', 'na'].map((v) => `<option value="${v}"${D.verdict === v ? ' selected' : ''}>${t('verdict_' + v)}</option>`).join('')}</select>
          <span class="muted" style="align-self:center;margin-left:auto">${list.length} / ${all.length}</span>
        </div>
        ${list.length ? [...groups.entries()].map(([y, ds]) => `
          <div class="deal-year"><div class="az-letter">${y}</div><div class="deal-list">
          ${ds.map((d) => `<article class="deal ${d.id === focusId ? 'focus' : ''}" id="deal-${d.id}">
            <div class="deal-top"><span class="deal-date">${esc(dealDate(d))}</span><span class="tick-type t-${d.type}">${esc(t('dealType_' + d.type))}</span><span class="tag ${d.status === 'completed' ? 'prod' : 'appr'}">${esc(t('dealStatus_' + d.status))}${d.completed && d.status === 'completed' ? ` ${esc(new Intl.DateTimeFormat(locale(), { month: 'short', year: 'numeric' }).format(new Date(d.completed + 'T12:00:00')))}` : ''}</span></div>
            <h3>${esc(dealHeadline(d))}</h3>
            <p>${esc(d.summary[state.lang])}</p>
            <div class="deal-meta">
              <div><span class="l">${t('dealsParties')}</span>${d.parties.map((p) => `<span class="tag">${esc(p)}</span>`).join('')}</div>
              ${d.fields.length ? `<div><span class="l">${t('dealsFields')}</span>${d.fields.map(fieldLink).join('')}</div>` : ''}
            </div>
            ${dealAssessment(d, DM[d.id])}
            <div class="deal-foot"><div><span class="deal-val">${d.valueUsdM == null ? t('dealsNoValue') : `USD ${d.valueUsdM >= 1000 ? nf(d.valueUsdM / 1000, 2) + ' ' + t('bn') : nf(d.valueUsdM, Number.isInteger(d.valueUsdM) ? 0 : 1) + ' ' + t('mn')}`}</span> <span class="muted">${esc(d.valueNote[state.lang])}</span>${d.priceAdjusted ? `<span class="muted"> · ${t('dealsAdjPrice', usdStated(d.priceAdjusted.valueUsdM))}</span>` : ''}</div>
              <span class="deal-links"><a class="dd-open" href="#/deal/${d.id}">${t('ddOpen')}</a><a href="${esc(d.source)}" target="_blank" rel="noopener">${t('dealsSource')}</a></span></div>
          </article>`).join('')}
          </div></div>`).join('') : `<div class="empty">${t('dealsNoHits')}</div>`}
        <p class="muted" style="font-size:13px;margin:18px 2px 0">${t('dealsNote', state.deals.updated)}</p>
      </div>`;
    const input = $('#dq', el); let tm;
    input.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { D.q = input.value; route({ keepScroll: true, refocus: '#dq' }); }, 150); });
    $$('[data-dtype]', el).forEach((b) => b.addEventListener('click', () => { D.type = b.dataset.dtype; route({ keepScroll: true }); }));
    $('#dst', el).addEventListener('change', (e) => { D.status = e.target.value; route({ keepScroll: true }); });
    $('#dvd', el).addEventListener('change', (e) => { D.verdict = e.target.value; route({ keepScroll: true }); });
    if (window.Chart) {
      charts.push(new Chart($('#c-deals'), {
        data: { labels: years, datasets: [
          { type: 'bar', label: t('dealsChartValue'), data: years.map((y) => byYear.get(y).v / 1000), backgroundColor: COLORS.accent, borderRadius: 3, yAxisID: 'y' },
          { type: 'line', label: t('dealsChartCount'), data: years.map((y) => byYear.get(y).n), borderColor: COLORS.oil, backgroundColor: COLORS.oil, borderWidth: 2, pointRadius: 3, tension: 0.2, yAxisID: 'y1' },
        ] },
        options: { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
          scales: { x: { grid: { display: false } }, y: { beginAtZero: true, title: { display: true, text: `USD ${t('bn')}` }, ticks: { callback: (x) => nf(x) } }, y1: { position: 'right', beginAtZero: true, grid: { display: false }, ticks: { precision: 0 }, title: { display: true, text: t('dealsChartCount') } } },
          plugins: { tooltip: { callbacks: { label: (c) => c.dataset.yAxisID === 'y' ? `${c.dataset.label}: USD ${nf(c.raw, 1)} ${t('bn')}` : `${c.dataset.label}: ${c.raw}` } } } },
      }));
    }
    if (focusId) {
      const card = $('#deal-' + CSS.escape(focusId), el);
      if (card) setTimeout(() => window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 140, behavior: 'smooth' }), 50);
    }
  }

  // ---------- deal analysis page (#/deal/<id>) ----------
  // Values every stake that changed hands from the deal year: actual years (Sodir volumes and investments, historical prices)
  // plus the Feltverdi forecast. Real USD of the CPI base year, discounted to the deal year. Everything follows the assumptions bar.
  const DD_DECKS = { low: { brent: 55, gasEur: 25 }, high: { brent: 90, gasEur: 45 } };
  const DD_RATES = [0.06, 0.08, 0.10, 0.12];
  function ddCpiF(year) { const c = new Map(state.hist.cpi); return c.get(state.hist.cpiBaseYear) / (c.get(year) || c.get(state.hist.cpiBaseYear)); }
  // Flat deck at the deal year's actual prices (real terms), used as "what the stakes looked worth at the time"
  function ddDeckThen(year) {
    const pr = state.hist.prices.find((p) => p[0] === year) || state.hist.prices.find((p) => p[0] === year - 1);
    if (!pr || year > state.data.lastFullYear) return null;
    const rf = ddCpiF(pr[0]), b = pr[1] * rf, g = pr[2] * rf;
    return { brent: b, gasEur: g * V.MMBTU_PER_BOE_GAS / (1.72 * V.DEFAULTS.eurusd), flat: { b, g } };
  }
  // Aggregated yearly cash flow for a package of stakes [{slug, share}] from `year`
  function ddPackage(items, year, deck, extraOv) {
    const a = { ...state.a, ...(deck ? { brent: deck.brent, gasEur: deck.gasEur } : {}) };
    const byYear = new Map(), per = [];
    for (const it of items) {
      const f = fieldBySlug(it.slug); if (!f) continue;
      const ov = { ...(state.overrides[f.slug] || {}), ...((extraOv || {})[f.slug] || {}) };
      const rows = V.stakeCashflow(f, state.hist, a, state.data.lastFullYear, ov, year, deck && deck.flat ? { flat: deck.flat } : {});
      const s = it.share / 100;
      per.push({ it, f, s, rows });
      for (const r of rows) {
        const o = byYear.get(r.year) || { year: r.year, hist: r.hist, q: 0, rev: 0, opex: 0, capex: 0, tax: 0, fcf: 0, taxInh: 0 };
        for (const k of ['q', 'rev', 'opex', 'capex', 'tax', 'fcf', 'taxInh']) o[k] += (r[k] || 0) * s;
        byYear.set(r.year, o);
      }
    }
    if (items.taxPos > 0) {
      const o = byYear.get(year) || { year, hist: year <= state.data.lastFullYear, q: 0, rev: 0, opex: 0, capex: 0, tax: 0, fcf: 0, taxInh: 0 };
      o.tax -= items.taxPos; o.fcf += items.taxPos; o.taxPos = items.taxPos; byYear.set(year, o);
    }
    return { rows: [...byYear.values()].sort((x, y) => x.year - y.year), per };
  }
  // Stakes of a deal plus the company tax positions bought with it (real USD at the deal year)
  const ddItems = (m, year) => Object.assign([...m.items], { taxPos: (m.taxPositionUsdM || 0) > 0 ? m.taxPositionUsdM : 0 });
  // PV at the deal year of the deductions the buyer takes over (stakes) and of company tax positions
  function ddTaxBenefit(rows, year, r) {
    let inh = 0, pos = 0;
    for (const x of rows) { const df = Math.pow(1 + r, -(x.year - year + 0.5)); inh += (x.taxInh || 0) * df; if (x.taxPos) pos += x.taxPos * df; }
    return { inh, pos, total: inh + pos };
  }
  const ddPv = (rows, year, r) => rows.reduce((s, x) => s + x.fcf * Math.pow(1 + r, -(x.year - year + 0.5)), 0);
  // Real after-tax return on a price: the discount rate at which the stakes' PV equals the price
  function ddIrr(rows, year, price) {
    const f = (r) => ddPv(rows, year, r) - price;
    // Scan down from a high rate to the first rate where PV covers the price (the highest root). Very low or negative rates
    // are not meaningful here: late decommissioning costs dominate the PV when the rate approaches or falls below zero.
    if (!(price > 0)) return null;
    if (f(1.5) > 0) return 1.5;
    for (let r = 1.5; r > -0.2; r -= 0.01) {
      if (f(r - 0.01) >= 0) { let lo = r - 0.01, hi = r; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } return (lo + hi) / 2; }
    }
    return null;
  }
  function ddPayback(rows, year, r, price) {
    let c = 0;
    for (const x of rows) { c += x.fcf * Math.pow(1 + r, -(x.year - year + 0.5)); if (c >= price) return x.year; }
    return null;
  }
  // Brent grid with gas moving in proportion; returns [[brent, value]]
  function ddBrentCurve(items, year, extraOv) {
    const out = [];
    for (let b = 40; b <= 120; b += 10) out.push([b, ddPv(ddPackage(items, year, { brent: b, gasEur: state.a.gasEur * b / state.a.brent }, extraOv).rows, year, state.a.discount)]);
    return out;
  }
  function ddBreakeven(curve, price) {
    for (let i = 1; i < curve.length; i++) {
      const [b0, v0] = curve[i - 1], [b1, v1] = curve[i];
      if ((v0 - price) * (v1 - price) <= 0 && v1 !== v0) return b0 + (price - v0) / (v1 - v0) * (b1 - b0);
    }
    return null;
  }
  function ddTaxCard(d, tb, V0, year) {
    const tp = d.taxPosition;
    const row = (k, v) => `<div><dt>${k}</dt><dd>${v}</dd></div>`;
    return `<div class="card section-gap dd-tax">
        <div class="card-head"><h2>${t('ddH_tax')}</h2><span class="muted">${t('ddTaxSub', year)}</span></div>
        ${intro('ddL_tax')}
        <dl class="dd-list">
          ${row(t('ddTaxInh') + tipBtn(t('ddT_taxInh')), money(tb.inh))}
          ${tp ? row(t('ddTaxPos'), money(tb.pos)) : ''}
          ${row(`<strong>${t('ddTaxTotal')}</strong>`, `<strong>${money(tb.total)}</strong> <span class="muted">(${V0 > 0 ? t('ddTaxShare', pct(tb.total / V0 * 100, 0)) : '–'})</span>`)}
        </dl>
        ${tp ? `<p class="muted dd-small">${esc(tp.note[state.lang])} · ${t('ddAdjSources')}: ${tp.sources.map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noopener">${i + 1}</a>`).join(', ')}</p>` : ''}
      </div>`;
  }
  const ddUpsideOv = (d) => (d.upside && d.upside.length ? Object.fromEntries(d.upside.map((u) => [u.slug, { remAdd: u.remAdd }])) : null);
  const signed = (usd) => `${usd >= 0 ? '+' : '−'}${money(Math.abs(usd))}`;
  const gainCls = (v) => (v >= 0 ? 'pos' : 'neg');

  function ddHeader(d) {
    const fieldLink = (n) => { const s = slugify(n); return fieldBySlug(s) ? `<a class="tag" href="#/felt/${s}">${esc(n)}</a>` : `<span class="tag">${esc(n)}</span>`; };
    return `<nav class="crumbs"><a href="#/deals/${esc(d.id)}">${t('ddBack')}</a></nav>
      <section class="hero dd-hero">
        <div class="eyebrow">${esc(dealDate(d))} · ${esc(t('dealType_' + d.type))} · ${esc(t('dealStatus_' + d.status))}</div>
        <h1>${esc(dealHeadline(d))}</h1>
        <p class="hero-sub">${esc(d.summary[state.lang])}</p>
        <div class="deal-meta">
          <div><span class="l">${t('dealsParties')}</span>${d.parties.map((p) => `<span class="tag">${esc(p)}</span>`).join('')}</div>
          ${d.fields.length ? `<div><span class="l">${t('dealsFields')}</span>${d.fields.map(fieldLink).join('')}</div>` : ''}
        </div>
      </section>`;
  }
  // ---- plain-language helpers for the deal pages ----
  const tipBtn = (text) => `<button type="button" class="info" data-tip="${esc(text)}" aria-label="${esc(t('infoLabel'))}">i</button>`;
  const intro = (key, ...args) => `<p class="dd-intro">${esc(t(key, ...args))}</p>`;
  const usdStated = (v) => `USD ${v >= 1000 ? nf(v / 1000, 2) + ' ' + t('bn') : nf(v, Number.isInteger(v) ? 0 : 1) + ' ' + t('mn')}`;
  // Production on the whole shelf in a year (thousand boe per day), for "x % of all production"
  function shelfKboed(year) {
    let s = 0;
    for (const f of state.data.fields) { const p = f.prod.find((r) => r[0] === year); if (p) s += p[5]; }
    return s * BOE * 1000 / 365;
  }
  const listJoin = (arr) => (arr.length > 1 ? `${arr.slice(0, -1).join(', ')}${t('ddP_and')}${arr[arr.length - 1]}` : arr[0] || '');
  const stakeTxt = (i) => t('ddP_what1', pct(i.share, i.share % 1 ? 1 : 0), i.field);
  function ddWhat(items) {
    const its = [...items].sort((a, b) => b.remMmboe - a.remMmboe);
    if (its.length === 1) return stakeTxt(its[0]);
    return t('ddP_whatN', its.length, listJoin(its.slice(0, 3).map((i) => i.field)));
  }
  // "In short": plain sentences generated from the numbers
  function ddPlainList(d, m, c) {
    const out = [];
    const headline = d.valueUsdM ?? m.priceUsdM;
    out.push(headline != null ? t('ddP_bought', c.buyer, ddWhat(m.items), c.seller, usdStated(headline), m.year) : t('ddP_boughtNoPrice', c.buyer, ddWhat(m.items), c.seller, m.year));
    if (d.priceAdjusted) out.push(t('ddP_adj', usdStated(d.priceAdjusted.valueUsdM), t('ddAdjBasis_' + d.priceAdjusted.basis)));
    if (c.taxBenefit > 0.5) out.push(t('ddP_tax', money(c.taxBenefit)));
    if (m.prodKboed >= 0.1) {
      const sh = m.prodKboed / shelfKboed(m.year - 1) * 100;
      const yrs = m.remMmboe / (m.prodKboed * 0.365);
      out.push(t('ddP_size', nf(m.prodKboed, m.prodKboed < 10 ? 1 : 0), pct(sh, sh < 1 ? 1 : 0), nf(m.remMmboe, 0), nf(yrs, 0)));
    } else if (m.remMmboe > 0) out.push(t('ddP_sizeNoProd', nf(m.remMmboe, 0)));
    if (m.perBoe && m.brent) out.push(t('ddP_perBoe', nf(m.perBoe, 1), nf(m.brent, 0)));
    if (m.partial) out.push(t('ddP_partial'));
    else if (c.vsTyp != null) out.push(Math.abs(c.vsTyp) < 0.05 ? t('ddP_near') : t(c.vsTyp > 0 ? 'ddP_above' : 'ddP_below', pct(Math.abs(c.vsTyp) * 100, 0)));
    if (c.histSpan && c.price && c.realised > 0) out.push(t('ddP_realised', money(c.realised), pct(c.realised / c.price * 100, 0), c.histSpan[0], c.histSpan[1]));
    return out;
  }
  // Price scale: cheap – usual – full – expensive, with a marker at price ÷ typical price
  // Verdict band of a price/value ratio relative to the median (same thresholds as scripts/evaluate-deals.js)
  const verdictBand = (rel) => (rel < 0.8 ? 'cheap' : rel <= 1.1 ? 'fair' : rel <= 1.4 ? 'full' : 'expensive');
  function ddGauge(rel, verdict) {
    if (rel == null || !Number.isFinite(rel)) return '';
    // The verdict is set with the standard assumptions; with the user's own (Brent, gas, discount rate …) the live ratio
    // can land in another band – say so instead of showing two contradicting labels.
    const live = verdictBand(rel);
    const differs = ['cheap', 'fair', 'full', 'expensive'].includes(verdict) && live !== verdict;
    const stops = [[0.5, 0], [0.8, 25], [1.1, 50], [1.4, 75], [2.0, 100]];
    let pos = rel <= 0.5 ? 0 : 100;
    for (let i = 1; i < stops.length; i++) if (rel > stops[i - 1][0] && rel <= stops[i][0]) { pos = stops[i - 1][1] + (rel - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]) * 25; break; }
    return `<div class="gauge" role="img" aria-label="${esc(t('ddGaugeNote', nf(rel, 2)))}">
      <div class="gauge-title">${t('ddGaugeTitle')}</div>
      <div class="gauge-track">
        <div class="gauge-bar">${['cheap', 'fair', 'full', 'expensive'].map((v) => `<span class="g-${v}">${esc(t('verdict_' + v))}</span>`).join('')}</div>
        <div class="gauge-mark" style="left:${pos.toFixed(1)}%"><b>${nf(rel, 2)}×</b></div>
      </div>
      <p class="muted dd-small">${esc(t('ddGaugeNote', nf(rel, 2)))}</p>
      ${differs ? `<p class="dd-small gauge-diff">${esc(t('ddGaugeDiff', t('verdict_' + live), t('verdict_' + verdict)))}</p>` : ''}
    </div>`;
  }
  function ddGlossaryCard() {
    return `<div class="card section-gap dd-gloss">
      <div class="card-head"><h2>${t('ddGlossary')}</h2></div>
      <dl class="gloss">${t('ddGloss').map(([k, v, slug]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)} <a href="#/wiki/${slug}">${t('ddGlossaryMore')}</a></dd></div>`).join('')}</dl>
      <details class="dd-caveats"><summary>${t('ddCaveatsTitle')}</summary><p class="muted dd-small">${t('ddCaveats')}</p></details>
    </div>`;
  }

  function ddConclusion(d, plain = null) {
    const a = d.assessment;
    return `<div class="card dd-conc v-${a ? a.verdict : 'na'}">
        <div class="card-head"><h2>${t('ddShort')}</h2>${a ? `<span class="verdict v-${a.verdict}">${esc(t('verdict_' + a.verdict))}</span>` : ''}</div>
        ${plain && plain.list.length ? `<ul class="dd-plain">${plain.list.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
        ${plain && plain.gauge ? plain.gauge : ''}
        ${a ? `<h3 class="dd-sub">${t('ddExpert')}</h3><p class="dd-lead">${esc(a.text[state.lang])}</p>` : ''}
        <div class="deal-foot"><div><span class="deal-val">${d.valueUsdM == null ? t('dealsNoValue') : `USD ${d.valueUsdM >= 1000 ? nf(d.valueUsdM / 1000, 2) + ' ' + t('bn') : nf(d.valueUsdM, Number.isInteger(d.valueUsdM) ? 0 : 1) + ' ' + t('mn')}`}</span> <span class="muted">${esc(d.valueNote[state.lang])}</span></div>
          <a href="${esc(d.source)}" target="_blank" rel="noopener">${t('dealsSource')}</a></div>
      </div>`;
  }
  function ddStakeTable(items, per, year, rate, label) {
    const vals = new Map(per.map((p) => [p.it.slug, ddPv(p.rows.map((r) => ({ ...r, fcf: r.fcf * p.s })), year, rate)]));
    const tot = [...vals.values()].reduce((s, v) => s + v, 0);
    const sum = (k) => items.reduce((s, i) => s + (i[k] || 0), 0);
    return `<div class="tbl-wrap"><table class="tbl dd-tbl">
      ${label ? `<caption>${esc(label)}</caption>` : ''}
      <thead><tr><th>${t('ddColField')}</th><th class="r num">${t('ddColShare')}</th><th class="r num">${t('ddColProd')}</th><th class="r num">${t('ddColRes')}</th><th class="r num">${t('ddColValue')}</th><th class="r num">${t('ddColPct')}</th></tr></thead>
      <tbody>${items.map((i) => { const v = vals.get(i.slug) ?? 0; return `<tr><td><a href="#/felt/${i.slug}">${esc(i.field)}</a>${i.later ? ` <span class="tag appr dd-later">${t('ddLater')}</span><button type="button" class="info" data-tip="${esc(t('ddLaterTip'))}" aria-label="${esc(t('ddLaterTip'))}">i</button>` : ''}</td><td class="r num">${nf(i.share, i.share % 1 ? 2 : 0)} %</td><td class="r num">${nf(i.prodKboed, 1)} ${t('kboed')}</td><td class="r num">${nf(i.remMmboe, 1)} ${t('mmboe')}</td><td class="r num ${v < 0 ? 'neg' : ''}">${money(v)}</td><td class="r num">${tot > 0 ? pct(v / tot * 100, 0) : '–'}</td></tr>`; }).join('')}</tbody>
      <tfoot><tr><td>${t('ddTotal')}</td><td></td><td class="r num">${nf(sum('prodKboed'), 1)} ${t('kboed')}</td><td class="r num">${nf(sum('remMmboe'), 0)} ${t('mmboe')}</td><td class="r num">${money(tot)}</td><td class="r num">100 %</td></tr></tfoot>
    </table></div>`;
  }

  // Each side's own valuation: buyer's required return + opex synergies vs seller's required return.
  // Defaults: the global discount rate, no synergies, adjusted by `views` in deals.json (deltas, documented per deal).
  function ddViewInputs(d) {
    const v = d.views || {};
    const def = { buyerRate: state.a.discount + (v.buyerRateDelta || 0), sellerRate: state.a.discount + (v.sellerRateDelta || 0), synergy: v.synergy || 0 };
    const own = (state.dealViews || {})[d.id] || {};
    return { def, cur: { ...def, ...own }, custom: Object.keys(own).length > 0 };
  }
  function ddViewsCard(d, year, rows, price, baseline, buyer, seller) {
    const { def, cur, custom } = ddViewInputs(d);
    const synRows = rows.map((x) => ({ ...x, fcf: x.fcf + cur.synergy * x.opex * (1 - 0.78) }));
    const bMax = ddPv(synRows, year, cur.buyerRate) * baseline;
    const sMin = ddPv(rows, year, cur.sellerRate) * baseline;
    const out = price == null ? null : bMax >= sMin ? (price > bMax ? 'Seller' : price < sMin ? 'Buyer' : 'Both') : 'None';
    const lo = Math.min(bMax, sMin, price ?? Infinity) * 0.85, hi = Math.max(bMax, sMin, price ?? 0) * 1.1;
    const pos = (v) => `${Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100)).toFixed(1)}%`;
    const zoneL = Math.min(bMax, sMin), zoneR = Math.max(bMax, sMin);
    const inp = (k, label, val, step, max) => `<label class="dd-inp"><span>${esc(label)}</span><span class="dd-inp-row"><input type="number" data-dv="${k}" value="${nf(val * 100, 1).replace(',', '.').replace(/\s/g, '')}" step="${step}" min="0" max="${max}" inputmode="decimal"><span>%</span></span></label>`;
    const row = (k, v, cls = '') => `<div><dt>${k}</dt><dd class="${cls}">${v}</dd></div>`;
    const note = d.views && d.views.note ? `<p class="muted dd-small">${t('ddViewsDefault')} ${esc(d.views.note[state.lang])}</p>` : '';
    return `<div class="card section-gap dd-views">
      <div class="card-head"><h2>${t('ddH_views')}</h2><span class="muted">${t('ddViewsSub')}${custom ? ` · <button type="button" class="linkish" data-dv-reset>${t('ddReset')}</button>` : ''}</span></div>
      ${intro('ddL_views')}
      <div class="dd-inps">
        ${inp('buyerRate', t('ddInBuyerRate', buyer), cur.buyerRate, 0.5, 20)}
        ${inp('synergy', t('ddInSyn', buyer), cur.synergy, 1, 40)}
        ${inp('sellerRate', t('ddInSellerRate', seller), cur.sellerRate, 0.5, 20)}
      </div>
      ${note}
      <div class="dd-range" role="img" aria-label="${esc(`${t('ddRangeSeller')} ${money(sMin)}, ${t('ddRangeBuyer')} ${money(bMax)}${price != null ? `, ${t('ddRangePrice')} ${money(price)}` : ''}`)}">
        <div class="dd-range-track"><div class="dd-range-zone ${bMax >= sMin ? 'ok' : 'gap'}" style="left:${pos(zoneL)};width:calc(${pos(zoneR)} - ${pos(zoneL)})"></div></div>
        <div class="dd-mark seller" style="left:${pos(sMin)}"><span>${t('ddRangeSeller')}<br><b>${money(sMin)}</b></span></div>
        <div class="dd-mark buyer" style="left:${pos(bMax)}"><span>${t('ddRangeBuyer')}<br><b>${money(bMax)}</b></span></div>
        ${price != null ? `<div class="dd-mark price" style="left:${pos(price)}"><span>${t('ddRangePrice')}<br><b>${money(price)}</b></span></div>` : ''}
      </div>
      <dl class="dd-list">
        ${row(esc(t('ddBuyerMax', buyer)), money(bMax))}
        ${row(esc(t('ddSellerMin', seller)), money(sMin))}
        ${price != null ? row(esc(t('ddSurplusB', buyer)), signed(bMax - price), gainCls(bMax - price)) : ''}
        ${price != null ? row(esc(t('ddSurplusS', seller)), signed(price - sMin), gainCls(price - sMin)) : ''}
        <div class="dd-tot"><dt>${t('ddSurplusTot')}</dt><dd class="${gainCls(bMax - sMin)}">${signed(bMax - sMin)}</dd></div>
      </dl>
      ${out ? `<p class="dd-lead">${t('ddOut' + out)}</p>` : ''}
      <p class="muted dd-small">${t('ddViewsNote')}</p>
    </div>`;
  }
  function bindDealViews(el, d) {
    $$('[data-dv]', el).forEach((i) => i.addEventListener('change', () => {
      const v = parseFloat(String(i.value).replace(',', '.'));
      if (!Number.isFinite(v)) return;
      const lim = i.dataset.dv === 'synergy' ? 40 : 20;
      state.dealViews = state.dealViews || {};
      state.dealViews[d.id] = { ...(state.dealViews[d.id] || {}), [i.dataset.dv]: Math.min(lim, Math.max(0, v)) / 100 };
      store.set('dv', state.dealViews);
      route({ keepScroll: true });
    }));
    const r = $('[data-dv-reset]', el);
    if (r) r.addEventListener('click', () => { delete state.dealViews[d.id]; store.set('dv', state.dealViews); route({ keepScroll: true }); });
  }

  function viewDealDetail(el, id) {
    const d = state.deals && state.deals.deals.find((x) => x.id === id);
    if (!d) { viewNotFound(el); return; }
    const m = state.dealMetrics && state.dealMetrics.metrics[d.id];
    if (!m || !state.hist || (!m.swap && m.priceUsdM == null && m.hindsightValue == null)) {
      el.innerHTML = ddHeader(d) + ddConclusion(d) + `<div class="card section-gap"><p>${state.hist ? t('ddNoModel') : t('ddNoHist')}</p></div>` + ddGlossaryCard();
      return;
    }
    if (m.swap) { viewSwapDetail(el, d, m); return; }
    const year = m.year, r = state.a.discount, last = state.data.lastFullYear;
    const upOv = ddUpsideOv(d);
    const price = m.priceUsdM != null ? m.priceUsdM * ddCpiF(year) : null;
    const items = ddItems(m, year);
    const base = ddPackage(items, year);
    const V0 = ddPv(base.rows, year, r);
    const tb = ddTaxBenefit(base.rows, year, r);
    const histRows = base.rows.filter((x) => x.hist);
    const vHist = ddPv(histRows, year, r);
    const thenDeck = ddDeckThen(year);
    const vThen = thenDeck ? ddPv(ddPackage(items, year, thenDeck).rows, year, r) : null;
    const up = upOv ? ddPackage(items, year, null, upOv) : null;
    const vUp = up ? ddPv(up.rows, year, r) : null;
    const hasPrice = price != null;
    const gain = hasPrice ? V0 - price : null;
    const irr = hasPrice ? ddIrr(base.rows, year, price) : null;
    const payback = hasPrice ? ddPayback(base.rows, year, r, price) : null;
    const ratio = hasPrice && V0 > 0 ? price / V0 : null;
    const baseline = state.dealMetrics.baseline;
    const buyer = m.buyer || d.parties[0], seller = m.seller || d.parties[1] || '–';
    const pctTxt = (v) => (v == null ? '–' : v >= 1.5 ? '> 150 %' : pct(v * 100, 1));
    // scenarios
    const decks = [['low', DD_DECKS.low, `${t('ddDeckLow')} ($${DD_DECKS.low.brent} / €${DD_DECKS.low.gasEur})`], ['base', null, `${t('ddDeckBase')} ($${nf(state.a.brent)} / €${nf(state.a.gasEur)})`], ['high', DD_DECKS.high, `${t('ddDeckHigh')} ($${DD_DECKS.high.brent} / €${DD_DECKS.high.gasEur})`]];
    if (thenDeck) decks.push(['then', thenDeck, `${t('ddDeckThen', year)} ($${nf(thenDeck.brent)} / €${nf(thenDeck.gasEur)})`]);
    const scen = decks.map(([k, deck, label]) => ({ k, label, rows: k === 'base' ? base.rows : ddPackage(items, year, deck).rows }));
    if (up) scen.push({ k: 'up', label: t('ddDeckUp'), rows: up.rows });
    const curve = ddBrentCurve(items, year);
    const be = hasPrice ? ddBreakeven(curve, price) : null;
    const realised = histRows.reduce((s, x) => s + x.fcf, 0);
    const histSpan = histRows.length ? [histRows[0].year, histRows[histRows.length - 1].year] : null;

    // Headline: the model undervalues all deals alike (median price/value = baseline), so the price is judged against
    // "typical market value" = model value × baseline. The raw model NPV is kept as a secondary figure.
    const Vtyp = V0 * baseline;
    const vsTyp = hasPrice && Vtyp > 0 ? price / Vtyp - 1 : null;
    const gainTyp = hasPrice ? Vtyp - price : null;
    const kpis = hasPrice ? `
      <div class="kpis k6 dd-kpis">
        <div class="kpi"><div class="l">${t('ddKpiPaid')}${tipBtn(t('ddT_paid'))}</div><div class="v">${money(price)}</div><div class="s">${t('ddKpiPaidSub', 'USD ' + (m.priceUsdM >= 1000 ? nf(m.priceUsdM / 1000, 2) + ' ' + t('bn') : nf(m.priceUsdM, 0) + ' ' + t('mn')), year)}</div></div>
        <div class="kpi"><div class="l">${t('ddKpiModel')}${tipBtn(t('ddT_model'))}</div><div class="v">${money(V0)}</div><div class="s">${t('ddKpiValueSub', year, pct(r * 100, 0))}</div></div>
        <div class="kpi"><div class="l">${t('ddKpiTypical')}${tipBtn(t('ddT_typical', nf(baseline, 2)))}</div><div class="v">${money(Vtyp)}</div><div class="s">${t('ddKpiTypicalSub', nf(baseline, 2))}</div></div>
        <div class="kpi hl"><div class="l">${t('ddKpiVsTyp')}${tipBtn(t('ddT_vsTyp'))}</div><div class="v ${vsTyp == null ? '' : gainCls(-vsTyp)}">${vsTyp == null || m.partial ? '–' : `${vsTyp >= 0 ? '+' : '−'}${pct(Math.abs(vsTyp) * 100, 0)}`}</div><div class="s">${m.partial ? t('verdict_na') : ratio ? t('ddKpiVsTypSub', nf(ratio, 2), nf(baseline, 2)) : ''}</div></div>
        <div class="kpi"><div class="l">${t('ddKpiIrr')}${tipBtn(t('ddT_irr', pct(r * 100, 0)))}</div><div class="v">${irr == null ? t('ddIrrNone') : pctTxt(irr)}</div><div class="s">${t(irr == null ? 'ddKpiIrrSubNone' : 'ddKpiIrrSub')}</div></div>
        <div class="kpi"><div class="l">${t('ddKpiPayback')}${tipBtn(t('ddT_payback'))}</div><div class="v">${payback || t('ddNotWithin')}</div><div class="s">${t('ddKpiPaybackSub')}</div></div>
      </div>` : `<div class="kpis dd-kpis"><div class="kpi hl"><div class="l">${t('ddKpiValue')}</div><div class="v">${money(V0)}</div><div class="s">${t('ddKpiValueSub', year, pct(r * 100, 0))}</div></div><div class="kpi"><div class="l">${t('ddKpiPaid')}</div><div class="v">–</div><div class="s">${t('dealsNoValue')}</div></div></div>`;

    const row = (k, v, cls = '') => `<div><dt>${k}</dt><dd class="${cls}">${v}</dd></div>`;
    const buyerCard = `<div class="card dd-side">
        <div class="card-head"><h2>${esc(t('ddBuyer', buyer))}</h2></div>
        ${intro('ddL_buyer')}
        <dl class="dd-list">
          ${hasPrice ? row(t('ddPaid'), money(price)) : ''}
          ${row(t('ddGot'), money(V0))}
          ${tb.total > 0.5 ? row(t('ddTaxRow') + tipBtn(t('ddT_taxRow')), `${money(tb.total)} <span class="muted">(${V0 > 0 ? pct(tb.total / V0 * 100, 0) : '–'})</span>`) : ''}
          ${histSpan ? row(t('ddRealised', histSpan[0], histSpan[1]) + tipBtn(t('ddT_realised')), `${money(vHist)} <span class="muted">(${V0 > 0 ? pct(vHist / V0 * 100, 0) : '–'})</span>`) : ''}
          ${hasPrice && !m.partial ? row(t('ddVsTypRow') + tipBtn(t('ddT_vsTypRow')), signed(gainTyp), gainCls(gainTyp)) : ''}
          ${hasPrice ? row(`${t('ddGain')} <span class="muted">(${t('ddKpiModel').toLowerCase()})</span>${tipBtn(t('ddT_gain'))}`, signed(gain), gainCls(gain)) : ''}
          ${hasPrice ? row(t('ddIrr') + tipBtn(t('ddT_irr', pct(r * 100, 0))), irr == null ? t('ddIrrNone') : pctTxt(irr)) : ''}
          ${hasPrice ? row(t('ddPayback') + tipBtn(t('ddT_payback')), payback || t('ddNotWithin')) : ''}
          ${vUp != null ? row(`${t('ddUpsideRow')}`, `${money(vUp)}${hasPrice ? ` <span class="${gainCls(vUp - price)}">(${signed(vUp - price)})</span>` : ''}`) : ''}
        </dl>
        ${hasPrice ? `<p>${t('ddBuyerText', money(price), money(V0), signed(gain), (gain >= 0 ? '+' : '−') + pct(Math.abs(gain / price * 100), 0), irr == null ? t('ddIrrNone') : pctTxt(irr), pct(r * 100, 0))}</p>` : ''}
        ${d.upside ? d.upside.map((u) => `<p class="muted dd-small">${t('ddUpsideRow')}: ${esc(u.label[state.lang])}</p>`).join('') : ''}
      </div>`;
    const sellerCard = `<div class="card dd-side">
        <div class="card-head"><h2>${esc(t('ddSeller', seller))}</h2></div>
        ${intro('ddL_seller')}
        <dl class="dd-list">
          ${hasPrice ? row(t('ddReceived'), money(price)) : ''}
          ${row(t('ddGaveUp'), money(V0))}
          ${hasPrice && !m.partial ? row(t('ddVsTypRow') + tipBtn(t('ddT_vsTypRow')), signed(-gainTyp), gainCls(-gainTyp)) : ''}
          ${hasPrice ? row(`${t('ddSellerGain')} <span class="muted">(${t('ddKpiModel').toLowerCase()})</span>`, signed(-gain), gainCls(-gain)) : ''}
          ${vThen != null ? row(t('ddThenValue', nf(thenDeck.brent)) + tipBtn(t('ddT_then')), money(vThen)) : ''}
          ${vThen != null && hasPrice ? row(t('ddThenGain'), signed(price - vThen), gainCls(price - vThen)) : ''}
          ${vThen != null ? row(t('ddPriceLuck') + tipBtn(t('ddT_luck')), signed(V0 - vThen), gainCls(V0 - vThen)) : ''}
          ${histSpan ? row(t('ddForgone', histSpan[0], histSpan[1]) + tipBtn(t('ddT_forgone')), money(realised)) : ''}
        </dl>
        ${hasPrice && vThen != null ? `<p>${t(price >= vThen ? 'ddSellerTextUp' : 'ddSellerTextDown', money(price), money(V0), money(vThen), money(Math.abs(price - vThen)))}</p>` : ''}
        ${d.type === 'merger' ? `<p class="muted dd-small">${t('ddPaidShares')}</p>` : ''}
      </div>`;

    const scenTable = `<div class="tbl-wrap"><table class="tbl dd-tbl">
      <thead><tr><th>${t('ddDeck')}</th><th class="r num">${t('ddColValue')}</th>${hasPrice ? `<th class="r num">${t('ddColRatio')}</th><th class="r num">${t('ddColRel')}</th><th class="r num">${t('ddColBuyer')}*</th>` : ''}</tr></thead>
      <tbody>${scen.map((s) => { const v = ddPv(s.rows, year, r); const gT = v * baseline - price; return `<tr class="${s.k === 'base' ? 'hl' : ''}"><td>${esc(s.label)}</td><td class="r num">${money(v)}</td>${hasPrice ? `<td class="r num">${v > 0 ? nf(price / v, 2) + '×' : '–'}</td><td class="r num">${v > 0 ? nf(price / v / baseline, 2) + '×' : '–'}</td><td class="r num ${gainCls(gT)}">${signed(gT)}</td>` : ''}</tr>`; }).join('')}</tbody>
      ${hasPrice ? `<caption style="caption-side:bottom;font-weight:400" class="muted dd-small">* ${t('ddVsTypRow')} (${t('ddKpiTypicalSub', nf(baseline, 2))})</caption>` : ''}
    </table></div>`;
    const sensTable = hasPrice ? `<div class="tbl-wrap"><table class="tbl dd-tbl dd-sens">
      <thead><tr><th>${t('ddDeck')}</th>${DD_RATES.map((x) => `<th class="r num">${pct(x * 100, 0)}</th>`).join('')}</tr></thead>
      <tbody>${scen.map((s) => `<tr><td>${esc(s.label)}</td>${DD_RATES.map((x) => { const g = ddPv(s.rows, year, x) * baseline - price; return `<td class="r num ${gainCls(g)}">${signed(g)}</td>`; }).join('')}</tr>`).join('')}</tbody>
    </table></div>` : '';
    const multiples = hasPrice && (m.perFlowing || m.perBoe) ? `<p class="muted">${t('ddMultiples')}: ${m.perFlowing ? `USD ${nf(m.perFlowing, 0)} ${t('ddPerFlowing')}` : ''}${m.perFlowing && m.perBoe ? ' · ' : ''}${m.perBoe ? `USD ${nf(m.perBoe, 1)} ${t('ddPerBoe')} (${nf(m.perBoePctBrent, 0)} % ${t('dmOfBrent')})` : ''}</p>` : '';

    const plain = { list: ddPlainList(d, m, { buyer, seller, vsTyp, price, realised, histSpan, taxBenefit: tb.total }), gauge: hasPrice && !m.partial && ratio ? ddGauge(ratio / baseline, d.assessment && d.assessment.verdict) : '' };
    el.innerHTML = ddHeader(d) + ddConclusion(d, plain) + `
      ${m.partial ? `<div class="card dd-warn">${t('ddPartial')}${m.note ? ` <span class="muted">(${esc(m.note)})</span>` : ''}</div>` : ''}
      ${kpis}
      <p class="muted dd-small">${t('ddLive')}</p>
      ${d.priceAdjusted ? `<div class="card section-gap dd-adj">
        <div class="card-head"><h2>${t('ddAdjTitle')}</h2><span class="muted">${t('ddAdjBasis_' + d.priceAdjusted.basis)}</span></div>
        <p class="dd-intro">${esc(d.priceAdjusted.note[state.lang])}</p>
        <p class="muted dd-small">${t('ddAdjLine', usdStated(d.valueUsdM), usdStated(d.priceAdjusted.valueUsdM))} · ${t('ddAdjSources')}: ${d.priceAdjusted.sources.map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noopener">${i + 1}</a>`).join(', ')}</p>
      </div>` : ''}
${ddTaxCard(d, tb, V0, year)}
      <div class="grid g-2 section-gap">${buyerCard}${sellerCard}</div>
      ${ddViewsCard(d, year, base.rows, m.partial ? null : price, baseline, buyer, seller)}
      <div class="card section-gap">
        <div class="card-head"><h2>${t('ddH_dcf')}</h2><span class="muted">${t('ddDcfSub', year, pct(r * 100, 0))}</span></div>
        ${intro('ddL_dcf')}
        <div class="chart-box" style="height:340px"><canvas id="c-dd"></canvas></div>
      </div>
      <div class="grid g-2 section-gap">
        <div class="card">
          <div class="card-head"><h2>${t('ddH_brent')}</h2></div>
          ${intro('ddL_brent')}
          <p class="muted dd-small">${t('ddBrentSub')}</p>
          <div class="chart-box" style="height:260px"><canvas id="c-dd-brent"></canvas></div>
          ${hasPrice ? `<p class="dd-small">${be != null ? t('ddBreakeven', nf(be, 0)) : t('ddBreakevenNone', 40, 120)}</p>` : ''}
        </div>
        <div class="card">
          <div class="card-head"><h2>${t('ddH_scen')}</h2><span class="muted">${t('ddScenSub')} (${pct(r * 100, 0)})</span></div>
          ${intro('ddL_scen')}
          ${scenTable}
          ${multiples}
        </div>
      </div>
      ${hasPrice ? `<div class="card section-gap"><div class="card-head"><h2>${t('ddH_sens')}</h2><span class="muted">${t('ddSensSubT', nf(baseline, 2))}</span></div>${intro('ddL_sens')}${sensTable}</div>` : ''}
      <div class="card section-gap">
        <div class="card-head"><h2>${t('ddH_stakes')}</h2><span class="muted">${t('ddStakesSub', year)}</span></div>
        ${intro('ddL_stakes')}
        ${ddStakeTable(m.items, base.per, year, r)}
      </div>
      ${ddGlossaryCard()}`;
    bindDealViews(el, d);
    if (!window.Chart) return;
    drawDealDcf($('#c-dd'), year, r, [{ label: '', rows: base.rows, color: COLORS.gas }], price, up ? up.rows : null);
    charts.push(new Chart($('#c-dd-brent'), {
      data: { labels: curve.map((c) => c[0]), datasets: [
        { type: 'line', label: t('ddColValue'), data: curve.map((c) => toCur(c[1])), borderColor: COLORS.accent, backgroundColor: COLORS.accentSoft, fill: true, borderWidth: 2.5, pointRadius: 3, tension: 0.2 },
        ...(hasPrice ? [{ type: 'line', label: t('ddPriceLine'), data: curve.map(() => toCur(price)), borderColor: COLORS.oil, borderDash: [6, 4], borderWidth: 2, pointRadius: 0 }] : []),
      ] },
      options: { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        scales: { x: { grid: { display: false }, title: { display: true, text: 'Brent (USD/bbl)' } }, y: { ticks: { callback: (x) => nf(x) }, title: { display: true, text: `${state.cur} ${t('mn')}` } } },
        plugins: { tooltip: { callbacks: { title: (c) => `Brent $${c[0].label}`, label: (c) => `${c.dataset.label}: ${money(c.raw / (state.cur === 'NOK' ? state.a.usdnok : 1))}` } } } },
    }));
  }

  // Cash-flow chart: yearly after-tax cash flow bars (actual vs forecast) and cumulative PV lines, optional price line
  function drawDealDcf(canvas, year, r, series, price, upRows) {
    if (!canvas) return;
    const yrs = new Set(); series.forEach((s) => s.rows.forEach((x) => yrs.add(x.year))); if (upRows) upRows.forEach((x) => yrs.add(x.year));
    const labels = [...yrs].sort((a, b) => a - b);
    const cumLine = (rows) => { const mp = new Map(rows.map((x) => [x.year, x])); let c = 0; return labels.map((y) => { const x = mp.get(y); if (x) c += x.fcf * Math.pow(1 + r, -(y - year + 0.5)); return toCur(c); }); };
    const datasets = [];
    const palette = [COLORS.gas, COLORS.oil];
    series.forEach((s, i) => {
      const mp = new Map(s.rows.map((x) => [x.year, x]));
      const c = s.color || palette[i % 2];
      datasets.push({ type: 'bar', label: s.label ? `${s.label} · ${t('fcf')}` : t('fcf'), data: labels.map((y) => (mp.has(y) ? toCur(mp.get(y).fcf) : null)), yAxisID: 'y', order: 3, borderRadius: 2,
        backgroundColor: labels.map((y) => { const x = mp.get(y); if (!x) return 'transparent'; if (x.fcf < 0) return color(COLORS.neg, x.hist ? 0.9 : 0.45); return color(c, x.hist ? 0.95 : 0.42); }),
        borderColor: labels.map((y) => { const x = mp.get(y); return x && !x.hist ? c : 'transparent'; }), borderWidth: 1 });
      datasets.push({ type: 'line', label: s.label ? `${s.label} · ${t('ddCumPv')}` : t('ddCumPv'), data: cumLine(s.rows), borderColor: series.length > 1 ? c : COLORS.accent, borderWidth: 2.5, pointRadius: 0, tension: 0.2, yAxisID: 'y1', order: 1 });
    });
    if (upRows) datasets.push({ type: 'line', label: t('ddCumPvUp'), data: cumLine(upRows), borderColor: COLORS.accent, borderDash: [3, 3], borderWidth: 2, pointRadius: 0, tension: 0.2, yAxisID: 'y1', order: 1 });
    if (price != null) datasets.push({ type: 'line', label: t('ddPriceLine'), data: labels.map(() => toCur(price)), borderColor: COLORS.oil, borderDash: [6, 4], borderWidth: 2, pointRadius: 0, yAxisID: 'y1', order: 2 });
    const last = state.data.lastFullYear;
    charts.push(new Chart(canvas, {
      data: { labels, datasets },
      options: { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 14 } },
          y: { ticks: { callback: (x) => nf(x) }, title: { display: true, text: `${t('fcf')} (${state.cur} ${t('mn')})` } },
          y1: { position: 'right', grid: { display: false }, ticks: { callback: (x) => nf(x) }, title: { display: true, text: `${t('ddCumPv')} (${state.cur} ${t('mn')})` } } },
        plugins: { tooltip: { callbacks: { title: (c) => `${c[0].label}${+c[0].label <= last ? ` · ${t('ddHist')}` : ` · ${t('ddFc')}`}`, label: (c) => (c.raw == null ? null : `${c.dataset.label}: ${nf(c.raw, 0)}`) } } } },
    }));
  }

  // Swaps: each leg is a package one party gives (plus any cash it pays). Net for party P = received − given.
  function viewSwapDetail(el, d, m) {
    const year = m.year, r = state.a.discount;
    const upOv = ddUpsideOv(d);
    const cf = ddCpiF(year);
    const parties = [...new Set(m.legs.flatMap((l) => [l.from, l.to]))];
    const legCalc = (deck, ov) => m.legs.map((l) => { const p = ddPackage(l.items, year, deck, ov); return { l, rows: p.rows, per: p.per, cash: (l.cash || 0) * cf }; });
    const netFor = (legs, party, rate = r) => legs.reduce((s, x) => { const v = ddPv(x.rows, year, rate) + x.cash; return s + (x.l.to === party ? v : 0) - (x.l.from === party ? v : 0); }, 0);
    const base = legCalc(null);
    const thenDeck = ddDeckThen(year);
    const decks = [['low', DD_DECKS.low, `${t('ddDeckLow')} ($${DD_DECKS.low.brent} / €${DD_DECKS.low.gasEur})`], ['base', null, `${t('ddDeckBase')} ($${nf(state.a.brent)} / €${nf(state.a.gasEur)})`], ['high', DD_DECKS.high, `${t('ddDeckHigh')} ($${DD_DECKS.high.brent} / €${DD_DECKS.high.gasEur})`]];
    if (thenDeck) decks.push(['then', thenDeck, `${t('ddDeckThen', year)} ($${nf(thenDeck.brent)} / €${nf(thenDeck.gasEur)})`]);
    const scen = decks.map(([k, deck, label]) => ({ k, label, legs: k === 'base' ? base : legCalc(deck) }));
    if (upOv) scen.push({ k: 'up', label: t('ddDeckUp'), legs: legCalc(null, upOv) });
    const [A, B] = parties;
    const netA = netFor(base, A);
    const winner = Math.abs(netA) < 0.02 * Math.max(1, ...base.map((x) => Math.abs(ddPv(x.rows, year, r) + x.cash))) ? null : netA > 0 ? A : B;
    const legValue = (x) => ddPv(x.rows, year, r);
    const kpis = `<div class="kpis dd-kpis">
      ${base.map((x) => `<div class="kpi"><div class="l">${esc(t('ddSwapGives', x.l.from))}</div><div class="v">${money(legValue(x) + x.cash)}</div><div class="s">${esc(x.l.items.map((i) => `${i.field} ${nf(i.share, i.share % 1 ? 2 : 0)} %`).join(', '))}${x.cash ? ` + ${t('ddCash').toLowerCase()} ${money(x.cash)}` : ''}</div></div>`).join('')}
      ${parties.map((p) => { const n = netFor(base, p); return `<div class="kpi ${p === winner ? 'hl' : ''}"><div class="l">${esc(t('ddNet', p))}</div><div class="v ${gainCls(n)}">${signed(n)}</div><div class="s">${t('ddSwapKpiSub')}</div></div>`; }).join('')}
    </div>`;
    const sideCard = (p) => {
      const gets = base.filter((x) => x.l.to === p), gives = base.filter((x) => x.l.from === p);
      const line = (x) => `${x.l.items.map((i) => `<a href="#/felt/${i.slug}">${esc(i.field)}</a> ${nf(i.share, i.share % 1 ? 2 : 0)} %`).join(', ')}`;
      const rowsH = (arr, sign) => arr.map((x) => `<div><dt>${line(x)}</dt><dd>${sign}${money(legValue(x))}</dd></div>${x.cash ? `<div><dt>${t('ddCash')}</dt><dd>${sign}${money(x.cash)}</dd></div>` : ''}${x.l.note ? `<div class="dd-note"><dt>${t('ddLegNote')}</dt><dd class="muted">${esc(typeof x.l.note === 'object' ? x.l.note[state.lang] : x.l.note)}</dd></div>` : ''}`).join('');
      const n = netFor(base, p);
      return `<div class="card dd-side"><div class="card-head"><h2>${esc(p)}</h2></div>
        <dl class="dd-list">${rowsH(gets, '+')}${rowsH(gives, '−')}<div class="dd-tot"><dt>${esc(t('ddNet', p))}</dt><dd class="${gainCls(n)}">${signed(n)}</dd></div></dl></div>`;
    };
    const scenTable = `<div class="tbl-wrap"><table class="tbl dd-tbl">
      <thead><tr><th>${t('ddDeck')}</th>${m.legs.map((l) => `<th class="r num">${esc(t('ddSwapGives', l.from))}</th>`).join('')}${parties.map((p) => `<th class="r num">${esc(t('ddNet', p))}</th>`).join('')}</tr></thead>
      <tbody>${scen.map((s) => `<tr class="${s.k === 'base' ? 'hl' : ''}"><td>${esc(s.label)}</td>${s.legs.map((x) => `<td class="r num">${money(ddPv(x.rows, year, r) + x.cash)}</td>`).join('')}${parties.map((p) => { const n = netFor(s.legs, p); return `<td class="r num ${gainCls(n)}">${signed(n)}</td>`; }).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
    const sensTable = `<div class="tbl-wrap"><table class="tbl dd-tbl dd-sens">
      <thead><tr><th>${t('ddDeck')}</th>${DD_RATES.map((x) => `<th class="r num">${pct(x * 100, 0)}</th>`).join('')}</tr></thead>
      <tbody>${scen.map((s) => `<tr><td>${esc(s.label)}</td>${DD_RATES.map((x) => { const n = netFor(s.legs, A, x); return `<td class="r num ${gainCls(n)}">${signed(n)}</td>`; }).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
    const text = winner ? t('ddSwapText', winner, money(Math.abs(netFor(base, winner))), winner) : t('ddSwapEven');
    // "In short" for a swap: who gave what, and who came out ahead
    const gaveTxt = (p) => listJoin(base.filter((x) => x.l.from === p).flatMap((x) => [...x.l.items.map(stakeTxt), ...(x.l.cash ? [t('ddP_cash', usdStated(x.l.cash))] : [])]));
    const plain = { list: [t('ddP_swap', A, gaveTxt(A), B, gaveTxt(B)), winner ? t('ddP_swapWin', winner, money(Math.abs(netFor(base, winner)))) : t('ddP_swapEven')], gauge: '' };
    el.innerHTML = ddHeader(d) + ddConclusion(d, plain) + `
      ${kpis}
      <p class="muted dd-small">${t('ddLive')}</p>
      ${intro('ddL_swapSides')}
      <div class="grid g-2">${parties.map(sideCard).join('')}</div>
      <div class="card section-gap"><p class="dd-lead" style="margin-top:0">${esc(text)}</p><p class="muted dd-small" style="margin-bottom:0">${t('ddSwapTax')}</p>
        ${d.upside ? d.upside.map((u) => `<p class="muted dd-small">${t('ddDeckUp')}: ${esc(u.label[state.lang])}</p>`).join('') : ''}</div>
      <div class="card section-gap">
        <div class="card-head"><h2>${t('ddH_dcf')}</h2><span class="muted">${t('ddSwapDcfSub', year, pct(r * 100, 0))}</span></div>
        ${intro('ddL_dcfSwap')}
        <div class="chart-box" style="height:340px"><canvas id="c-dd"></canvas></div>
      </div>
      <div class="grid section-gap">
        <div class="card"><div class="card-head"><h2>${t('ddH_scen')}</h2><span class="muted">${t('ddScenSub')} (${pct(r * 100, 0)})</span></div>${scenTable}</div>
        <div class="card"><div class="card-head"><h2>${t('ddH_sens')}</h2><span class="muted">${esc(t('ddSensSubSwap', A))}</span></div>${intro('ddL_sensSwap')}${sensTable}</div>
      </div>
      <div class="card section-gap">
        <div class="card-head"><h2>${t('ddH_stakes')}</h2><span class="muted">${t('ddStakesSub', year)}</span></div>
        ${base.map((x) => ddStakeTable(x.l.items, x.per, year, r, t('ddSwapGives', x.l.from))).join('')}
      </div>
      ${ddGlossaryCard()}`;
    if (window.Chart) drawDealDcf($('#c-dd'), year, r, base.map((x) => ({ label: t('ddSwapGives', x.l.from), rows: x.rows })), null, null);
  }

  function viewMethod(el) {
    el.innerHTML = `<article class="prose"><div class="eyebrow">Feltverdi.no</div><h1>${t('methodTitle')}</h1>${window.FV_METHOD[state.lang]}</article>`;
  }
  function viewNotFound(el) { el.innerHTML = `<div class="empty">${t('notFound')} <a href="#/">${t('navHome')}</a></div>`; }

  // ---------- info tooltips (ⓘ icons) ----------
  // One floating tooltip for the whole app, positioned next to the hovered/focused icon (escapes table overflow).
  const tipEl = document.createElement('div');
  tipEl.className = 'fv-tooltip'; tipEl.setAttribute('role', 'tooltip'); tipEl.id = 'fv-tooltip'; tipEl.hidden = true;
  document.body.appendChild(tipEl);
  let tipFor = null;
  function showTip(btn) {
    tipFor = btn;
    tipEl.textContent = btn.dataset.tip;
    tipEl.hidden = false;
    btn.setAttribute('aria-describedby', 'fv-tooltip');
    const r = btn.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight, m = 10;
    let left = Math.min(Math.max(m, r.left + r.width / 2 - w / 2), window.innerWidth - w - m);
    let top = r.bottom + 8;
    if (top + h > window.innerHeight - m) top = r.top - h - 8;
    tipEl.style.left = left + 'px'; tipEl.style.top = top + 'px';
  }
  function hideTip() { if (tipFor) tipFor.removeAttribute('aria-describedby'); tipFor = null; tipEl.hidden = true; }
  document.addEventListener('mouseover', (e) => { const b = e.target.closest && e.target.closest('.info'); if (b) showTip(b); });
  document.addEventListener('mouseout', (e) => { const b = e.target.closest && e.target.closest('.info'); if (b && !b.contains(e.relatedTarget) && document.activeElement !== b) hideTip(); });
  document.addEventListener('focusin', (e) => { if (e.target.classList && e.target.classList.contains('info')) showTip(e.target); });
  document.addEventListener('focusout', (e) => { if (e.target.classList && e.target.classList.contains('info')) hideTip(); });
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('.info');
    if (b) { e.preventDefault(); e.stopPropagation(); if (tipFor === b && !tipEl.hidden) hideTip(); else showTip(b); } // touch: tap toggles
    else if (!tipEl.hidden) hideTip();
  }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTip(); });
  window.addEventListener('scroll', hideTip, { passive: true });

  // ---------- large numbers that fit their tiles ----------
  // Key figures stay on one line. Where a tile is too narrow (six tiles in a row, long values such as "NOK 261 mrd"),
  // the numbers in that row are made smaller – all to the same size, so the row stays even.
  const FIT_SEL = '.kpi .v, .life-grid .v';
  const FIT_MIN = 15;
  function fitNumbers(root = document) {
    const groups = new Map();
    for (const el of root.querySelectorAll(FIT_SEL)) {
      if (!el.offsetParent) continue;
      el.style.fontSize = '';
      const row = el.closest('.kpis, .life-grid') || el;
      if (!groups.has(row)) groups.set(row, []);
      groups.get(row).push(el);
    }
    for (const els of groups.values()) {
      let size = Math.min(...els.map((el) => parseFloat(getComputedStyle(el).fontSize)));
      const fits = () => els.every((el) => el.scrollWidth <= el.clientWidth + 0.5);
      for (const el of els) el.style.fontSize = size + 'px';
      while (!fits() && size > FIT_MIN) { size -= 1; for (const el of els) el.style.fontSize = size + 'px'; }
    }
  }
  let fitTimer;
  window.addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(() => fitNumbers(), 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitNumbers());

  // ---------- router ----------
  function route(opts = {}) {
    if (!state.data) return;
    const view = $('#view');
    const y = window.scrollY;
    const focusSel = opts.refocus;
    cleanup();
    refreshColors();
    const [, page, arg] = (location.hash || '#/').replace(/^#/, '').split('/');
    let nav = 'home';
    if (page === 'felt') { nav = 'value'; viewField(view, arg ? decodeURIComponent(arg) : state.lastField); }
    else if (page === 'selskap') { nav = 'value'; viewCompany(view, arg ? decodeURIComponent(arg) : state.lastCompany); }
    else if (page === 'rangering') { nav = 'rank'; viewRank(view); }
    else if (page === 'metode') { nav = 'method'; viewMethod(view); }
    else if (page === 'historisk') { nav = 'hist'; viewHistory(view); }
    else if (page === 'wiki') { nav = 'wiki'; viewWiki(view, arg ? decodeURIComponent(arg) : null); }
    else if (page === 'deals') { nav = 'deals'; viewDeals(view, arg ? decodeURIComponent(arg) : null); }
    else if (page === 'deal') { nav = 'deals'; viewDealDetail(view, decodeURIComponent(arg || '')); }
    else if (!page) viewHome(view);
    else viewNotFound(view);
    $$('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === nav));
    if (opts.keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
    if (focusSel) { const i = $(focusSel); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
    fitNumbers();
  }
  window.addEventListener('hashchange', () => route());
  // Hide the deals ticker when scrolled down (with a small hysteresis so it doesn't flicker)
  const topBar = $('.top');
  let tickerHidden = false;
  const onScroll = () => {
    const y = window.scrollY;
    if (!tickerHidden && y > 40) { tickerHidden = true; topBar.classList.add('scrolled'); }
    else if (tickerHidden && y < 8) { tickerHidden = false; topBar.classList.remove('scrolled'); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => route({ keepScroll: true })); } catch { /* old browsers */ }

  // ---------- boot ----------
  applyChrome();
  $('#view').innerHTML = `<div class="loading">${t('loading')}</div>`;
  load().then(() => route()).catch((e) => { console.error(e); $('#view').innerHTML = `<div class="empty">${t('loadError')}</div>`; });
})();
