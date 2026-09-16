/**
 * Portada: la puerta de entrada al archivo.
 * Todo lo que se muestra sale de los datos reales; nada es decorativo.
 */

import { esc } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { dateLong, plural, yearsAgo, decadeLabel } from '../lib/format.js';
import {
  globalStats, featured, onThisDay, latestPlayed, facetCounts,
} from '../data/store.js';
import { kitCount, kitsForSeason, seasonsWithKits } from '../data/seasonKits.js';
import { seasonStart } from '../data/seasons.js';
import { crestHTML } from '../components/crest.js';
import { HURACAN } from '../data/clubs.js';
import { dressUpCompactHTML, mountDressUpCompact } from '../components/dressup.js';
import { matchCardHTML, matchHref } from '../components/matchCard.js';
import { sectionHead, statHTML } from '../components/ui.js';

/** La camiseta más representativa de la década, para la card del carrusel. */
function decadeKit(decade) {
  const season = seasonsWithKits().find((s) => Math.floor(seasonStart(s) / 10) * 10 === decade);
  if (!season) return null;
  const kits = kitsForSeason(season);
  return kits.find((k) => k.kind === 'titular') || kits[0] || null;
}

function heroHTML(stats) {
  return `<section class="hero">
      <div class="shell hero__grid">
        <div>
          <span class="eyebrow">Archivo digital · desde ${stats.firstYear}</span>
          <h1 class="hero__title">La historia de Huracán, <em>camiseta por camiseta</em>.</h1>
          <p class="hero__lede">Cada partido del Globo desde ${stats.firstYear}: el rival, el resultado, la competencia
            y — cuando aparece — la camiseta que se usó esa tarde. Un archivo abierto, hecho entre hinchas.</p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="#/camisetas">${icon('clock')} Recorrer la historia</a>
          </div>
          <div class="hero__counts">
            ${statHTML({ value: stats.total, label: 'Partidos' })}
            ${statHTML({ value: stats.seasons, label: 'Temporadas' })}
            ${statHTML({ value: stats.rivals, label: 'Rivales' })}
            ${statHTML({ value: kitCount(), label: 'Camisetas en el archivo' })}
          </div>
        </div>
        ${dressUpCompactHTML()}
      </div>
    </section>`;
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

function decadesHTML() {
  const { decades } = facetCounts();
  return `<section class="section">
      <div class="shell">
        ${sectionHead({
          eyebrow: 'Atajos',
          title: 'Entrar por década',
          link: { href: '#/historia', text: 'Línea de tiempo completa' },
        })}
        <div class="piece-rail piece-rail--decades reveal">
          ${decades
            .map(([decade, count]) => {
              const kit = decadeKit(decade);
              const media = kit
                ? `<img src="${esc(kit.src)}" alt="" loading="lazy" decoding="async">`
                : crestHTML(HURACAN, 'xl');
              return `<a class="decade-card${kit ? '' : ' decade-card--crest'}" href="#/coleccion?decadas=${decade}">
                  ${media}
                  <span class="decade-card__label">
                    <b>${esc(decadeLabel(decade))}</b>
                    <span>${esc(plural(count, 'partido', 'partidos'))}</span>
                  </span>
                </a>`;
            })
            .join('')}
        </div>
      </div>
    </section>`;
}

function latestHTML() {
  const list = latestPlayed(8);
  if (!list.length) return '';
  return `<section class="section section--tight">
      <div class="shell">
        ${sectionHead({ eyebrow: 'Lo último', title: 'Partidos recientes' })}
        <div class="piece-rail">${list.map((m) => matchCardHTML(m)).join('')}</div>
      </div>
    </section>`;
}

export function renderHome() {
  const stats = globalStats();

  return `${heroHTML(stats)}
    ${decadesHTML()}
    ${latestHTML()}
    ${featuredHTML()}
    ${onThisDayHTML()}`;
}

export function mountHome() {
  return mountDressUpCompact();
}

