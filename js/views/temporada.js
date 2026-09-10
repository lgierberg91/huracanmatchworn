/**
 * Temporada: todos los partidos de un año, con su balance.
 */

import { esc } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { num, plural } from '../lib/format.js';
import { matchesOfYear, record, allYears } from '../data/store.js';
import { matchCardHTML, matchRowHTML, emptyStateHTML } from '../components/matchCard.js';
import { splitBarHTML, statHTML, sectionHead } from '../components/ui.js';

export function renderTemporada(ctx) {
  const year = Number(ctx.params.get('year'));
  const matches = matchesOfYear(year).sort((a, b) => a.date.localeCompare(b.date));
  const years = allYears();
  const prev = years.filter((y) => y < year).pop();
  const next = years.find((y) => y > year);

  if (!matches.length) {
    return `<div class="shell section">
        <a class="backlink" href="#/historia">${icon('arrowLeft')} Toda la historia</a>
        <h1 style="margin:18px 0 24px">${year}</h1>
        ${emptyStateHTML({
          title: `Todavía no hay partidos de ${year}`,
          text: 'El archivo se va completando por bloques. Probá con otro año desde la línea de tiempo.',
        })}
      </div>`;
  }

  const balance = record(matches);
  const byCompetition = new Map();
  for (const match of matches) {
    if (!byCompetition.has(match.competition)) byCompetition.set(match.competition, []);
    byCompetition.get(match.competition).push(match);
  }

  return `<section class="section section--dark section--tight">
      <div class="shell">
        <a class="backlink backlink--onDark" href="#/historia">${icon('arrowLeft')} Toda la historia</a>
        <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-top:18px">
          <div>
            <span class="eyebrow eyebrow--dark">Temporada</span>
            <h1 style="font-size:clamp(3rem,10vw,6rem);color:var(--on-dark);margin-top:8px">${year}</h1>
          </div>
          <div style="display:flex;gap:10px">
            ${prev ? `<a class="btn btn--onDark btn--sm" href="#/temporada/${prev}">${icon('arrowLeft')} ${prev}</a>` : ''}
            ${next ? `<a class="btn btn--onDark btn--sm" href="#/temporada/${next}">${next} ${icon('arrowRight')}</a>` : ''}
          </div>
        </div>
        <div class="hero__counts">
          ${statHTML({ value: matches.length, label: 'Partidos' })}
          ${statHTML({ value: balance.w, label: 'Ganados', color: 'var(--win)' })}
          ${statHTML({ value: balance.d, label: 'Empatados', color: 'var(--draw)' })}
          ${statHTML({ value: balance.l, label: 'Perdidos', color: 'var(--loss)' })}
          ${statHTML({ value: `${balance.gf}:${balance.ga}`, label: 'Goles', size: 'clamp(1.5rem,3vw,2.1rem)' })}
        </div>
      </div>
    </section>

    <div class="shell section">
      ${sectionHead({ eyebrow: plural(byCompetition.size, 'competencia', 'competencias'), title: 'Las piezas del año' })}
      <div class="piece-grid">${matches.map((m) => matchCardHTML(m)).join('')}</div>

      <div class="panel reveal" style="margin-top:clamp(34px,5vw,56px)">
        <div class="panel__title">Balance de ${year}</div>
        ${splitBarHTML(balance)}
      </div>

      ${[...byCompetition.entries()]
        .map(
          ([competition, list]) => `<div style="margin-top:clamp(30px,4vw,48px)">
            <div class="panel__title">${esc(competition)} · ${num(list.length)}</div>
            <div>${list.map((m) => matchRowHTML(m)).join('')}</div>
          </div>`
        )
        .join('')}
    </div>`;
}
