/**
 * Silueta de camiseta.
 *
 * Es deliberadamente neutra: mientras no haya foto cargada no sabemos qué
 * camiseta se usó, así que la pieza se muestra en blanco — como un casillero
 * vacío de un álbum — y nunca como si fuera el diseño real de esa temporada.
 */

import { esc } from '../lib/dom.js';

const SHIRT_PATH =
  'M36 8 L10 18 L3.5 41 L23 47.5 L23 104 L77 104 L77 47.5 L96.5 41 L90 18 L64 8 ' +
  'C64 8 58.5 20.5 50 20.5 C41.5 20.5 36 8 36 8 Z';

/** Escote en V, dibujado como trazo para que se lea como vivo de cuello. */
const COLLAR_PATH = 'M37.5 9.5 C40.5 16.5 44.8 21.5 50 21.5 C55.2 21.5 59.5 16.5 62.5 9.5';

/** Globo de Huracán, simplificado, como marca de agua sobre el pecho. */
const BALLOON =
  '<ellipse class="j-mark" cx="50" cy="62" rx="13.5" ry="15.5"/>' +
  '<rect class="j-mark" x="45.6" y="79" width="8.8" height="6" rx="1.6"/>';

/**
 * @param {{ size?: number, label?: string, showBalloon?: boolean }} options
 */
export function jerseyHTML(options = {}) {
  const { size = 96, label = 'Camiseta sin identificar', showBalloon = true } = options;
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
  return `<svg class="jersey" style="--jersey-size:${Number(size)}px" viewBox="0 0 100 112" ${a11y}>
      <path class="j-body" d="${SHIRT_PATH}"/>
      ${showBalloon ? BALLOON : ''}
      <path class="j-trim" d="${COLLAR_PATH}"/>
    </svg>`;
}

/** Versión mínima para íconos en línea (chips, listas). */
export function jerseyIcon() {
  return `<svg viewBox="0 0 100 112" fill="currentColor" aria-hidden="true"><path d="${SHIRT_PATH}"/></svg>`;
}
