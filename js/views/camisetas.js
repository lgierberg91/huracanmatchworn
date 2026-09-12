/**
 * Camisetas: el núcleo del archivo.
 *
 * Una línea de tiempo por temporada, de la más nueva a la más vieja. Dentro de
 * cada año van primero las camisetas de jugador — titular, suplente, alternativa
 * y, si existe, la edición especial — y después, bajo su propio separador, las
 * de arquero en orden numérico. Un año sin alternativa no deja hueco: la fila se
 * arma con lo que hay.
 *
 * Al costado hay un panel para recortar el archivo por año, década, marca,
 * competencia y tipo de camiseta.
 *
 * La camiseta de CADA partido se carga a mano desde la ficha del partido y se
 * guarda en `match_kits`. Lo que se ve acá es el nivel de temporada: qué prendas
 * existieron ese año.
 */

import { esc, qs, qsa, observeReveals, fragment } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { num, plural, decadeLabel } from '../lib/format.js';
import { allYears, matchesOfYear, globalStats } from '../data/store.js';
import {
  kitsForYear,
  kitCount,
  roleCounts,
  ROLE_LABEL,
  SEASON_KITS,
  TYPE_OPTIONS,
} from '../data/seasonKits.js';
import { brandForYear, BRAND_ERAS } from '../data/brands.js';
import { familyById } from '../data/competitions.js';
import { statHTML } from '../components/ui.js';
import { jerseyHTML } from '../components/jersey.js';

const YEARS_PER_CHUNK = 10;

export const seasonKitHref = (kit) => `#/camiseta/${encodeURIComponent(kit.id)}`;

/* ---------------- datos derivados para los filtros ---------------- */

/** Marcas que vistieron al club, de la era más nueva a la más vieja, sin repetir. */
function brandOptions() {
  const seen = new Set();
  const out = [];
  for (const era of BRAND_ERAS) {
    if (seen.has(era.name)) continue;
    seen.add(era.name);
    out.push(era.name);
  }
  return out;
}

/** Qué competencias jugó el club en cada año. Se calcula una sola vez. */
let familiesByYear = null;
function yearFamilies(year) {
  if (!familiesByYear) {
    familiesByYear = new Map();
    for (const y of allYears()) {
      const ids = new Set(matchesOfYear(y).map((m) => m.family && m.family.id).filter(Boolean));
      familiesByYear.set(y, ids);
    }
  }
  return familiesByYear.get(Number(year)) || new Set();
}

/** Las competencias que aparecen en el archivo, en el orden canónico. */
function competitionOptions() {
  const present = new Set();
  for (const y of allYears()) for (const id of yearFamilies(y)) present.add(id);
  return [...present].map((id) => familyById(id)).filter(Boolean);
}

/* ---------------- piezas ---------------- */

/**
 * El rol sólo se aclara si dice algo que el nombre no dice ya: en una camiseta
 * de arquero el nombre ES "Arquero" y repetirlo abajo sobra.
 */
function kitSubHTML(kit) {
  const role = ROLE_LABEL[kit.role] || ROLE_LABEL.null;
  if (role === kit.label) return '';
  return `<span class="skit__role mono">${esc(role)}</span>`;
}

function kitCardHTML(kit) {
  return `<a class="skit reveal" href="${seasonKitHref(kit)}">
      <div class="skit__stage">
        <img src="${esc(kit.src)}" alt="Camiseta de Huracán ${esc(kit.year)} ${esc(kit.label)}" loading="lazy" decoding="async">
      </div>
      <div class="skit__body">
        <strong class="skit__label">${esc(kit.label)}</strong>
        ${kitSubHTML(kit)}
      </div>
    </a>`;
}

function emptyYearHTML(year, matchCount) {
  return `<a class="skit skit--empty reveal" href="#/temporada/${year}">
      <div class="skit__ghost">${jerseyHTML({ size: 92, showBalloon: true, label: '' })}</div>
      <div class="skit__body">
        <strong class="skit__label">Sin camiseta cargada</strong>
        <span class="skit__role mono">${matchCount ? plural(matchCount, 'partido', 'partidos') : 'sin partidos'}</span>
      </div>
    </a>`;
}

function yearBlockHTML(year, kits) {
  const matches = matchesOfYear(year);
  const brand = brandForYear(year);
  const outfield = kits.filter((k) => k.role !== 'arquero');
  const keepers = kits.filter((k) => k.role === 'arquero');

  const rows = [];
  if (outfield.length) rows.push(`<div class="tl-year__kits">${outfield.map(kitCardHTML).join('')}</div>`);
  if (keepers.length) {
    rows.push(`<p class="tl-split mono"><span>Arquero</span></p>
      <div class="tl-year__kits">${keepers.map(kitCardHTML).join('')}</div>`);
  }
  if (!rows.length) rows.push(`<div class="tl-year__kits">${emptyYearHTML(year, matches.length)}</div>`);

  return `<section class="tl-year" id="anio-${year}">
      <div class="tl-year__spine">
        <a class="tl-year__num" href="#/temporada/${year}">${year}</a>
        <span class="tl-year__dot"></span>
      </div>
      <div class="tl-year__content">
        <div class="tl-year__meta mono">
          ${kits.length ? `<span class="chip chip--red chip--static">${plural(kits.length, 'camiseta', 'camisetas')}</span>` : ''}
          ${brand ? `<span class="chip chip--static">${esc(brand)}</span>` : ''}
        </div>
        ${rows.join('')}
        <a class="tl-year__cta" href="#/temporada/${year}">
          <span class="tl-year__cta-icon">${icon('shirt')}</span>
          <span class="tl-year__cta-text">
            <strong>Ver qué camiseta se usó en cada partido</strong>
            <span>Los ${plural(matches.length, 'partido', 'partidos')} de ${year}, uno por uno</span>
          </span>
          <span class="tl-year__cta-arrow">${icon('arrowRight')}</span>
        </a>
      </div>
    </section>`;
}

function filtersHTML(years, decades, query) {
  const brands = brandOptions();
  const competitions = competitionOptions();

  return `<aside class="tl-filters" id="tl-filters" aria-label="Filtros del archivo">
      <div class="tl-filters__head">
        <p class="tl-filters__title mono">Filtrar</p>
        <button type="button" class="tl-filters__clear mono" id="f-clear">Limpiar</button>
      </div>

      <div class="filter-group">
        <label class="filter-group__label" for="f-year">Año</label>
        <select class="select" id="f-year">
          <option value="">Todos</option>
          ${years.map((y) => `<option value="${y}"${query.anio === String(y) ? ' selected' : ''}>${y}</option>`).join('')}
        </select>
      </div>

      <div class="filter-group">
        <span class="filter-group__label">Década</span>
        <div class="chip-wrap" id="f-decades">
          <button type="button" class="chip${query.decada ? '' : ' is-on'}" data-decade="">Todas</button>
          ${decades.map((d) => `<button type="button" class="chip${query.decada === String(d) ? ' is-on' : ''}" data-decade="${d}">${esc(decadeLabel(d))}</button>`).join('')}
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-group__label" for="f-brand">Marca</label>
        <select class="select" id="f-brand">
          <option value="">Todas</option>
          ${brands.map((b) => `<option value="${esc(b)}"${query.marca === b ? ' selected' : ''}>${esc(b)}</option>`).join('')}
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-group__label" for="f-comp">Competencia</label>
        <select class="select" id="f-comp">
          <option value="">Todas</option>
          ${competitions.map((c) => `<option value="${esc(c.id)}"${query.comp === c.id ? ' selected' : ''}>${esc(c.label)}</option>`).join('')}
        </select>
      </div>

      <div class="filter-group">
        <span class="filter-group__label">Tipo de camiseta</span>
        <div class="chip-wrap" id="f-types">
          <button type="button" class="chip${query.tipo ? '' : ' is-on'}" data-type="">Todas</button>
          ${TYPE_OPTIONS.map((t) => `<button type="button" class="chip${query.tipo === t.id ? ' is-on' : ''}" data-type="${esc(t.id)}">${esc(t.label)}</button>`).join('')}
        </div>
      </div>

      <button type="button" class="chip chip--block${query.soloCon ? ' is-on' : ''}" id="only-with" aria-pressed="${query.soloCon}">
        Solo años con camiseta
      </button>
    </aside>`;
}

/* ---------------- vista ---------------- */

function readQuery(params) {
  return {
    anio: params.get('anio') || '',
    decada: params.get('decada') || '',
    marca: params.get('marca') || '',
    comp: params.get('comp') || '',
    tipo: params.get('tipo') || '',
    soloCon: params.get('con') === '1',
  };
}

export function renderCamisetas(ctx) {
  const stats = globalStats();
  const roles = roleCounts();
  const years = allYears().sort((a, b) => b - a);
  const decades = [...new Set(years.map((y) => Math.floor(y / 10) * 10))];
  const withKits = new Set(SEASON_KITS.map((k) => k.year)).size;
  const query = readQuery(ctx.params);

  return `<section class="kits-hero">
      <div class="shell">
        <span class="eyebrow eyebrow--dark">La colección</span>
        <h1>La historia de Huracán,<br>camiseta por camiseta</h1>
        <p class="lede" style="color:var(--on-dark-2);margin-top:16px;max-width:54ch">
          Bajá por los años. Lo que está cargado se ve; lo que falta, se puede completar.
        </p>
        <div class="hero__counts">
          ${statHTML({ value: kitCount(), label: 'Camisetas' })}
          ${statHTML({ value: withKits, label: 'Temporadas con foto', note: `de ${stats.seasons}` })}
          ${statHTML({ value: roles.arquero, label: 'De arquero', note: `${roles.jugador} de jugador` })}
        </div>
      </div>
    </section>

    <div class="shell tl-layout">
      ${filtersHTML(years, decades, query)}
      <div class="tl-main">
        <p class="timeline-count mono" id="tl-count" aria-live="polite"></p>
        <div class="timeline-rail" id="tl-list"></div>
        <div id="tl-sentinel" class="load-sentinel"></div>
      </div>
    </div>`;
}

export function mountCamisetas(ctx) {
  const query = readQuery(ctx.params);

  const list = qs('#tl-list');
  const countEl = qs('#tl-count');
  const sentinel = qs('#tl-sentinel');
  let years = [];
  let shown = 0;
  let observer = null;

  function syncUrl() {
    const params = new URLSearchParams();
    if (query.anio) params.set('anio', query.anio);
    if (query.decada) params.set('decada', query.decada);
    if (query.marca) params.set('marca', query.marca);
    if (query.comp) params.set('comp', query.comp);
    if (query.tipo) params.set('tipo', query.tipo);
    if (query.soloCon) params.set('con', '1');
    const search = params.toString();
    const hash = `#/camisetas${search ? `?${search}` : ''}`;
    if (location.hash !== hash) history.replaceState(null, '', hash);
  }

  function compute() {
    const decade = query.decada ? Number(query.decada) : null;
    const year = query.anio ? Number(query.anio) : null;

    return allYears()
      .sort((a, b) => b - a)
      .map((y) => {
        // El filtro por tipo recorta las camisetas del año, no sólo los años.
        const kits = query.tipo
          ? kitsForYear(y).filter((k) => k.kind === query.tipo)
          : kitsForYear(y);
        return { year: y, kits };
      })
      .filter((entry) => {
        if (year && entry.year !== year) return false;
        if (decade && Math.floor(entry.year / 10) * 10 !== decade) return false;
        if (query.marca && brandForYear(entry.year) !== query.marca) return false;
        if (query.comp && !yearFamilies(entry.year).has(query.comp)) return false;
        // Pedir un tipo es pedir esa camiseta: los años que no la tienen sobran.
        if (query.tipo && !entry.kits.length) return false;
        if (query.soloCon && !entry.kits.length) return false;
        return true;
      });
  }

  function renderChunk() {
    const next = years.slice(shown, shown + YEARS_PER_CHUNK);
    if (!next.length) return;
    list.appendChild(fragment(next.map((e) => yearBlockHTML(e.year, e.kits)).join('')));
    shown += next.length;
    observeReveals(list);
  }

  function apply() {
    years = compute();
    shown = 0;
    list.innerHTML = '';
    const total = years.reduce((n, e) => n + e.kits.length, 0);
    countEl.textContent = `${plural(years.length, 'temporada', 'temporadas')} · ${num(total)} ${total === 1 ? 'camiseta' : 'camisetas'}`;
    if (!years.length) {
      list.innerHTML = '<div class="empty"><h4>No hay temporadas con ese recorte</h4></div>';
    } else {
      renderChunk();
    }
    syncUrl();
  }

  /** Marca un chip como el elegido dentro de su fila. */
  function pickChip(row, button) {
    qsa('.chip', row).forEach((c) => c.classList.toggle('is-on', c === button));
  }

  qs('#f-year').addEventListener('change', (event) => {
    query.anio = event.target.value;
    apply();
  });

  qs('#f-brand').addEventListener('change', (event) => {
    query.marca = event.target.value;
    apply();
  });

  qs('#f-comp').addEventListener('change', (event) => {
    query.comp = event.target.value;
    apply();
  });

  const decadeRow = qs('#f-decades');
  decadeRow.addEventListener('click', (event) => {
    const button = event.target.closest('[data-decade]');
    if (!button) return;
    query.decada = button.dataset.decade;
    pickChip(decadeRow, button);
    apply();
  });

  const typeRow = qs('#f-types');
  typeRow.addEventListener('click', (event) => {
    const button = event.target.closest('[data-type]');
    if (!button) return;
    query.tipo = button.dataset.type;
    pickChip(typeRow, button);
    apply();
  });

  qs('#only-with').addEventListener('click', (event) => {
    query.soloCon = !query.soloCon;
    event.currentTarget.classList.toggle('is-on', query.soloCon);
    event.currentTarget.setAttribute('aria-pressed', String(query.soloCon));
    apply();
  });

  qs('#f-clear').addEventListener('click', () => {
    Object.assign(query, { anio: '', decada: '', marca: '', comp: '', tipo: '', soloCon: false });
    qs('#f-year').value = '';
    qs('#f-brand').value = '';
    qs('#f-comp').value = '';
    pickChip(decadeRow, qs('[data-decade=""]', decadeRow));
    pickChip(typeRow, qs('[data-type=""]', typeRow));
    const toggle = qs('#only-with');
    toggle.classList.remove('is-on');
    toggle.setAttribute('aria-pressed', 'false');
    apply();
  });

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) renderChunk(); },
      { rootMargin: '1000px 0px' }
    );
    observer.observe(sentinel);
  }

  apply();
  return () => observer && observer.disconnect();
}
