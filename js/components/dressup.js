/**
 * "Vestidor": vive dentro del hero, en el lugar de la vieja "pieza del día".
 * Una figurita (cara + camiseta) que se arma combinando un jugador histórico
 * con una camiseta del archivo, navegando de a uno con flechas — sin grilla
 * de miniaturas.
 */

import { qs, on } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { PLAYERS, JERSEYS } from '../data/dressup.js';
import { cutoutBackground } from '../lib/cutout.js';

function controlHTML(role, valueId) {
  return `<div class="dressup__control">
      <button type="button" class="dressup__arrow" data-role="${role}" data-dir="-1" aria-label="Anterior">${icon('arrowLeft')}</button>
      <span class="dressup__value" id="${valueId}"></span>
      <button type="button" class="dressup__arrow" data-role="${role}" data-dir="1" aria-label="Siguiente">${icon('arrowRight')}</button>
    </div>`;
}

export function dressUpHTML() {
  return `<div class="hero__piece dressup" id="dressup">
      <div class="hero__piece-label">
        <span class="eyebrow eyebrow--dark">Armá tu jugador</span>
      </div>
      <div class="figurita">
        <div class="figurita__photo"><img id="dressup-face" alt=""></div>
        <div class="figurita__jersey"><img id="dressup-jersey" alt=""></div>
      </div>
      <div class="dressup__controls">
        ${controlHTML('player', 'dressup-name')}
        ${controlHTML('jersey', 'dressup-kit')}
      </div>
    </div>`;
}

export function mountDressUp() {
  const root = qs('#dressup');
  if (!root) return;

  const faceImg = qs('#dressup-face', root);
  const jerseyImg = qs('#dressup-jersey', root);
  const nameEl = qs('#dressup-name', root);
  const kitEl = qs('#dressup-kit', root);

  let playerIndex = 0;
  let jerseyIndex = 0;

  const renderPlayer = async () => {
    const player = PLAYERS[playerIndex];
    nameEl.textContent = player.name;
    root.classList.add('is-loading');
    try {
      faceImg.src = await cutoutBackground(player.src, { tolerance: player.tolerance, protect: 0.46 });
    } catch {
      faceImg.src = player.src;
    } finally {
      root.classList.remove('is-loading');
    }
    faceImg.alt = player.name;
  };

  const renderJersey = async () => {
    const jersey = JERSEYS[jerseyIndex];
    kitEl.textContent = jersey.label;
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
