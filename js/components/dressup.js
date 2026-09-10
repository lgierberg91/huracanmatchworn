/**
 * "Vestidor": armá una figurita combinando un jugador histórico con una
 * camiseta del archivo. Foto del jugador en un marco circular (no depende de
 * un fondo parejo) + camiseta con el fondo recortado en vivo (cutout.js).
 */

import { esc, qs, on } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { PLAYERS, JERSEYS } from '../data/dressup.js';
import { cutoutBackground } from '../lib/cutout.js';

function thumbHTML({ id, kind, src, label }) {
  return `<button type="button" class="dressup__thumb dressup__thumb--${kind}" data-${kind}="${esc(id)}" title="${esc(label)}">
      <img src="${esc(src)}" alt="${esc(label)}" loading="lazy" decoding="async">
    </button>`;
}

export function dressUpHTML() {
  const player = PLAYERS[0];
  const jersey = JERSEYS[0];

  return `<section class="dressup reveal" id="dressup">
      <div class="shell dressup__grid">
        <div class="dressup__stage">
          <div class="figurita">
            <div class="figurita__photo"><img id="dressup-face" src="${esc(player.src)}" alt="${esc(player.name)}"></div>
            <div class="figurita__jersey"><img id="dressup-jersey" src="${esc(jersey.src)}" alt="Camiseta ${esc(jersey.label)}"></div>
            <div class="figurita__plate">
              <strong id="dressup-name">${esc(player.name)}</strong>
              <span id="dressup-kit" class="mono">Camiseta ${esc(jersey.label)}</span>
            </div>
          </div>
        </div>

        <div class="dressup__controls">
          <span class="eyebrow">Armá tu jugador</span>
          <h2 class="dressup__title">Probá una camiseta de Huracán</h2>
          <p class="lede">Elegí un jugador histórico y una camiseta del archivo para ver cómo le queda.</p>

          <div class="dressup__picker">
            <span class="dressup__picker-label">${icon('user')} Jugador</span>
            <div class="dressup__row" id="dressup-players">
              ${PLAYERS.map((p) => thumbHTML({ id: p.id, kind: 'player', src: p.src, label: p.name })).join('')}
            </div>
          </div>

          <div class="dressup__picker">
            <span class="dressup__picker-label">${icon('shirt')} Camiseta</span>
            <div class="dressup__row" id="dressup-jerseys">
              ${JERSEYS.map((j) => thumbHTML({ id: j.id, kind: 'jersey', src: j.src, label: j.label })).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

export function mountDressUp() {
  const root = qs('#dressup');
  if (!root) return;

  const faceImg = qs('#dressup-face', root);
  const jerseyImg = qs('#dressup-jersey', root);
  const nameEl = qs('#dressup-name', root);
  const kitEl = qs('#dressup-kit', root);
  const stage = qs('.figurita', root);

  const setActive = (rowSel, id) => {
    qs(rowSel, root)
      .querySelectorAll('.dressup__thumb')
      .forEach((btn) => btn.classList.toggle('is-active', btn.dataset.player === id || btn.dataset.jersey === id));
  };

  const selectPlayer = (player) => {
    faceImg.src = player.src;
    faceImg.alt = player.name;
    nameEl.textContent = player.name;
    setActive('#dressup-players', player.id);
  };

  const selectJersey = async (jersey) => {
    setActive('#dressup-jerseys', jersey.id);
    kitEl.textContent = `Camiseta ${jersey.label}`;
    stage.classList.add('is-loading');
    try {
      const cutout = await cutoutBackground(jersey.src);
      jerseyImg.src = cutout;
    } catch {
      jerseyImg.src = jersey.src;
    } finally {
      stage.classList.remove('is-loading');
    }
  };

  selectPlayer(PLAYERS[0]);
  selectJersey(JERSEYS[0]);

  on(root, 'click', '[data-player]', (event, btn) => {
    const player = PLAYERS.find((p) => p.id === btn.dataset.player);
    if (player) selectPlayer(player);
  });

  on(root, 'click', '[data-jersey]', (event, btn) => {
    const jersey = JERSEYS.find((j) => j.id === btn.dataset.jersey);
    if (jersey) selectJersey(jersey);
  });
}
