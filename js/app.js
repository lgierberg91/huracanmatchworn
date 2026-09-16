/**
 * Arranque de la aplicación.
 */

import { qs, esc } from './lib/dom.js';
import { icon } from './lib/icons.js';
import { dateMedium } from './lib/format.js';
import { applyTheme, getTheme, cycleTheme, effectiveTheme } from './lib/storage.js';
import { installCrestFallback, crestHTML } from './components/crest.js';
import { installSearchOverlay, open as openSearch } from './components/searchOverlay.js';
import { installAuthWidget } from './components/authWidget.js';
import { load, subscribe, nextFixtures } from './data/store.js';
import { matchHref } from './components/matchCard.js';
import { startRouter, route } from './router.js';
import { initAuth, subscribe as subscribeAuth } from './data/auth.js';
import { clubShort } from './data/clubs.js';
import { competitionLogo } from './data/competitions.js';

/* ---------- tema ---------- */

function paintThemeButton() {
  const button = qs('#theme-btn');
  if (!button) return;
  const current = effectiveTheme();
  button.innerHTML = current === 'dark' ? icon('sun') : icon('moon');
  button.title = `Tema: ${getTheme() === 'auto' ? 'automático' : getTheme()}`;
  button.setAttribute('aria-label', button.title);
}

function installTheme() {
  applyTheme(getTheme());
  paintThemeButton();
  qs('#theme-btn')?.addEventListener('click', () => {
    cycleTheme();
    paintThemeButton();
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintThemeButton);
}

/* ---------- topbar ---------- */

function renderTopbar() {
  const el = qs('#topbar');
  if (!el) return;
  const fixtures = nextFixtures(3);
  if (!fixtures.length) {
    el.innerHTML = '';
    return;
  }
  const items = fixtures
    .map((m) => {
      const logo = competitionLogo(m.family, m.date);
      const compHTML = logo
        ? `<img class="topbar__comp" src="${esc(logo)}" alt="${esc(m.family.short)}" title="${esc(m.family.short)}">`
        : `<span class="topbar__comp topbar__comp--text">${esc(m.family.short)}</span>`;
      return `<a class="topbar__fixture" href="${matchHref(m)}">
          ${compHTML}
          <strong>${esc(dateMedium(m.date))} · vs</strong>
          ${crestHTML(m.club, 'xs', { onDark: true })}
          <span>${esc(clubShort(m.club))}</span>
        </a>`;
    })
    .join('<span class="topbar__sep" aria-hidden="true">·</span>');
  el.innerHTML = `<div class="shell topbar__inner">
      <span class="topbar__label">Próximo${fixtures.length > 1 ? 's' : ''} partido${fixtures.length > 1 ? 's' : ''}</span>
      <div class="topbar__viewport">
        <div class="topbar__marquee">
          <span class="topbar__group">${items}</span>
          <span class="topbar__group topbar__group--dup" aria-hidden="true">${items}</span>
        </div>
      </div>
    </div>`;
}

/* ---------- header ---------- */

function installHeader() {
  const header = qs('.site-header');
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 4);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  qs('#search-btn')?.addEventListener('click', () => openSearch());
  qs('#search-btn-mobile')?.addEventListener('click', () => openSearch());

  installAuthWidget();
  subscribeAuth(() => {
    if (routerStarted) route();
  });
}

/* ---------- estados de carga ---------- */

function skeletonHTML() {
  return `<div class="shell section">
      <div style="display:grid;gap:18px;max-width:640px">
        <div class="skeleton" style="height:26px;width:180px"></div>
        <div class="skeleton" style="height:64px"></div>
        <div class="skeleton" style="height:20px;width:80%"></div>
      </div>
      <div class="piece-grid" style="margin-top:44px">
        ${Array.from({ length: 8 }, () => '<div class="skeleton skeleton-card"></div>').join('')}
      </div>
    </div>`;
}

function errorHTML(error) {
  return `<div class="shell section">
      <div class="empty">
        <h4>No se pudo abrir el archivo</h4>
        <p>${esc(error && error.message ? error.message : 'Error de conexión')}</p>
        <button type="button" class="btn btn--primary btn--sm" onclick="location.reload()">Reintentar</button>
      </div>
    </div>`;
}

/* ---------- arranque ---------- */

let routerStarted = false;

function boot() {
  installTheme();
  installHeader();
  installCrestFallback();
  installSearchOverlay();
  initAuth();

  const view = qs('#view');
  view.innerHTML = skeletonHTML();

  // Se espera al archivo completo antes de pintar: las estadísticas y los
  // filtros se calculan sobre el total, y mostrar cifras a medias y corregirlas
  // un segundo después es peor que esperar. La caché de sesión hace que la
  // segunda visita sea instantánea.
  subscribe((s) => {
    if (s.status === 'error') {
      view.innerHTML = errorHTML(s.error);
      return;
    }
    if (s.status === 'ready' && !routerStarted) {
      routerStarted = true;
      renderTopbar();
      startRouter();
    }
  });

  load().catch((error) => console.error('No se pudo cargar el archivo:', error));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

