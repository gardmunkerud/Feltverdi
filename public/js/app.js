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
  const COLORS = { oil: '#f5a524', gas: '#38bdf8', ngl: '#a78bfa', mixed: '#2dd4bf', shut: '#4b5563', accent: '#22d3ee', indigo: '#818cf8', grid: 'rgba(255,255,255,0.06)', text: '#b6c2d6' };

  // ---------- state & persistence ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('fv:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('fv:' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  const DEFAULT_A = { brent: V.DEFAULTS.brent, gasEur: V.DEFAULTS.gasEur, usdnok: V.DEFAULTS.usdnok, discount: V.DEFAULTS.discount };
  const state = {
    data: null, vals: null, companies: [],
    lang: store.get('lang', (navigator.language || 'nb').startsWith('en') ? 'en' : 'nb'),
    cur: store.get('cur', 'NOK'),
    a: { ...DEFAULT_A, ...store.get('a', {}) },
    overrides: store.get('ov', {}),
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
  const pct = (v, d = 1) => `${nf(v, d)} %`;

  // ---------- data ----------
  async function load() {
    const res = await fetch('/data/fields.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    state.data = await res.json();
    try { const c = await fetch('/data/coast.json'); if (c.ok) state.coast = await c.json(); } catch { /* map without coastline */ }
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
  }
  const ASSUMPTIONS = [
    { k: 'brent', label: 'brent', min: 40, max: 130, step: 1, fmt: (v) => `$${nf(v)}`, hint: 'brentHint' },
    { k: 'gasEur', label: 'gas', min: 10, max: 100, step: 1, fmt: (v) => `€${nf(v)}/MWh`, hint: 'gasHint',
      note: (v) => { const eurusd = V.DEFAULTS.eurusd; return t('gasConv', nf(eurusd, 2), nf(1.72 * eurusd, 2), nf(v), nf(v * 1.72 * eurusd, 1), nf(v * eurusd / 3.412, 1)); } },
    { k: 'usdnok', label: 'usdnok', min: 7, max: 13, step: 0.1, fmt: (v) => nf(v, 1), hint: 'usdnokHint' },
    { k: 'discount', label: 'discount', min: 0.04, max: 0.14, step: 0.005, fmt: (v) => pct(v * 100, 1), hint: 'discountHint' },
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
    Chart.defaults.plugins.tooltip.backgroundColor = '#0e1626';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.16)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
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
      L.geoJSON(state.coast, { interactive: false, style: { stroke: false, fillColor: '#18233a', fillOpacity: 1 } }).addTo(map);
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
      const m = L.circleMarker([f.lat, f.lon], { radius: r, color: c, weight: 1.2, opacity: 0.95, fillColor: c, fillOpacity: f.status === 'Shut down' ? 0.25 : 0.38 }).addTo(map);
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
      <div class="seg" role="group" aria-label="Modus">
        <button type="button" data-mode="field" class="${mode === 'field' ? 'on' : ''}">${t('modeField')}</button>
        <button type="button" data-mode="company" class="${mode === 'company' ? 'on' : ''}">${t('modeCompany')}</button>
      </div>
      <div class="picker" id="picker"></div>
    </div>`;
  }
  function wireExplorer(el, mode) {
    $$('[data-mode]', el).forEach((b) => b.addEventListener('click', () => {
      location.hash = b.dataset.mode === 'field' ? `#/felt/${state.lastField}` : `#/selskap/${state.lastCompany}`;
    }));
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
      : v.kind === 'plateau' ? t('plateauNote', nf(kboed(v.plateauRate), 0), v.plateauYears, v.plateauEnd, t('plateauSrc_' + v.plateauSource), nf(v.decline * 100, 1))
      : f.outlook && f.outlook.plateau === 'off' ? t('offPlateauNote') : '';
    const shareOptions = [`<option value="gross"${sh.type === 'gross' ? ' selected' : ''}>${t('gross100')}</option>`]
      .concat(f.owners.map(([c, s]) => `<option value="owner:${esc(c)}"${sh.type === 'owner' && sh.company === c ? ' selected' : ''}>${esc(c)} – ${pct(s, 2)}</option>`))
      .concat([`<option value="custom"${sh.type === 'custom' ? ' selected' : ''}>${sh.type === 'custom' ? `${t('custom').replace(' …', '')}: ${pct(sh.pct, 2)}` : t('custom')}</option>`]).join('');
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
            <a class="tag" href="${esc(f.url)}" target="_blank" rel="noopener">${t('sodirLink')}</a>
          </div>
        </div>
        <label class="share-pick">${t('valueFor')} <select id="share">${shareOptions}</select></label>
      </div>
      <div class="kpis k6">
        <div class="kpi hl"><div class="l">${t('fieldValue')}${k < 1 ? ` (${pct(sh.pct, 1)})` : ''}</div><div class="v">${money(v.npv * k)}</div><div class="s">${perBoe(v.npv, v.remBoe)} ${t('perBoe')}</div></div>
        <div class="kpi"><div class="l">${t('remaining')}</div><div class="v">${nf(v.remBoe * k, v.remBoe * k < 10 ? 1 : 0)}</div><div class="s">${t('mmboe')}${f.resYear ? ` · ${f.resYear}` : ''}</div></div>
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
            <div><label for="ov-opex">${t('opexBoe')}</label><input id="ov-opex" type="number" min="0" max="60" step="0.5" value="${ov.opexBoe ?? ''}" placeholder="${nf(v.opexBoe, 1)}"><div class="auto">${t('auto')}: ${nf(V.OPEX_BY_TYPE[f.hc] ?? 10, 1)}</div></div>
            <div><label for="ov-capex">${t('capexBoe')}</label><input id="ov-capex" type="number" min="0" max="60" step="0.5" value="${ov.capexBoe ?? ''}" placeholder="${nf(v.capexBoe, 1)}"><div class="auto">${t('auto')}: ${nf(v.capexBoe, 1)}</div></div>
            <div><label for="ov-dec">${t('declineRate')}</label><input id="ov-dec" type="number" min="0" max="60" step="0.5" value="${ov.decline != null ? nf(ov.decline * 100, 1).replace(',', '.') : ''}" placeholder="${nf(v.decline * 100, 1)}"><div class="auto">${t('autoFit', nf(v.decline * 100, 1))}</div></div>
            <div><label for="ov-plat">${t('plateauYearsLbl')}</label><input id="ov-plat" type="number" min="0" max="30" step="1" value="${ov.plateauYears ?? ''}" placeholder="${v.plateauYears || 0}"><div class="auto">${t('auto')}: ${v.kind === 'plateau' && v.plateauSource !== 'user' ? t('plateauAuto', v.plateauYears) : '0'}</div></div>
            <div><label for="ov-decom">${t('decomBoe')}</label><input id="ov-decom" type="number" min="0" max="10" step="0.1" value="${ov.decomPerBoe ?? ''}" placeholder="${nf(V.DEFAULTS.decomPerBoe, 1)}"><div class="auto">${t('auto')}: ${nf(V.DEFAULTS.decomPerBoe, 1)}</div></div>
          </div>
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
          { type: 'line', label: t('forecast'), data: fcLine, borderColor: COLORS.accent, backgroundColor: 'rgba(34,211,238,0.12)', borderDash: [6, 4], borderWidth: 2, pointRadius: 0, fill: true, tension: 0.25, spanGaps: false },
        ],
      },
      options: {
        maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        scales: { x: { stacked: true, grid: { display: false }, ticks: { maxTicksLimit: 10 } }, y: { stacked: true, beginAtZero: true, ticks: { callback: (x) => nf(x) } } },
        plugins: { tooltip: { callbacks: { label: (c) => c.raw == null ? null : `${c.dataset.label}: ${nf(c.raw, 1)}` } } },
      },
    }));
    const cf = v.years;
    let cum = 0;
    const cumPv = cf.map((r) => { cum += r.pv * k; return toCur(cum); });
    charts.push(new Chart($('#c-cf'), {
      data: {
        labels: cf.map((r) => r.year),
        datasets: [
          { type: 'bar', label: t('fcf'), data: cf.map((r) => toCur(r.fcf * k)), backgroundColor: cf.map((r) => (r.fcf < 0 ? 'rgba(248,113,113,0.7)' : 'rgba(129,140,248,0.75)')), borderRadius: 3, yAxisID: 'y' },
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

  function viewMethod(el) {
    el.innerHTML = `<article class="prose"><div class="eyebrow">Feltverdi.no</div><h1>${t('methodTitle')}</h1>${window.FV_METHOD[state.lang]}</article>`;
  }
  function viewNotFound(el) { el.innerHTML = `<div class="empty">${t('notFound')} <a href="#/">${t('navHome')}</a></div>`; }

  // ---------- router ----------
  function route(opts = {}) {
    if (!state.data) return;
    const view = $('#view');
    const y = window.scrollY;
    const focusSel = opts.refocus;
    cleanup();
    const [, page, arg] = (location.hash || '#/').replace(/^#/, '').split('/');
    let nav = 'home';
    if (page === 'felt') { nav = 'value'; viewField(view, arg ? decodeURIComponent(arg) : state.lastField); }
    else if (page === 'selskap') { nav = 'value'; viewCompany(view, arg ? decodeURIComponent(arg) : state.lastCompany); }
    else if (page === 'rangering') { nav = 'rank'; viewRank(view); }
    else if (page === 'metode') { nav = 'method'; viewMethod(view); }
    else if (!page) viewHome(view);
    else viewNotFound(view);
    $$('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === nav));
    if (opts.keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
    if (focusSel) { const i = $(focusSel); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
  }
  window.addEventListener('hashchange', () => route());

  // ---------- boot ----------
  applyChrome();
  $('#view').innerHTML = `<div class="loading">${t('loading')}</div>`;
  load().then(() => route()).catch((e) => { console.error(e); $('#view').innerHTML = `<div class="empty">${t('loadError')}</div>`; });
})();
