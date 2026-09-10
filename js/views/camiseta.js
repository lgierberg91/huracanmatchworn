/**
 * Ficha de una camiseta de temporada.
 *
 * Muestra la prenda grande y, debajo, los partidos de ese año — que es desde
 * donde se carga a mano qué camiseta se usó en cada uno. El detalle por partido
 * vive en `match_kits`; esta ficha es el nivel de temporada.
 */

import { esc, qs, on } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { plural } from '../lib/format.js';
import { matchesOfYear, record } from '../data/store.js';
import { seasonKitById, kitsForYear, ROLE_LABEL } from '../data/seasonKits.js';
import { brandForYear } from '../data/brands.js';
import { matchRowHTML, emptyStateHTML } from '../components/matchCard.js';
import { sectionHead, splitBarHTML } from '../components/ui.js';

export function renderCamiseta(ctx) {
  const kit = seasonKitById(ctx.params.get('id'));

  if (!kit) {
    return `<div class="shell section">
        <a class="backlink" href="#/camisetas">${icon('arrowLeft')} Las camisetas</a>
        <div style="margin-top:20px">
          ${emptyStateHTML({
            title: 'No encontramos esa camiseta',
            text: 'Puede que el enlace esté viejo o que la foto todavía no esté registrada.',
          })}
        </div>
      </div>`;
  }

  const matches = matchesOfYear(kit.year);
  const balance = record(matches);
  const brand = brandForYear(kit.year);
  const siblings = kitsForYear(kit.year).filter((k) => k.id !== kit.id);

  return `<section class="skit-hero">
      <div class="shell">
        <a class="backlink backlink--onDark" href="#/camisetas">${icon('arrowLeft')} Las camisetas</a>
        <div class="skit-hero__inner">
          <figure class="skit-hero__stage" id="kit-stage">
            <img src="${esc(kit.src)}" alt="Camiseta de Huracán ${esc(kit.label)}">
          </figure>
          <div class="skit-hero__text">
            <span class="eyebrow eyebrow--dark">Temporada ${kit.year}</span>
            <h1>${esc(kit.label)}</h1>
            <div class="chip-row" style="margin-top:22px">
              <span class="chip chip--onDark">${esc(ROLE_LABEL[kit.role] || ROLE_LABEL.null)}</span>
              ${brand ? `<span class="chip chip--onDark">${esc(brand)}</span>` : ''}
              ${kit.variant ? `<span class="chip chip--onDark">Variante ${esc(kit.variant)}</span>` : ''}
            </div>
            ${kit.note ? `<p class="lede" style="color:var(--on-dark-2);margin-top:18px">${esc(kit.note)}</p>` : ''}
            ${!kit.role
              ? `<p class="stat__note" style="color:var(--on-dark-3);margin-top:18px">
                  Todavía no sabemos si es de jugador o de arquero. Se anota en
                  <code>ROLES</code>, dentro de <code>js/data/seasonKits.js</code>.
                </p>`
              : ''}
          </div>
        </div>
      </div>
    </section>

    <div class="shell section">
      ${siblings.length
        ? `<section class="reveal" style="margin-bottom:clamp(30px,4vw,48px)">
            ${sectionHead({ eyebrow: `Temporada ${kit.year}`, title: 'Otras camisetas del mismo año' })}
            <div class="skit-row">
              ${siblings
                .map(
                  (s) => `<a class="skit" href="#/camiseta/${encodeURIComponent(s.id)}">
                    <div class="skit__stage"><img src="${esc(s.src)}" alt="${esc(s.label)}" loading="lazy"></div>
                    <div class="skit__body">
                      <strong class="skit__label">${esc(s.label)}</strong>
                      <span class="skit__role mono">${esc(ROLE_LABEL[s.role] || ROLE_LABEL.null)}</span>
                    </div>
                  </a>`
                )
                .join('')}
            </div>
          </section>`
        : ''}

      <section class="reveal">
        ${sectionHead({
          eyebrow: 'En qué partidos se usó',
          title: `Los ${plural(matches.length, 'partido', 'partidos')} de ${kit.year}`,
        })}
        <p class="stat__note" style="margin-bottom:18px">
          La camiseta de cada partido se carga desde la ficha del partido. Entrá al que
          quieras completar y cargá el frente y el dorso.
        </p>
        ${balance.played ? `<div class="panel" style="margin-bottom:18px">${splitBarHTML(balance)}</div>` : ''}
        <div>${matches.slice().reverse().map((m) => matchRowHTML(m)).join('')}</div>
      </section>
    </div>`;
}

export function mountCamiseta() {
  /* Al tocar la foto, se abre a pantalla completa. */
  const stage = qs('#kit-stage');
  if (!stage) return;
  on(stage, 'click', 'img', (event, img) => {
    stage.classList.toggle('is-zoom');
    img.style.cursor = stage.classList.contains('is-zoom') ? 'zoom-out' : 'zoom-in';
  });
}
