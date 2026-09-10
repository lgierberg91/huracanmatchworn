/**
 * Composición Huracán — resultado — rival, con los dos escudos.
 * Respeta la localía: si Huracán juega de visitante, va segundo.
 */

import { esc, cx } from '../lib/dom.js';
import { crestHTML } from './crest.js';
import { HURACAN, clubShort } from '../data/clubs.js';

/**
 * @param {object} match  partido enriquecido
 * @param {{ size?: 'sm'|'md', crest?: string, onDark?: boolean, useShort?: boolean }} options
 */
export function scorelineHTML(match, options = {}) {
  const { size = 'sm', crest = 'sm', onDark = false, useShort = true } = options;
  const huracanFirst = match.venue !== 'A';

  const rivalName = useShort ? clubShort(match.club) : match.club.name;
  const home = huracanFirst ? { club: HURACAN, name: 'Huracán' } : { club: match.club, name: rivalName };
  const away = huracanFirst ? { club: match.club, name: rivalName } : { club: HURACAN, name: 'Huracán' };

  const score = match.played
    ? (huracanFirst
        ? `${match.gf}<span>–</span>${match.ga}`
        : `${match.ga}<span>–</span>${match.gf}`)
    : 'A jugarse';

  const vars = size === 'md'
    ? '--sl-name:1.15rem; --sl-score:1.75rem; --sl-gap:18px;'
    : '--sl-name:.92rem; --sl-score:1.15rem;';

  return `<div class="${cx('scoreline', onDark && 'scoreline--dark', !match.played && 'scoreline--pending')}" style="${vars}">
      <div class="scoreline__team">
        ${crestHTML(home.club, crest, { onDark })}
        <span class="scoreline__name">${esc(home.name)}</span>
      </div>
      <div class="scoreline__score mono">${score}</div>
      <div class="scoreline__team scoreline__team--away">
        ${crestHTML(away.club, crest, { onDark })}
        <span class="scoreline__name">${esc(away.name)}</span>
      </div>
    </div>`;
}
