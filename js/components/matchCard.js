/**
 * La pieza de la colección: cada partido es una ficha del archivo.
 *
 * El protagonista visual es la foto de la camiseta cuando existe; mientras no
 * exista, lo es el escudo del rival, que es el dato real más fuerte que tenemos.
 */

import { esc } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { dateMedium, dateShort, resultLabel, resultClass, venueShort, resultLong } from '../lib/format.js';
import { crestHTML } from './crest.js';
import { jerseyHTML, jerseyIcon } from './jersey.js';
import { accentVars } from '../data/model.js';
import { photoUrl } from '../data/api.js';
import { clubShort } from '../data/clubs.js';

export const matchHref = (match) => `#/partido/${encodeURIComponent(match.id)}`;

function stageHTML(match) {
  if (match.kitPhoto) {
    return `<img class="match-card__photo" src="${esc(photoUrl(match.kitPhoto))}"
        alt="Camiseta usada ante ${esc(match.club.name)}" loading="lazy" decoding="async">`;
  }
  return crestHTML(match.club, 'xl');
}

function kitFlagHTML(match) {
  if (match.kitPhoto) return `<span class="kit-flag kit-flag--has">${jerseyIcon()} Con foto</span>`;
  if (match.kitDescription) return `<span class="kit-flag kit-flag--has">${jerseyIcon()} Identificada</span>`;
  return `<span class="kit-flag">${jerseyIcon()} Sin identificar</span>`;
}

/**
 * @param {object} match
 * @param {{ starred?: boolean, reason?: string }} options
 */
export function matchCardHTML(match, options = {}) {
  const showStar = options.starred && match.highlightReason;
  const scoreText = match.played ? `${match.gf}–${match.ga}` : 'A jugarse';

  return `<a class="match-card reveal" href="${matchHref(match)}" style="${accentVars(match)}">
      <div class="match-card__stage">
        <div class="match-card__tags">
          <span class="chip chip--static">${esc(match.family.short)}</span>
          ${match.result
            ? `<span class="res res--${resultClass(match.result)}" title="${esc(resultLong(match.result))}">${resultLabel(match.result)}</span>`
            : `<span class="res res--x">—</span>`}
        </div>
        ${stageHTML(match)}
        ${showStar ? `<span class="star-badge" title="${esc(match.highlightReason)}">${icon('star')}</span>` : ''}
      </div>
      <div class="match-card__body">
        <h3 class="match-card__rival">${esc(clubShort(match.club))}</h3>
        <div class="match-card__meta mono">
          <span>${esc(dateMedium(match.date))}</span><i>·</i>
          <span>${esc(venueShort(match.venue))}</span><i>·</i>
          <span>${esc(scoreText)}</span>
        </div>
      </div>
      <div class="match-card__foot">
        ${kitFlagHTML(match)}
        <span class="match-card__cta">Ver ficha →</span>
      </div>
    </a>`;
}

/** Fila compacta: listados densos (temporada, rival, resultados de búsqueda). */
export function matchRowHTML(match, options = {}) {
  const { showYear = false } = options;
  const dateText = showYear ? dateShort(match.date) : dateShort(match.date);

  return `<a class="match-row" href="${matchHref(match)}">
      <span class="match-row__date mono">${esc(dateText)}</span>
      ${crestHTML(match.club, 'sm')}
      <span class="match-row__main">
        <span class="match-row__rival">${esc(match.club.name)}</span>
        <span class="match-row__sub">${esc(match.family.short)}${match.roundLabel ? ` · ${esc(match.roundLabel)}` : ''} · ${esc(venueShort(match.venue))}</span>
      </span>
      <span class="match-row__score">
        <b class="mono">${match.played ? `${match.gf}–${match.ga}` : '—'}</b>
        <span class="res res--${resultClass(match.result)}">${resultLabel(match.result)}</span>
      </span>
    </a>`;
}

/** Estado vacío reutilizable, con la silueta de camiseta. */
export function emptyStateHTML({ title, text, action = '' }) {
  return `<div class="empty">
      <span class="empty__icon">${jerseyHTML({ size: 54, showBalloon: false, label: '' })}</span>
      <h4>${esc(title)}</h4>
      <p>${esc(text)}</p>
      ${action}
    </div>`;
}

