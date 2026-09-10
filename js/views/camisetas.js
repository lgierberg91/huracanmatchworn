/**
 * Camisetas: el núcleo del archivo.
 *
 * Una línea de tiempo por temporada, de la más nueva a la más vieja. Cada año
 * muestra las camisetas que conocemos de esa temporada; el partido queda como
 * dato de apoyo, no como protagonista.
 *
 * La camiseta de CADA partido se carga a mano desde la ficha del partido y se
 * guarda en `match_kits`. Lo que se ve acá es el nivel de temporada: qué prendas
 * existieron ese año.
 */

import { esc, qs, observeReveals, fragment } from '../lib/dom.js';
import { num, plural, decadeLabel } from '../lib/format.js';
import { allYears, matchesOfYear, globalStats } from '../data/store.js';
import { kitsForYear, kitCount, roleCounts, ROLE_LABEL, SEASON_KITS } from '../data/seasonKits.js';
import { brandForYear } from '../data/brands.js';
import { statHTML } from '../components/ui.js';
import { jerseyHTML } from '../components/jersey.js';

const YEARS_PER_CHUNK = 10;

export const seasonKitHref = (kit) => `#/camiseta/${encodeURIComponent(kit.id)}`;

/* ---------------- piezas ---------------- */

function kitCardHTML(kit) {
  return `<a class="skit reveal" href="${seasonKitHref(kit)}">
      <div class="skit__stage">
        <img src="${esc(kit.src)}" alt="Camiseta de Huracán ${esc(kit.label)}" loading="lazy" decoding="async">
      </div>
      <div class="skit__body">
        <strong class="skit__label">${esc(kit.label)}</strong>
        <span class="skit__role mono">${esc(ROLE_LABEL[kit.role] || ROLE_LABEL.null)}</span>
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

  return `<section class="tl-year" id="anio-${year}">
      <div class="tl-year__spine">
        <a class="tl-year__num" href="#/temporada/${year}">${year}</a>
        <span class="tl-year__dot"></span>
      </div>
      <div class="tl-year__content">
        <div class="tl-year__meta mono">
          ${kits.length ? `<span class="chip chip--red chip--static">${plural(kits.length, 'camiseta', 'camisetas')}</span>` : ''}
          ${brand ? `<span class="chip chip--static">${esc(brand)}</span>` : ''}
          <a href="#/temporada/${year}">${plural(matches.length, 'partido', 'partidos')} →</a>
        </div>
        <div class="tl-year__kits">
          ${kits.length ? kits.map(kitCardHTML).join('') : emptyYearHTML(year, matches.length)}
        </div>
      </div>
    </section>`;
}

/* ---------------- vista ---------------- */

export function renderCamisetas(ctx) {
  const stats = globalStats();
  const roles = roleCounts();
  const years = allYears().sort((a, b) => b - a);
  const decades = [...new Set(years.map((y) => Math.floor(y / 10) * 10))];
  const withKits = new Set(SEASON_KITS.map((k) => k.year)).size;
  const query = {
    rol: ctx.params.get('rol') || '',
    decada: ctx.params.get('decada') || '',
    soloCon: ctx.params.get('con') === '1',
  };

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
          ${statHTML({ value: roles.sinClasificar, label: 'Sin clasificar', note: 'jugador o arquero' })}
        </div>
      </div>
    </section>

    <div class="kitbar">
      <div class="shell kitbar__row">
        <div class="chip-scroll" id="decade-nav">
          <button type="button" class="chip${query.decada ? '' : ' is-on'}" data-decade="">Todas</button>
          ${decades.map((d) => `<button type="button" class="chip${query.decada === String(d) ? ' is-on' : ''}" data-decade="${d}">${esc(decadeLabel(d))}</button>`).join('')}
        </div>
        <button type="button" class="chip${query.soloCon ? ' is-on' : ''}" id="only-with" aria-pressed="${query.soloCon}">
          Solo con camiseta
        </button>
      </div>
    </div>

    <div class="shell" style="padding-bottom:clamp(50px,8vw,100px)">
      <p class="timeline-count mono" id="tl-count" aria-live="polite"></p>
      <div class="timeline-rail" id="tl-list"></div>
      <div id="tl-sentinel" class="load-sentinel"></div>
    </div>`;
}

export function mountCamisetas(ctx) {
  const query = {
    decada: ctx.params.get('decada') || '',
    soloCon: ctx.params.get('con') === '1',
  };

  const list = qs('#tl-list');
  const countEl = qs('#tl-count');
  const sentinel = qs('#tl-sentinel');
  let years = [];
  let shown = 0;
  let observer = null;

  function syncUrl() {
    const params = new URLSearchParams();
    if (query.decada) params.set('decada', query.decada);
    if (query.soloCon) params.set('con', '1');
    const search = params.toString();
    const hash = `#/camisetas${search ? `?${search}` : ''}`;
    if (location.hash !== hash) history.replaceState(null, '', hash);
  }

  function compute() {
    const decade = query.decada ? Number(query.decada) : null;
    return allYears()
      .sort((a, b) => b - a)
      .map((year) => ({ year, kits: kitsForYear(year) }))
      .filter((entry) => {
        if (decade && Math.floor(entry.year / 10) * 10 !== decade) return false;
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

  qs('#decade-nav').addEventListener('click', (event) => {
    const button = event.target.closest('[data-decade]');
    if (!button) return;
    query.decada = button.dataset.decade;
    qs('#decade-nav').querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-on', c === button));
    apply();
  });

  qs('#only-with').addEventListener('click', (event) => {
    query.soloCon = !query.soloCon;
    event.currentTarget.classList.toggle('is-on', query.soloCon);
    event.currentTarget.setAttribute('aria-pressed', String(query.soloCon));
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
