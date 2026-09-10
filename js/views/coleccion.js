/**
 * Colección: la grilla completa del archivo con filtros instantáneos.
 *
 * Los filtros viven en la URL, así que cualquier recorte se puede compartir
 * o guardar en favoritos del navegador.
 */

import { esc, qs, qsa, on, debounce, observeReveals, fragment } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { num, decadeLabel } from '../lib/format.js';
import { PAGE_SIZE } from '../config.js';
import { runQuery, emptyQuery, facetCounts, clubRanking } from '../data/store.js';
import { matchCardHTML, emptyStateHTML } from '../components/matchCard.js';
import { crestHTML } from '../components/crest.js';
import { clubShort } from '../data/clubs.js';

/* ---------------- URL <-> filtros ---------------- */

const LIST_KEYS = { decadas: 'decades', clubes: 'clubs', torneos: 'families', condicion: 'venues', resultado: 'results' };

export function queryFromParams(params) {
  const query = emptyQuery();
  query.q = params.get('q') || '';
  for (const [urlKey, stateKey] of Object.entries(LIST_KEYS)) {
    const raw = params.get(urlKey);
    if (!raw) continue;
    query[stateKey] = raw.split(',').filter(Boolean).map((v) => (stateKey === 'decades' ? Number(v) : v));
  }
  query.onlyKit = params.get('camiseta') === '1';
  query.onlyMissing = params.get('sincamiseta') === '1';
  query.onlyFav = params.get('favoritos') === '1';
  query.sort = params.get('orden') || 'newest';
  return query;
}

function paramsFromQuery(query) {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  for (const [urlKey, stateKey] of Object.entries(LIST_KEYS)) {
    if (query[stateKey] && query[stateKey].length) params.set(urlKey, query[stateKey].join(','));
  }
  if (query.onlyKit) params.set('camiseta', '1');
  if (query.onlyMissing) params.set('sincamiseta', '1');
  if (query.onlyFav) params.set('favoritos', '1');
  if (query.sort && query.sort !== 'newest') params.set('orden', query.sort);
  return params;
}

const activeCount = (query) =>
  query.decades.length + query.clubs.length + query.families.length +
  query.venues.length + query.results.length +
  (query.onlyKit ? 1 : 0) + (query.onlyMissing ? 1 : 0) + (query.onlyFav ? 1 : 0);

/* ---------------- markup ---------------- */

const SORTS = [
  ['newest', 'Más recientes'],
  ['oldest', 'Más antiguos'],
  ['highlight', 'Destacados'],
  ['rival', 'Por rival'],
  ['goles', 'Más goles'],
];

const VENUES = [['H', 'Local'], ['A', 'Visitante'], ['N', 'Neutral']];
const RESULTS = [['W', 'Ganados'], ['D', 'Empatados'], ['L', 'Perdidos']];

function toggleChips(name, options, selected) {
  return options
    .map(([value, label, count]) => {
      const isOn = selected.some((s) => String(s) === String(value));
      return `<button type="button" class="chip${isOn ? ' is-on' : ''}" data-filter="${name}" data-value="${esc(value)}"
          aria-pressed="${isOn}">${esc(label)}${count != null ? ` <span class="chip__count">${num(count)}</span>` : ''}</button>`;
    })
    .join('');
}

function filterPanelHTML(query) {
  const { decades, families } = facetCounts();
  const ranking = clubRanking();
  const topRivals = ranking.slice(0, 10);

  return `<div class="filterbar__panel" id="filter-panel" ${activeCount(query) ? '' : 'hidden'}>
      <div class="filter-group">
        <span class="filter-group__label">Década</span>
        <div class="chip-row">${toggleChips('decades', decades.map(([d, c]) => [d, decadeLabel(d), c]), query.decades)}</div>
      </div>

      <div class="filter-group">
        <span class="filter-group__label">Competencia</span>
        <div class="chip-row">${toggleChips('families', families.map((f) => [f.id, f.label, f.count]), query.families)}</div>
      </div>

      <div class="filter-group">
        <span class="filter-group__label">Rival</span>
        <div class="chip-scroll">
          ${topRivals
            .map((entry) => {
              const isOn = query.clubs.includes(entry.club.id);
              return `<button type="button" class="chip${isOn ? ' is-on' : ''}" data-filter="clubs" data-value="${esc(entry.club.id)}" aria-pressed="${isOn}">
                  ${crestHTML(entry.club, 'xs')}${esc(clubShort(entry.club))}
                  <span class="chip__count">${num(entry.matches.length)}</span>
                </button>`;
            })
            .join('')}
        </div>
        <select class="select" id="club-select" aria-label="Elegir cualquier rival">
          <option value="">Todos los rivales (${num(ranking.length)})</option>
          ${ranking
            .map(
              (entry) =>
                `<option value="${esc(entry.club.id)}"${query.clubs.includes(entry.club.id) ? ' selected' : ''}>
                  ${esc(entry.club.name)} · ${num(entry.matches.length)}</option>`
            )
            .join('')}
        </select>
      </div>

      <div class="filter-group">
        <span class="filter-group__label">Condición y resultado</span>
        <div class="chip-row">
          ${toggleChips('venues', VENUES, query.venues)}
          <span style="width:10px"></span>
          ${toggleChips('results', RESULTS, query.results)}
        </div>
      </div>

      <div class="filter-group">
        <span class="filter-group__label">Material</span>
        <div class="chip-row">
          <button type="button" class="chip${query.onlyKit ? ' is-on' : ''}" data-flag="onlyKit" aria-pressed="${query.onlyKit}">Con camiseta identificada</button>
          <button type="button" class="chip${query.onlyMissing ? ' is-on' : ''}" data-flag="onlyMissing" aria-pressed="${query.onlyMissing}">Falta identificar</button>
          <button type="button" class="chip${query.onlyFav ? ' is-on' : ''}" data-flag="onlyFav" aria-pressed="${query.onlyFav}">Mis favoritos</button>
          <button type="button" class="chip" id="clear-filters">Limpiar todo</button>
        </div>
      </div>
    </div>`;
}

export function renderColeccion(ctx) {
  const query = queryFromParams(ctx.params);

  return `<div class="collection-head">
      <div class="shell">
        <span class="eyebrow">La colección completa</span>
        <h1>Todas las piezas</h1>
      </div>
    </div>

    <div class="filterbar">
      <div class="shell">
        <div class="filterbar__row">
          <label class="filterbar__search">
            ${icon('search')}
            <input type="search" id="collection-search" placeholder="Buscar rival, torneo, año…"
              value="${esc(query.q)}" autocomplete="off" aria-label="Buscar en la colección">
          </label>
          <button type="button" class="icon-btn filterbar__toggle" id="toggle-filters" aria-expanded="${activeCount(query) > 0}" aria-controls="filter-panel" title="Filtros">
            ${icon('sliders')}${activeCount(query) ? '<span class="dot"></span>' : ''}
          </button>
          <select class="select" id="sort-select" aria-label="Ordenar">
            ${SORTS.map(([value, label]) => `<option value="${value}"${query.sort === value ? ' selected' : ''}>${label}</option>`).join('')}
          </select>
        </div>
        ${filterPanelHTML(query)}
      </div>
    </div>

    <div class="shell" style="padding-bottom:clamp(40px,7vw,90px)">
      <div class="results-bar">
        <span class="results-bar__count" id="results-count" aria-live="polite"></span>
        <span class="active-filters" id="active-filters"></span>
      </div>
      <div class="piece-grid" id="results-grid"></div>
      <div class="load-more" id="load-more" hidden></div>
      <div id="load-sentinel" class="load-sentinel"></div>
    </div>`;
}

/* ---------------- comportamiento ---------------- */

export function mountColeccion(ctx) {
  let query = queryFromParams(ctx.params);
  let results = [];
  let shown = 0;
  let sentinelObserver = null;

  const grid = qs('#results-grid');
  const countEl = qs('#results-count');
  const activeEl = qs('#active-filters');
  const moreEl = qs('#load-more');
  const sentinel = qs('#load-sentinel');
  const panel = qs('#filter-panel');

  function syncUrl() {
    const params = paramsFromQuery(query);
    const search = params.toString();
    const hash = `#/coleccion${search ? `?${search}` : ''}`;
    if (location.hash !== hash) history.replaceState(null, '', hash);
  }

  function renderChunk() {
    const next = results.slice(shown, shown + PAGE_SIZE);
    if (!next.length) return;
    grid.appendChild(fragment(next.map((m) => matchCardHTML(m, { starred: query.sort === 'highlight' })).join('')));
    shown += next.length;
    observeReveals(grid);
    moreEl.hidden = shown >= results.length;
    if (!moreEl.hidden) {
      moreEl.innerHTML = `<span class="spinner"></span><span class="stat__note">Cargando más piezas…</span>`;
    }
  }

  function summaryHTML() {
    const bits = [];
    if (query.q) bits.push(`“${query.q}”`);
    query.decades.forEach((d) => bits.push(decadeLabel(d)));
    query.families.forEach((f) => {
      const found = facetCounts().families.find((x) => x.id === f);
      if (found) bits.push(found.label);
    });
    query.clubs.forEach((c) => {
      const entry = clubRanking().find((x) => x.club.id === c);
      if (entry) bits.push(entry.club.name);
    });
    query.venues.forEach((v) => bits.push(VENUES.find(([k]) => k === v)?.[1] || v));
    query.results.forEach((r) => bits.push(RESULTS.find(([k]) => k === r)?.[1] || r));
    if (query.onlyKit) bits.push('con camiseta');
    if (query.onlyMissing) bits.push('falta identificar');
    if (query.onlyFav) bits.push('favoritos');
    return bits.map((b) => `<span class="chip chip--red chip--static">${esc(b)}</span>`).join('');
  }

  function apply({ resetScroll = false } = {}) {
    results = runQuery(query);
    shown = 0;
    grid.innerHTML = '';
    countEl.innerHTML = results.length
      ? `<em>${num(results.length)}</em> ${results.length === 1 ? 'pieza encontrada' : 'piezas encontradas'}`
      : 'Sin resultados';
    activeEl.innerHTML = summaryHTML();

    if (!results.length) {
      moreEl.hidden = true;
      grid.style.display = 'none';
      let emptyBox = qs('#results-empty');
      if (!emptyBox) {
        emptyBox = document.createElement('div');
        emptyBox.id = 'results-empty';
        grid.parentElement.insertBefore(emptyBox, grid.nextSibling);
      }
      emptyBox.innerHTML = emptyStateHTML({
        title: 'No hay piezas con ese recorte',
        text: 'Probá aflojar algún filtro o buscar por otro rival, torneo o año.',
        action: '<button type="button" class="btn btn--ghost btn--sm" id="empty-clear">Limpiar filtros</button>',
      });
    } else {
      grid.style.display = '';
      const emptyBox = qs('#results-empty');
      if (emptyBox) emptyBox.remove();
      renderChunk();
    }

    syncUrl();
    updateToggleDot();
  }

  function updateToggleDot() {
    const toggle = qs('#toggle-filters');
    if (!toggle) return;
    const dot = toggle.querySelector('.dot');
    const count = activeCount(query);
    if (count && !dot) toggle.insertAdjacentHTML('beforeend', '<span class="dot"></span>');
    if (!count && dot) dot.remove();
  }

  function toggleValue(key, value) {
    const parsed = key === 'decades' ? Number(value) : value;
    const list = query[key];
    const index = list.findIndex((v) => String(v) === String(parsed));
    if (index >= 0) list.splice(index, 1);
    else list.push(parsed);
  }

  /* --- eventos --- */

  const searchInput = qs('#collection-search');
  searchInput.addEventListener(
    'input',
    debounce((event) => {
      query.q = event.target.value;
      apply();
    }, 180)
  );

  qs('#sort-select').addEventListener('change', (event) => {
    query.sort = event.target.value;
    apply();
  });

  qs('#toggle-filters').addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    qs('#toggle-filters').setAttribute('aria-expanded', String(!panel.hidden));
  });

  on(panel, 'click', '[data-filter]', (event, button) => {
    toggleValue(button.dataset.filter, button.dataset.value);
    const isOn = query[button.dataset.filter].some((v) => String(v) === String(button.dataset.value));
    button.classList.toggle('is-on', isOn);
    button.setAttribute('aria-pressed', String(isOn));
    apply();
  });

  on(panel, 'click', '[data-flag]', (event, button) => {
    const flag = button.dataset.flag;
    query[flag] = !query[flag];
    button.classList.toggle('is-on', query[flag]);
    button.setAttribute('aria-pressed', String(query[flag]));
    apply();
  });

  qs('#club-select').addEventListener('change', (event) => {
    query.clubs = event.target.value ? [event.target.value] : [];
    qsa('[data-filter="clubs"]', panel).forEach((chip) => {
      const isOn = query.clubs.includes(chip.dataset.value);
      chip.classList.toggle('is-on', isOn);
      chip.setAttribute('aria-pressed', String(isOn));
    });
    apply();
  });

  function clearAll() {
    const sort = query.sort;
    query = emptyQuery();
    query.sort = sort;
    searchInput.value = '';
    qsa('.chip[data-filter], .chip[data-flag]', panel).forEach((chip) => {
      chip.classList.remove('is-on');
      chip.setAttribute('aria-pressed', 'false');
    });
    qs('#club-select').value = '';
    apply();
  }

  qs('#clear-filters').addEventListener('click', clearAll);
  document.addEventListener('click', (event) => {
    if (event.target.id === 'empty-clear') clearAll();
  });

  if ('IntersectionObserver' in window) {
    sentinelObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) renderChunk();
      },
      { rootMargin: '900px 0px' }
    );
    sentinelObserver.observe(sentinel);
  } else {
    moreEl.addEventListener('click', renderChunk);
  }

  apply();

  return () => sentinelObserver && sentinelObserver.disconnect();
}
