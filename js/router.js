/**
 * Router por hash. Sin dependencias y con soporte para los enlaces viejos.
 */

import { qs, qsa, observeReveals } from './lib/dom.js';

import { renderHome, mountHome } from './views/home.js';
import { renderColeccion, mountColeccion } from './views/coleccion.js';
import { renderTemporada } from './views/temporada.js';
import { renderPartido, mountPartido } from './views/partido.js';
import { renderRival } from './views/rival.js';
import { renderEstadisticas } from './views/estadisticas.js';
import { renderAdmin, mountAdmin } from './views/admin.js';
import { renderCamisetas, mountCamisetas } from './views/camisetas.js';
import { renderCamiseta, mountCamiseta } from './views/camiseta.js';
import { renderKitCreator, mountKitCreator } from './views/kitCreator.js';

// El navegador restaura solo la posición de scroll al crear entradas de historial,
// y en una SPA eso deja la vista nueva abierta a media página. Se apaga al importar,
// que es lo más temprano posible.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

const ROUTES = [
  { pattern: /^\/?$/, id: 'inicio', title: 'Huracán Matchworn', render: renderHome, mount: mountHome },
  { pattern: /^\/camisetas$/, id: 'camisetas', title: 'Camisetas', render: renderCamisetas, mount: mountCamisetas },
  { pattern: /^\/camiseta\/(?<id>.+)$/, id: 'camisetas', title: 'Camiseta', render: renderCamiseta, mount: mountCamiseta },
  { pattern: /^\/kit-creator$/, id: 'creator', title: 'Kit Creator', render: renderKitCreator, mount: mountKitCreator },
  { pattern: /^\/coleccion$/, id: 'partidos', title: 'Partidos', render: renderColeccion, mount: mountColeccion },
  { pattern: /^\/estadisticas$/, id: 'estadisticas', title: 'Estadísticas', render: renderEstadisticas },
  { pattern: /^\/admin$/, id: 'admin', title: 'Administración', render: renderAdmin, mount: mountAdmin },
  { pattern: /^\/temporada\/(?<year>\d{4})$/, id: 'camisetas', title: 'Temporada', render: renderTemporada },
  { pattern: /^\/partido\/(?<id>.+)$/, id: 'partidos', title: 'Partido', render: renderPartido, mount: mountPartido },
  { pattern: /^\/rival\/(?<id>.+)$/, id: 'partidos', title: 'Rival', render: renderRival },
];

/** Enlaces de la versión anterior, para que nada quede roto. */
const LEGACY = [
  [/^\/season\/(\d{4})/, (m) => `#/temporada/${m[1]}`],
  [/^\/match\/(.+)/, (m) => `#/partido/${m[1]}`],
  [/^\/buscar\/(.*)/, (m) => `#/coleccion?q=${m[1]}`],
  // Historia dejó de ser sección propia: la reemplaza la línea de tiempo de camisetas.
  [/^\/historia$/, () => '#/camisetas'],
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
  if (path !== lastPath) scrollToTop();
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


/** Vuelve al tope sin importar qué elemento sea el que scrollea. */
function scrollToTop() {
  const jump = () => {
    // `scroll-behavior: smooth` animaría el salto; al cambiar de vista molesta
    // y además la animación se puede cortar por la mitad.
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    html.scrollTop = 0;
    document.body.scrollTop = 0;
    html.style.scrollBehavior = previous;
  };
  jump();
  // Otra vez en el frame siguiente: recién ahí el alto de la vista nueva es el
  // definitivo, y sin esto el navegador vuelve a dejar el scroll donde estaba.
  requestAnimationFrame(jump);
}