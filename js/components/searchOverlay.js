/**
 * Buscador global (⌘K / Ctrl+K, o la tecla "/").
 * Devuelve partidos, rivales y años en la misma lista, con navegación por teclado.
 */

import { esc, qs, qsa, debounce, fragment } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { dateMedium, plural } from '../lib/format.js';
import { quickSearch } from '../data/store.js';
import { crestHTML } from '../components/crest.js';
import { clubShort } from '../data/clubs.js';

let overlay = null;
let input = null;
let resultsBox = null;
let cursor = 0;
let hits = [];
let lastFocused = null;

function template() {
  return `<div class="search-overlay" id="search-overlay" hidden role="dialog" aria-modal="true" aria-label="Buscar en el archivo">
      <div class="search-panel">
        <div class="search-panel__field">
          ${icon('search')}
          <input type="search" id="global-search" placeholder="Buscar rival, año, torneo o partido…" autocomplete="off" spellcheck="false">
          <button type="button" class="icon-btn" id="search-close" aria-label="Cerrar">${icon('close')}</button>
        </div>
        <div class="search-panel__results" id="search-results"></div>
        <div class="search-panel__foot mono">
          <span>↑↓ moverse</span><span>↵ abrir</span><span>esc cerrar</span>
        </div>
      </div>
    </div>`;
}

function hitHTML(hit) {
  return `<button type="button" class="search-hit" data-href="${esc(hit.href)}">
      ${hit.media || '<span></span>'}
      <span style="min-width:0">
        <span class="search-hit__title">${esc(hit.title)}</span>
        <span class="search-hit__sub">${esc(hit.sub)}</span>
      </span>
      <span style="color:var(--ink-3)">${icon('chevronRight')}</span>
    </button>`;
}

function render(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    hits = [];
    resultsBox.innerHTML = `<p class="search-section-label">Escribí para buscar entre los partidos del archivo</p>`;
    return;
  }

  const { matches, clubs, years } = quickSearch(trimmed, 8);
  hits = [];
  let html = '';

  if (clubs.length) {
    html += '<p class="search-section-label">Rivales</p>';
    for (const entry of clubs) {
      const hit = {
        href: `#/rival/${entry.club.id}`,
        title: entry.club.name,
        sub: `${plural(entry.matches.length, 'partido', 'partidos')} · ${entry.w}–${entry.d}–${entry.l}`,
        media: crestHTML(entry.club, 'sm'),
      };
      hits.push(hit);
      html += hitHTML(hit);
    }
  }

  if (years.length) {
    html += '<p class="search-section-label">Temporadas</p>';
    for (const year of years) {
      const hit = { href: `#/temporada/${year}`, title: String(year), sub: 'Ver la temporada completa', media: '' };
      hits.push(hit);
      html += hitHTML(hit);
    }
  }

  if (matches.length) {
    html += '<p class="search-section-label">Partidos</p>';
    for (const match of matches) {
      const hit = {
        href: `#/partido/${encodeURIComponent(match.id)}`,
        title: `Huracán ${match.played ? `${match.gf}–${match.ga}` : 'vs'} ${clubShort(match.club)}`,
        sub: `${dateMedium(match.date)} · ${match.family.short}${match.roundLabel ? ` · ${match.roundLabel}` : ''}`,
        media: crestHTML(match.club, 'sm'),
      };
      hits.push(hit);
      html += hitHTML(hit);
    }
  }

  if (!hits.length) {
    html = `<p class="search-section-label">Sin resultados para “${esc(trimmed)}”</p>`;
  } else {
    html += `<p class="search-section-label"><a href="#/coleccion?q=${encodeURIComponent(trimmed)}">Ver todos los resultados en la colección →</a></p>`;
  }

  resultsBox.innerHTML = '';
  resultsBox.appendChild(fragment(html));
  cursor = 0;
  paintCursor();
}

function paintCursor() {
  qsa('.search-hit', resultsBox).forEach((el, i) => el.classList.toggle('is-cursor', i === cursor));
}

function go(href) {
  close();
  location.hash = href.replace(/^#/, '');
}

export function open(prefill = '') {
  if (!overlay) return;
  lastFocused = document.activeElement;
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  input.value = prefill;
  render(prefill);
  input.focus();
  input.select();
}

export function close() {
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  document.body.style.overflow = '';
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

export function installSearchOverlay() {
  document.body.appendChild(fragment(template()));
  overlay = qs('#search-overlay');
  input = qs('#global-search');
  resultsBox = qs('#search-results');

  input.addEventListener('input', debounce((event) => render(event.target.value), 130));
  qs('#search-close').addEventListener('click', close);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });

  resultsBox.addEventListener('click', (event) => {
    const hit = event.target.closest('.search-hit');
    if (hit) go(hit.dataset.href);
  });

  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { close(); return; }
    if (!hits.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      cursor = (cursor + 1) % hits.length;
      paintCursor();
      qsa('.search-hit', resultsBox)[cursor]?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      cursor = (cursor - 1 + hits.length) % hits.length;
      paintCursor();
      qsa('.search-hit', resultsBox)[cursor]?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (hits[cursor]) go(hits[cursor].href);
    }
  });

  document.addEventListener('keydown', (event) => {
    const typingSomewhereElse =
      event.target instanceof HTMLElement &&
      /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);

    if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      overlay.hidden ? open() : close();
    } else if (event.key === '/' && !typingSomewhereElse && overlay.hidden) {
      event.preventDefault();
      open();
    }
  });
}

