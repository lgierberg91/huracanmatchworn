/**
 * Piezas de interfaz compartidas entre vistas (encabezados, métricas, barras).
 */

import { esc, cx } from '../lib/dom.js';
import { num } from '../lib/format.js';

export function sectionHead({ eyebrow = '', title, link = null, onDark = false }) {
  return `<header class="section-head">
      <div class="section-head__title">
        ${eyebrow ? `<span class="${cx('eyebrow', onDark && 'eyebrow--dark')}">${esc(eyebrow)}</span>` : ''}
        <h2>${esc(title)}</h2>
      </div>
      ${link ? `<a class="section-head__link mono" href="${esc(link.href)}">${esc(link.text)} →</a>` : ''}
    </header>`;
}

export function statHTML({ value, label, note = '', color = '', size = '' }) {
  const style = [color && `--stat-color:${color}`, size && `--stat-size:${size}`].filter(Boolean).join(';');
  return `<div class="stat"${style ? ` style="${style}"` : ''}>
      <span class="stat__value">${typeof value === 'number' ? num(value) : esc(value)}</span>
      <span class="stat__label">${esc(label)}</span>
      ${note ? `<span class="stat__note">${esc(note)}</span>` : ''}
    </div>`;
}

/** Barra PG / E / PP proporcional. */
export function splitBarHTML({ w, d, l }) {
  const total = w + d + l || 1;
  const pct = (n) => `${((n / total) * 100).toFixed(1)}%`;
  return `<div>
      <div class="split-bar" role="img" aria-label="${w} ganados, ${d} empatados, ${l} perdidos">
        <span class="split-bar__w" style="width:${pct(w)}"></span>
        <span class="split-bar__d" style="width:${pct(d)}"></span>
        <span class="split-bar__l" style="width:${pct(l)}"></span>
      </div>
      <div class="split-legend mono" style="margin-top:10px">
        <span><i style="background:var(--win)"></i>${num(w)} PG</span>
        <span><i style="background:var(--draw)"></i>${num(d)} E</span>
        <span><i style="background:var(--loss)"></i>${num(l)} PP</span>
      </div>
    </div>`;
}

/**
 * Lista de barras comparativas.
 * @param {Array<{label:string, value:number, prefix?:string, href?:string}>} items
 */
export function barListHTML(items, options = {}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const color = options.color || 'var(--red)';
  return `<div class="bar-list reveal">
      ${items
        .map((item) => {
          const label = item.href
            ? `<a href="${esc(item.href)}"><span>${esc(item.label)}</span></a>`
            : `<span>${esc(item.label)}</span>`;
          return `<div class="bar-item">
              <div class="bar-item__head">
                ${item.prefix || ''}${label}
                <b>${num(item.value)}</b>
              </div>
              <div class="bar-item__track">
                <span class="bar-item__fill" style="width:${((item.value / max) * 100).toFixed(1)}%;background:${color}"></span>
              </div>
            </div>`;
        })
        .join('')}
    </div>`;
}

export function factHTML({ label, value, note = '', media = '' }) {
  return `<div class="fact reveal">
      <span class="fact__label">${esc(label)}</span>
      <div class="fact__main">
        ${media}
        <span class="fact__value">${esc(value)}</span>
      </div>
      ${note ? `<p class="fact__note">${note}</p>` : ''}
    </div>`;
}
