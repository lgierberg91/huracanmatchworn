/**
 * Portada: la puerta de entrada al archivo.
 * Todo lo que se muestra sale de los datos reales; nada es decorativo.
 */

import { esc } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { dateLong, dateMedium, num, plural, yearsAgo, venueLong, decadeLabel } from '../lib/format.js';
import {
  globalStats, featured, pieceOfTheDay, onThisDay, latestPlayed, nextFixtures, facetCounts,
} from '../data/store.js';
import { crestHTML } from '../components/crest.js';
import { jerseyHTML } from '../components/jersey.js';
import { scorelineHTML } from '../components/scoreline.js';
import { matchCardHTML, matchHref } from '../components/matchCard.js';
import { sectionHead, statHTML } from '../components/ui.js';
import { photoUrl } from '../data/api.js';
import { clubShort } from '../data/clubs.js';
import { dressUpHTML, mountDressUp } from '../components/dressup.js';

function heroPieceHTML(match) {
  if (!match) return '';
  const stage = match.kitPhoto
    ? `<img class="piece-photo" src="${esc(photoUrl(match.kitPhoto))}" alt="Camiseta ante ${esc(match.club.name)}">`
    : crestHTML(match.club, 'hero', { onDark: true, eager: true });

  return `<a class="hero__piece" href="${matchHref(match)}">
      <div class="hero__piece-label">
        <span class="eyebrow eyebrow--dark">Pieza del día</span>
        ${match.highlightReason ? `<span class="chip chip--onDark">${esc(match.highlightReason)}</span>` : ''}
      </div>
      <div class="hero__piece-stage">${stage}</div>
      <div class="hero__piece-row">
        ${scorelineHTML(match, { size: 'md', crest: 'sm', onDark: true })}
      </div>
      <div class="hero__piece-meta mono">
        <span><strong>${esc(dateLong(match.date))}</strong></span>
        <span>${esc(match.competition)}${match.roundLabel ? ` · ${esc(match.roundLabel)}` : ''}</span>
        <span>${esc(venueLong(match.venue))}</span>
      </div>
    </a>`;
}

function heroHTML(stats, piece) {
  return `<section class="hero">
      <div class="shell hero__grid">
        <div>
          <span class="eyebrow eyebrow--dark">Archivo digital · desde ${stats.firstYear}</span>
          <h1 class="hero__title">La historia de Huracán, <em>camiseta por camiseta</em>.</h1>
          <p class="hero__lede">Cada partido del Globo desde ${stats.firstYear}: el rival, el resultado, la competencia
            y — cuando aparece — la camiseta que se usó esa tarde. Un archivo abierto, hecho entre hinchas.</p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="#/coleccion">${icon('grid')} Explorar la colección</a>
            <a class="btn btn--onDark" href="#/historia">${icon('clock')} Recorrer la historia</a>
          </div>
          <div class="hero__counts">
            ${statHTML({ value: stats.total, label: 'Partidos' })}
            ${statHTML({ value: stats.seasons, label: 'Temporadas' })}
            ${statHTML({ value: stats.rivals, label: 'Rivales' })}
            ${statHTML({ value: stats.withKit, label: 'Camisetas', note: stats.withKit ? '' : 'todavía ninguna' })}
          </div>
        </div>
        ${heroPieceHTML(piece)}
      </div>
    </section>`;
}

function ribbonHTML() {
  const next = nextFixtures(1)[0];
  if (!next) return '';
  return `<div class="ribbon">
      <div class="shell ribbon__inner">
        <span>Próximo partido</span>
        <strong>${esc(dateMedium(next.date))} · ${next.venue === 'A' ? 'vs' : 'vs'} ${esc(clubShort(next.club))}</strong>
        <span>${esc(next.family.short)}</span>
      </div>
    </div>`;
}

function onThisDayHTML() {
  const list = onThisDay();
  if (!list.length) return '';
  const top = list.slice(0, 5);
  return `<section class="section section--tight">
      <div class="shell">
        ${sectionHead({
          eyebrow: 'Efemérides',
          title: 'Un día como hoy',
        })}
        <div class="onthisday__list">
          ${top
            .map((match) => {
              const years = yearsAgo(match.date);
              return `<a class="match-row reveal" href="${matchHref(match)}">
                  <span class="match-row__date mono">${years > 0 ? `hace ${years}` : 'este año'}</span>
                  ${crestHTML(match.club, 'sm')}
                  <span class="match-row__main">
                    <span class="match-row__rival">${esc(match.club.name)}</span>
                    <span class="match-row__sub">${esc(dateLong(match.date))} · ${esc(match.family.short)}</span>
                  </span>
                  <span class="match-row__score">
                    <b class="mono">${match.gf}–${match.ga}</b>
                  </span>
                </a>`;
            })
            .join('')}
        </div>
        ${list.length > top.length
          ? `<p class="stat__note" style="margin-top:14px">${plural(list.length, 'partido', 'partidos')} un ${new Date().getDate()} de este mes a lo largo del archivo.</p>`
          : ''}
      </div>
    </section>`;
}

function featuredHTML() {
  const pieces = featured(8);
  if (!pieces.length) return '';
  return `<section class="section section--paper2">
      <div class="shell">
        ${sectionHead({
          eyebrow: 'Selección',
          title: 'Piezas destacadas',
          link: { href: '#/coleccion?orden=highlight', text: 'Ver todas' },
        })}
        <div class="piece-rail">
          ${pieces.map((m) => matchCardHTML(m, { starred: true })).join('')}
        </div>
      </div>
    </section>`;
}

function numbersHTML(stats) {
  return `<section class="section section--dark">
      <div class="shell">
        ${sectionHead({
          eyebrow: 'El archivo en números',
          title: 'Medio siglo de Globo',
          link: { href: '#/estadisticas', text: 'Todas las estadísticas' },
          onDark: true,
        })}
        <div class="stat-grid reveal">
          ${statHTML({ value: stats.w, label: 'Ganados', color: 'var(--win)' })}
          ${statHTML({ value: stats.d, label: 'Empatados', color: 'var(--draw)' })}
          ${statHTML({ value: stats.l, label: 'Perdidos', color: 'var(--loss)' })}
          ${statHTML({ value: stats.gf, label: 'Goles a favor' })}
          ${statHTML({ value: `${Math.round(stats.winRate * 100)}%`, label: 'Efectividad' })}
        </div>
        ${stats.topRival
          ? `<p class="lede" style="color:var(--on-dark-2);margin-top:34px">
              El rival más repetido del archivo es <strong style="color:var(--on-dark)">${esc(stats.topRival.club.name)}</strong>,
              con ${plural(stats.topRival.matches.length, 'partido', 'partidos')}.
              ${stats.biggestWin
                ? `La goleada más grande sigue siendo el ${esc(dateMedium(stats.biggestWin.date))} ante ${esc(stats.biggestWin.club.name)}: ${stats.biggestWin.gf}–${stats.biggestWin.ga}.`
                : ''}
            </p>`
          : ''}
      </div>
    </section>`;
}

function decadesHTML() {
  const { decades } = facetCounts();
  return `<section class="section">
      <div class="shell">
        ${sectionHead({
          eyebrow: 'Atajos',
          title: 'Entrar por década',
          link: { href: '#/historia', text: 'Línea de tiempo completa' },
        })}
        <div class="chip-row reveal">
          ${decades
            .map(
              ([decade, count]) =>
                `<a class="chip" href="#/coleccion?decadas=${decade}">${esc(decadeLabel(decade))}
                  <span class="chip__count">${num(count)}</span></a>`
            )
            .join('')}
        </div>
      </div>
    </section>`;
}

function latestHTML() {
  const list = latestPlayed(4);
  if (!list.length) return '';
  return `<section class="section section--tight">
      <div class="shell">
        ${sectionHead({ eyebrow: 'Lo último', title: 'Partidos recientes' })}
        <div class="piece-grid">${list.map((m) => matchCardHTML(m)).join('')}</div>
      </div>
    </section>`;
}

function contributeHTML(stats) {
  const missing = stats.total - stats.withKit;
  return `<section class="section section--paper2">
      <div class="shell">
        <div class="panel reveal" style="display:grid;gap:22px;grid-template-columns:auto minmax(0,1fr);align-items:center">
          <div style="color:var(--ink-3)">${jerseyHTML({ size: 92, label: '' })}</div>
          <div>
            <span class="eyebrow">El archivo se completa entre todos</span>
            <h3 style="margin:10px 0 12px">Faltan ${num(missing)} camisetas</h3>
            <p class="lede">Tenemos los ${num(stats.total)} partidos, pero casi ninguna camiseta identificada.
              Si sabés cuál se usó, tenés una foto o te acordás de algo de ese partido, se puede cargar
              desde la ficha — sin cuenta ni registro.</p>
            <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap">
              <a class="btn btn--primary" href="#/coleccion?sincamiseta=1&orden=highlight">${icon('camera')} Empezar a aportar</a>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

export function renderHome() {
  const stats = globalStats();
  const piece = pieceOfTheDay();

  return `${heroHTML(stats, piece)}
    ${dressUpHTML()}
    ${ribbonHTML()}
    ${onThisDayHTML()}
    ${featuredHTML()}
    ${numbersHTML(stats)}
    ${decadesHTML()}
    ${latestHTML()}
    ${contributeHTML(stats)}`;
}

export function mountHome() {
  mountDressUp();
}

