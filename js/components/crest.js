/**
 * Escudo de club. Si el club no tiene archivo propio (o el archivo falla),
 * cae en un monograma con la misma silueta y peso visual.
 */

import { esc, cx } from '../lib/dom.js';
import { crestUrl, monogram } from '../data/clubs.js';

const SIZES = { xs: 'crest--xs', sm: 'crest--sm', md: 'crest--md', lg: 'crest--lg', xl: 'crest--xl', hero: 'crest--hero' };

/**
 * @param {object} club  club canónico
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'hero'} size
 * @param {{ onDark?: boolean, eager?: boolean }} options
 */
export function crestHTML(club, size = 'md', options = {}) {
  const url = crestUrl(club);
  const name = club ? club.name : 'Rival';
  const classes = cx('crest', SIZES[size] || SIZES.md, options.onDark && 'crest--onDark');

  const inner = url
    ? `<img src="${esc(url)}" alt="" width="256" height="256"
         loading="${options.eager ? 'eager' : 'lazy'}" decoding="async"
         data-mono="${esc(monogram(name))}">`
    : `<span class="crest__mono" aria-hidden="true">${esc(monogram(name))}</span>`;

  return `<figure class="${classes}" role="img" aria-label="${esc(name)}">${inner}</figure>`;
}

/**
 * Si un PNG no carga, se reemplaza por el monograma en el acto.
 * Se engancha una sola vez, en fase de captura (los errores de <img> no burbujean).
 */
export function installCrestFallback() {
  document.addEventListener(
    'error',
    (event) => {
      const img = event.target;
      if (!(img instanceof HTMLImageElement) || !img.dataset.mono) return;
      const holder = img.parentElement;
      if (!holder) return;
      holder.innerHTML = `<span class="crest__mono" aria-hidden="true">${esc(img.dataset.mono)}</span>`;
    },
    true
  );
}
