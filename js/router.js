/**
 * Router por hash. Sin dependencias y con soporte para los enlaces viejos.
 */

import { qs, qsa, observeReveals } from './lib/dom.js';

import { renderHome, mountHome } from './views/home.js';
import { renderColeccion, mountColeccion } from './views/coleccion.js';
import { renderHistoria } from './views/historia.js';
import { renderTemporada } from './views/temporada.js';
import { renderPartido, mountPartido } from './views/partido.js';
import { renderRival } from './views/rival.js';
import { renderEstadisticas } from './views/estadisticas.js';
import { renderAdmin, mountAdmin } from './views/admin.js';

const ROUTES = [
  { pattern: /^\/?$/, id: 'inicio', title: 'Huracán Matchworn', render: renderHome, mount: mountHome },
  { pattern: /^\/coleccion$/, id: 'coleccion', title: 'La colección', render: renderColeccion, mount: mountColeccion },
  { pattern: /^\/historia$/, id: 'historia', title: 'Historia', render: renderHistoria },
  { pattern: /^\/estadisticas$/, id: 'estadisticas', title: 'Estadísticas', render: renderEstadisticas },
  { pattern: /^\/admin$/, id: 'admin', title: 'Administración', render: renderAdmin, mount: mountAdmin },
  { pattern: /^\/temporada\/(?<year>\d{4})$/, id: 'historia', title: 'Temporada', render: renderTemporada },
  { pattern: /^\/partido\/(?<id>.+)$/, id: 'coleccion', title: 'Partido', render: renderPartido, mount: mountPartido },
  { pattern: /^\/rival\/(?<id>.+)$/, id: 'coleccion', title: 'Rival', render: renderRival },
];

/** Enlaces de la versión anterior, para que nada quede roto. */
const LEGACY = [
  [/^\/season\/(\d{4})/, (m) => `#/temporada/${m[1]}`],
  [/^\/match\/(.+)/, (m) => `#/partido/${m[1]}`],
  [/^\/buscar\/(.*)/, (m) => `#/coleccion?q=${m[1]}`],
];

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, search = ''] = raw.split('?');
  return { path, params: new URLSearchParams(search) };
}

let disposeCurrent = null;
let lastPath = null;

export function navigate(hash) {
  location.hash = hash.replace(/^#/, '');
}

export function route() {
  const view = qs('#view');
  if (!view) return;

  const { path, params } = parseHash();

  for (const [pattern, build] of LEGACY) {
    const match = path.match(pattern);
    if (match) {
      location.replace(build(match));
      return;
    }
  }

  const found = ROUTES.find((r) => r.pattern.test(path));
  const definition = found || ROUTES[0];
  const pathParams = found ? path.match(found.pattern).groups || {} : {};

  for (const [key, value] of Object.entries(pathParams)) params.set(key, value);
  const ctx = { path, params };

  if (typeof disposeCurrent === 'function') {
    disposeCurrent();
    disposeCurrent = null;
  }

  view.innerHTML = `<div class="view-enter">${definition.render(ctx)}</div>`;

  if (definition.mount) {
    disposeCurrent = definition.mount(ctx, route) || null;
  }

  observeReveals(view);
  setActiveNav(definition.id);
  document.title =
    definition.id === 'inicio'
      ? 'Huracán Matchworn · Archivo de camisetas'
      : `${definition.title} · Huracán Matchworn`;

  // No saltar al tope si sólo cambió el recorte de la colección.
  if (path !== lastPath) window.scrollTo({ top: 0, behavior: 'auto' });
  lastPath = path;
}

function setActiveNav(id) {
  qsa('[data-nav]').forEach((link) => {
    const isActive = link.dataset.nav === id;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

export function startRouter() {
  window.addEventListener('hashchange', route);
  route();
}
