/**
 * Historial completo contra un rival.
 */

import { esc } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { plural, dateMedium } from '../lib/format.js';
import { clubEntry, record } from '../data/store.js';
import { crestHTML } from '../components/crest.js';
import { crestUrl } from '../data/clubs.js';
import { matchCardHTML, matchRowHTML, emptyStateHTML } from '../components/matchCard.js';
import { splitBarHTML, statHTML, sectionHead } from '../components/ui.js';

export function renderRival(ctx) {
  const id = ctx.params.get('id');
  const entry = clubEntry(id);

  if (!entry) {
    return `<div class="shell section">
        <a class="backlink" href="#/coleccion">${icon('arrowLeft')} La colección</a>
        <div style="margin-top:20px">
          ${emptyStateHTML({
            title: 'No encontramos ese rival',
            text: 'Puede que el enlace esté viejo. Probá buscarlo desde la colección.',
          })}
        </div>
      </div>`;
  }

  const { club } = entry;
  const matches = entry.matches.slice().sort((a, b) => b.date.localeCompare(a.date));
  const balance = record(matches);
  const first = matches[matches.length - 1];
  const last = matches.find((m) => m.played) || matches[0];
  const url = crestUrl(club);

  const highlights = matches
    .slice()
    .sort((a, b) => b.highlight - a.highlight || b.date.localeCompare(a.date))
    .slice(0, 4);

  return `<section class="club-hero">
      <div class="shell">
        <a class="backlink backlink--onDark" href="#/coleccion">${icon('arrowLeft')} La colección</a>
        <div class="club-hero__inner" style="margin-top:20px">
          <div class="club-hero__crest">
            ${url ? `<img src="${esc(url)}" alt="Escudo de ${esc(club.name)}" width="256" height="256">` : crestHTML(club, 'lg', { onDark: true })}
          </div>
          <div class="club-hero__text">
            <span class="eyebrow eyebrow--dark">Historial</span>
            <h1>Huracán vs. ${esc(club.name)}</h1>
            <div class="club-hero__record">
              ${splitBarHTML(balance)}
            </div>
          </div>
        </div>
        <div class="hero__counts">
          ${statHTML({ value: matches.length, label: 'Partidos' })}
          ${statHTML({ value: `${balance.gf}:${balance.ga}`, label: 'Goles', size: 'clamp(1.4rem,3vw,2rem)' })}
          ${first ? statHTML({ value: first.year, label: 'Primer cruce' }) : ''}
          ${last ? statHTML({ value: last.year, label: 'Último cruce' }) : ''}
        </div>
      </div>
    </section>

    <div class="shell section">
      ${highlights.length
        ? `${sectionHead({ eyebrow: 'De este historial', title: 'Partidos para recordar' })}
           <div class="piece-grid" style="margin-bottom:clamp(34px,5vw,56px)">
             ${highlights.map((m) => matchCardHTML(m, { starred: true })).join('')}
           </div>`
        : ''}

      ${sectionHead({ eyebrow: plural(matches.length, 'cruce', 'cruces'), title: 'Todos los partidos' })}
      <div>${matches.map((m) => matchRowHTML(m, { showYear: true })).join('')}</div>

      ${first && first !== last
        ? `<p class="stat__note" style="margin-top:20px">
            Primer cruce el ${esc(dateMedium(first.date))} · último el ${esc(dateMedium(matches[0].date))}.
          </p>`
        : ''}
    </div>`;
}
