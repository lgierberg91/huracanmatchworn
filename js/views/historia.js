/**
 * Historia: la línea de tiempo del archivo, década por década.
 * Cada año muestra su tira de resultados — se lee de un vistazo cómo le fue.
 */

import { esc } from '../lib/dom.js';
import { num, plural, decadeLabel } from '../lib/format.js';
import { allYears, matchesOfYear, record, globalStats } from '../data/store.js';
import { statHTML } from '../components/ui.js';
import { resultClass } from '../lib/format.js';

function yearRowHTML(year) {
  const matches = matchesOfYear(year).sort((a, b) => a.date.localeCompare(b.date));
  const balance = record(matches);
  const strip = matches
    .map((m) => `<i class="${resultClass(m.result)}" title="${esc(m.date)} · ${esc(m.club.name)}"></i>`)
    .join('');

  return `<a class="year-row reveal" href="#/temporada/${year}">
      <span class="year-row__year">${year}</span>
      <span class="year-row__strip">${strip}</span>
      <span class="year-row__tail mono">
        <b>${num(matches.length)}</b> ${matches.length === 1 ? 'partido' : 'partidos'}
        ${balance.played ? `<br>${balance.w}·${balance.d}·${balance.l}` : ''}
      </span>
    </a>`;
}

function decadeHTML(decade, years) {
  const all = years.flatMap((y) => matchesOfYear(y));
  const balance = record(all);

  return `<section class="decade">
      <header class="decade__head">
        <h2 class="decade__num">${String(decade).slice(0, 3)}<span>${String(decade).slice(3)}</span></h2>
        <div class="decade__meta">
          <span>${esc(decadeLabel(decade))}</span>
          <span>${plural(all.length, 'partido', 'partidos')} · ${balance.w}–${balance.d}–${balance.l}</span>
        </div>
      </header>
      <div class="year-list">${years.map(yearRowHTML).join('')}</div>
    </section>`;
}

export function renderHistoria() {
  const stats = globalStats();
  const years = allYears().sort((a, b) => b - a);

  const byDecade = new Map();
  for (const year of years) {
    const decade = Math.floor(year / 10) * 10;
    if (!byDecade.has(decade)) byDecade.set(decade, []);
    byDecade.get(decade).push(year);
  }

  return `<section class="section section--dark section--tight">
      <div class="shell">
        <span class="eyebrow eyebrow--dark">Línea de tiempo</span>
        <h1 style="font-size:clamp(2.2rem,6vw,3.8rem);margin:14px 0 18px;color:var(--on-dark)">La historia, año por año</h1>
        <p class="lede" style="color:var(--on-dark-2)">Desde ${stats.firstYear} hasta ${stats.lastYear}.
          Cada barrita es un partido: verde ganado, dorado empatado, rojo perdido.</p>
        <div class="hero__counts">
          ${statHTML({ value: stats.seasons, label: 'Temporadas' })}
          ${statHTML({ value: stats.total, label: 'Partidos' })}
          ${statHTML({ value: `${stats.firstYear}–${stats.lastYear}`, label: 'Período', size: 'clamp(1.3rem,2.6vw,1.9rem)' })}
        </div>
      </div>
    </section>

    <div class="shell" style="padding-block:clamp(24px,4vw,44px) clamp(50px,8vw,100px)">
      ${[...byDecade.entries()].map(([decade, list]) => decadeHTML(decade, list)).join('')}
    </div>`;
}

