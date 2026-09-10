/**
 * Widget de sesión en el header: ingresar / cuenta del historiador logueado.
 */

import { esc, qs } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { state, subscribe, signIn, signOut, isAdmin } from '../data/auth.js';

function loggedOutHTML() {
  return `
    <button type="button" class="auth-btn" id="auth-open-btn">${icon('user')} Ingresar</button>
    <div class="auth-pop" id="auth-pop" hidden>
      <form id="auth-form" class="auth-form">
        <input class="field" type="email" id="auth-email" placeholder="Email" autocomplete="username" required>
        <input class="field" type="password" id="auth-password" placeholder="Contraseña" autocomplete="current-password" required>
        <button type="submit" class="btn btn--primary btn--sm btn--block">Ingresar</button>
        <span class="form-status" id="auth-status"></span>
      </form>
    </div>`;
}

function loggedInHTML() {
  const label = (state.profile && state.profile.display_name) || state.session.user.email;
  return `
    <button type="button" class="auth-btn" id="auth-open-btn">${icon('user')} ${esc(label)}</button>
    <div class="auth-pop" id="auth-pop" hidden>
      <div class="auth-menu">
        <span class="auth-menu__you">${esc(state.session.user.email)}</span>
        ${isAdmin() ? '<a href="#/admin">Panel de administración</a>' : ''}
        <button type="button" class="link" id="auth-logout">Salir</button>
      </div>
    </div>`;
}

function render() {
  const wrap = qs('#auth-wrap');
  if (!wrap) return;
  wrap.innerHTML = state.session ? loggedInHTML() : loggedOutHTML();
  bind(wrap);
}

function bind(wrap) {
  const openBtn = qs('#auth-open-btn', wrap);
  const pop = qs('#auth-pop', wrap);
  if (openBtn && pop) {
    openBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      pop.hidden = !pop.hidden;
    });
    pop.addEventListener('click', (event) => event.stopPropagation());
  }

  const form = qs('#auth-form', wrap);
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = qs('#auth-status', wrap);
      const email = qs('#auth-email', wrap).value.trim();
      const password = qs('#auth-password', wrap).value;
      status.textContent = 'Ingresando…';
      try {
        await signIn(email, password);
      } catch {
        status.textContent = 'Email o contraseña incorrectos.';
      }
    });
  }

  const logoutBtn = qs('#auth-logout', wrap);
  if (logoutBtn) logoutBtn.addEventListener('click', () => signOut());
}

let outsideClickBound = false;

export function installAuthWidget() {
  render();
  subscribe(render);
  if (!outsideClickBound) {
    outsideClickBound = true;
    document.addEventListener('click', () => {
      const pop = qs('#auth-pop');
      if (pop && !pop.hidden) pop.hidden = true;
    });
  }
}
