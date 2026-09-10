/**
 * "Vestidor": vive dentro del hero, en el lugar de la vieja "pieza del día".
 * Una figurita (cara + camiseta) que se arma combinando un jugador histórico
 * con una camiseta del archivo. Los chevrones van al costado de cada elemento
 * (no abajo, sin texto) y navegan de a uno.
 */

import { qs, on } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { PLAYERS, JERSEYS } from '../data/dressup.js';
import { cutoutBackground } from '../lib/cutout.js';

function arrowHTML(role, dir, label) {
  return `<button type="button" class="dressup__arrow" data-role="${role}" data-dir="${dir}" aria-label="${label}">${icon(dir < 0 ? 'arrowLeft' : 'arrowRight')}</button>`;
}

export function dressUpHTML() {
  return `<div class="hero__piece dressup" id="dressup">
      <div class="figurita">
        <div class="figurita__row figurita__row--player">
          ${arrowHTML('player', -1, 'Jugador anterior')}
          <div class="figurita__photo"><img id="dressup-face" alt=""></div>
          ${arrowHTML('player', 1, 'Jugador siguiente')}
        </div>
        <div class="figurita__row figurita__row--jersey">
          ${arrowHTML('jersey', -1, 'Camiseta anterior')}
          <div class="figurita__jersey"><img id="dressup-jersey" alt=""></div>
          ${arrowHTML('jersey', 1, 'Camiseta siguiente')}
        </div>
      </div>
    </div>`;
}

export function mountDressUp() {
  const root = qs('#dressup');
  if (!root) return;

  const faceImg = qs('#dressup-face', root);
  const jerseyImg = qs('#dressup-jersey', root);

  let playerIndex = 0;
  let jerseyIndex = 0;

  const renderPlayer = () => {
    const player = PLAYERS[playerIndex];
    faceImg.src = player.src;
    faceImg.alt = player.name;
  };

  const renderJersey = async () => {
    const jersey = JERSEYS[jerseyIndex];
    root.classList.add('is-loading');
    try {
      jerseyImg.src = await cutoutBackground(jersey.src, { tolerance: jersey.tolerance });
    } catch {
      jerseyImg.src = jersey.src;
    } finally {
      root.classList.remove('is-loading');
    }
    jerseyImg.alt = `Camiseta ${jersey.label}`;
  };

  renderPlayer();
  renderJersey();

  on(root, 'click', '.dressup__arrow', (event, btn) => {
    const dir = Number(btn.dataset.dir);
    if (btn.dataset.role === 'player') {
      playerIndex = (playerIndex + dir + PLAYERS.length) % PLAYERS.length;
      renderPlayer();
    } else {
      jerseyIndex = (jerseyIndex + dir + JERSEYS.length) % JERSEYS.length;
      renderJersey();
    }
  });
}
