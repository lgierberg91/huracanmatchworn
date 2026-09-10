/**
 * Estadísticas: todo se calcula sobre los datos cargados, nada está escrito a mano.
 */

import { esc } from '../lib/dom.js';
import { num, plural, dateMedium, decadeLabel } from '../lib/format.js';
import { globalStats, state, record, matchesOfYear, allYears } from '../data/store.js';
import { crestHTML } from '../components/crest.js';
import { sectionHead, statHTML, splitBarHTML, barListHTML, factHTML } from '../components/ui.js';
import { matchHref } from '../components/matchCard.js';
import { FAMILIES } from '../data/competitions.js';

function rivalsPanel(stats) {
  const items = stats.ranking.slice(0, 12).map((entry) => ({
    label: entry.club.name,
    value: entry.matches.length,
    href: `#/rival/${entry.club.id}`,
    prefix: crestHTML(entry.club, 'xs'),
  }));
  return `<div class="panel reveal">
      <div class="panel__title">Rivales más enfrentados</div>
      ${barListHTML(items)}
    </div>`;
}

function competitionsPanel(stats) {
  const items = FAMILIES.filter((f) => stats.familyCounts.get(f.id))
    .map((f) => ({ label: f.label, value: stats.familyCounts.get(f.id), href: `#/coleccion?torneos=${f.id}` }))
    .sort((a, b) => b.value - a.value);
  return `<div class="panel reveal">
      <div class="panel__title">Partidos por competencia</div>
      ${barListHTML(items, { color: 'var(--ink)' })}
    </div>`;
}

function decadesPanel() {
  const byDecade = new Map();
  for (const match of state.matches) {
    byDecade.set(match.decade, (byDecade.get(match.decade) || 0) + 1);
  }
  const items = [...byDecade.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([decade, count]) => ({
      label: decadeLabel(decade),
      value: count,
      href: `#/coleccion?decadas=${decade}`,
    }));
  return `<div class="panel reveal">
      <div class="panel__title">Partidos por década</div>
      ${barListHTML(items, { color: 'var(--gold)' })}
    </div>`;
}

function goalsByYearPanel() {
  const years = allYears();
  const rows = years.map((year) => {
    const balance = record(matchesOfYear(year));
    return { year, ...balance };
  });
  const max = Math.max(1, ...rows.map((r) => r.gf));
  return `<div class="panel reveal">
      <div class="panel__title">Goles a favor por temporada</div>
      <div style="display:flex;align-items:flex-end;gap:2px;height:120px;margin-top:6px">
        ${rows
          .map(
            (r) => `<a href="#/temporada/${r.year}" title="${r.year}: ${r.gf} goles en ${r.total} partidos"
              style="flex:1 1 0;min-width:3px;height:${Math.max(3, (r.gf / max) * 100)}%;background:var(--red);opacity:.78;border-radius:2px 2px 0 0"></a>`
          )
          .join('')}
      </div>
      <div class="split-legend mono" style="margin-top:10px;justify-content:space-between">
        <span>${rows[0]?.year || ''}</span><span>${rows[rows.length - 1]?.year || ''}</span>
      </div>
    </div>`;
}

function recordsSection(stats) {
  const cards = [];

  if (stats.topRival) {
    cards.push(
      factHTML({
        label: 'Rival más enfrentado',
        value: stats.topRival.club.name,
        media: crestHTML(stats.topRival.club, 'md'),
        note: `${plural(stats.topRival.matches.length, 'partido', 'partidos')} · ${stats.topRival.w}–${stats.topRival.d}–${stats.topRival.l} · <a href="#/rival/${esc(stats.topRival.club.id)}">ver historial</a>`,
      })
    );
  }

  if (stats.biggestWin) {
    const m = stats.biggestWin;
    cards.push(
      factHTML({
        label: 'Goleada más grande',
        value: `${m.gf}–${m.ga}`,
        media: crestHTML(m.club, 'md'),
        note: `ante <b>${esc(m.club.name)}</b>, el ${esc(dateMedium(m.date))} · <a href="${matchHref(m)}">ver ficha</a>`,
      })
    );
  }

  if (stats.bestYear) {
    cards.push(
      factHTML({
        label: 'Mejor temporada',
        value: String(stats.bestYear.year),
        note: `${stats.bestYear.w} triunfos en ${stats.bestYear.played} partidos (${Math.round((stats.bestYear.w / stats.bestYear.played) * 100)}%) · <a href="#/temporada/${stats.bestYear.year}">ver temporada</a>`,
      })
    );
  }

  if (stats.topDecade) {
    cards.push(
      factHTML({
        label: 'Década con más partidos',
        value: decadeLabel(stats.topDecade.decade),
        note: `${plural(stats.topDecade.count, 'partido', 'partidos')} registrados`,
      })
    );
  }

  if (stats.clasico) {
    cards.push(
      factHTML({
        label: 'El clásico',
        value: `${stats.clasico.w}–${stats.clasico.d}–${stats.clasico.l}`,
        media: crestHTML(stats.clasico.club, 'md'),
        note: `${plural(stats.clasico.matches.length, 'partido', 'partidos')} ante <b>${esc(stats.clasico.club.name)}</b> · <a href="#/rival/${esc(stats.clasico.club.id)}">ver historial</a>`,
      })
    );
  }

  cards.push(
    factHTML({
      label: 'Dónde se jugó',
      value: `${Math.round((stats.home / stats.total) * 100)}% de local`,
      note: `${num(stats.home)} de local · ${num(stats.away)} de visitante · ${num(stats.neutral)} en cancha neutral`,
    })
  );

  return `<section class="section">
      <div class="shell">
        ${sectionHead({ eyebrow: 'Records y curiosidades', title: '¿Sabías que…?' })}
        <div class="stats-grid">${cards.join('')}</div>
      </div>
    </section>`;
}

function archiveStatePanel(stats) {
  const rows = [
    ['Camisetas identificadas', stats.withKit],
    ['Con foto de la camiseta', stats.withPhoto],
    ['Con historia del partido', stats.withStory],
    ['Con video', stats.withVideo],
  ];
  return `<section class="section section--paper2">
      <div class="shell">
        ${sectionHead({
          eyebrow: 'Estado del archivo',
          title: 'Qué falta cargar',
          link: { href: '#/acerca', text: 'Cómo colaborar' },
        })}
        <div class="panel reveal">
          ${rows
            .map(([label, value]) => {
              const pct = ((value / stats.total) * 100).toFixed(1);
              return `<div class="bar-item" style="margin-bottom:14px">
                  <div class="bar-item__head"><span>${esc(label)}</span><b>${num(value)} / ${num(stats.total)}</b></div>
                  <div class="bar-item__track"><span class="bar-item__fill" style="width:${Math.max(0.6, pct)}%"></span></div>
                </div>`;
            })
            .join('')}
          <p class="stat__note" style="margin-top:6px">Los ${num(stats.total)} partidos ya están cargados con fecha,
            rival, competencia y resultado. Lo que falta es la parte que sólo puede aportar la gente: las camisetas.</p>
        </div>
      </div>
    </section>`;
}

export function renderEstadisticas() {
  const stats = globalStats();

  return `<section class="stats-hero">
      <div class="shell">
        <span class="eyebrow eyebrow--dark">Los números del archivo</span>
        <h1 style="font-size:clamp(2.2rem,6vw,3.8rem);margin:14px 0 26px;color:var(--on-dark)">Estadísticas</h1>
        <div class="stat-grid">
          ${statHTML({ value: stats.total, label: 'Partidos' })}
          ${statHTML({ value: stats.seasons, label: 'Temporadas' })}
          ${statHTML({ value: stats.rivals, label: 'Rivales' })}
          ${statHTML({ value: stats.competitions, label: 'Competencias' })}
          ${statHTML({ value: stats.gf, label: 'Goles a favor' })}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="shell">
        <div class="panel reveal" style="margin-bottom:clamp(18px,2.4vw,26px)">
          <div class="panel__title">Balance histórico · ${num(stats.played)} partidos jugados</div>
          ${splitBarHTML(stats)}
          <p class="stat__note" style="margin-top:14px">
            ${Math.round(stats.winRate * 100)}% de efectividad · ${num(stats.gf)} goles a favor y ${num(stats.ga)} en contra
            (${stats.gf - stats.ga >= 0 ? '+' : ''}${num(stats.gf - stats.ga)} de diferencia).
          </p>
        </div>
        <div class="stats-grid">
          ${rivalsPanel(stats)}
          ${competitionsPanel(stats)}
          ${decadesPanel()}
          ${goalsByYearPanel()}
        </div>
      </div>
    </section>

    ${recordsSection(stats)}
    ${archiveStatePanel(stats)}`;
}

