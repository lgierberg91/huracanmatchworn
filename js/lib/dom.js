/**
 * Utilidades mínimas de DOM. Sin dependencias externas.
 */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapa texto para interpolar dentro de plantillas HTML. */
export function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Delegación de eventos: on(root, 'click', '.chip', handler) */
export function on(root, type, selector, handler, options) {
  root.addEventListener(
    type,
    (event) => {
      const target = event.target.closest(selector);
      if (target && root.contains(target)) handler(event, target);
    },
    options
  );
}

/** Convierte un string HTML en un DocumentFragment (una sola pasada de parseo). */
export function fragment(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  return tpl.content;
}

/** Une clases ignorando falsy. */
export const cx = (...parts) => parts.filter(Boolean).join(' ');

/** Debounce simple. */
export function debounce(fn, wait = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/**
 * Observa elementos .reveal y los muestra al entrar en viewport.
 * Se llama después de pintar cada vista; los ya observados se ignoran.
 */
let revealObserver = null;
export function observeReveals(root = document) {
  const targets = qsa('.reveal:not(.is-in)', root);
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );
  }
  targets.forEach((el) => revealObserver.observe(el));
}

/** Notificación efímera. */
export function toast(message, kind = 'ok') {
  let stack = qs('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.setAttribute('role', 'status');
    stack.setAttribute('aria-live', 'polite');
    document.body.appendChild(stack);
  }
  const node = document.createElement('div');
  node.className = cx('toast', kind === 'err' && 'toast--err');
  node.textContent = message;
  stack.appendChild(node);
  setTimeout(() => node.remove(), 4200);
}
