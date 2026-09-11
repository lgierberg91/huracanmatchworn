/**
 * "Vestidor": el corazón del Kit Creator (js/views/kitCreator.js). Estuvo metido
 * en el hero de la home; ahora tiene sección propia, que es donde se puede
 * disfrutar sin competirle el lugar al archivo.
 *
 * Muestra una foto pre-generada con IA (jugador histórico + camiseta de una
 * temporada) elegida por el visitante mediante chips. Al cambiar de jugador
 * o temporada se simula una breve instancia de "generación" (con leyenda)
 * antes de revelar la imagen, que ya está pre-generada y sólo se precarga.
 */

import { esc, qs, qsa, on } from '../lib/dom.js';
import { HERO_PLAYERS } from '../data/dressup.js';

const LEGENDS = [
  'Creando imagen con IA…',
  'Probándole la camiseta…',
  'Afinando los últimos detalles…',
];

export function dressUpHTML() {
  const player = HERO_PLAYERS[0];
  const showPlayerPicker = HERO_PLAYERS.length > 1;

  return `<div class="dressup" id="dressup">
      <div class="dressup__stage">
        <img class="dressup__photo" id="dressup-photo" alt="">
        <div class="dressup__overlay" id="dressup-overlay" hidden>
          <span class="spinner" aria-hidden="true"></span>
          <p class="dressup__legend" id="dressup-legend"></p>
        </div>
      </div>
      <div class="dressup__controls">
        ${showPlayerPicker
          ? `<div class="dressup__group">
              <p class="dressup__label" id="dressup-players-label">Jugador</p>
              <div class="chip-row" id="dressup-players" role="group" aria-labelledby="dressup-players-label">
                ${HERO_PLAYERS.map((p, i) => `<button type="button" class="chip${i === 0 ? ' is-on' : ''}" data-id="${p.id}">${esc(p.name)}</button>`).join('')}
              </div>
            </div>`
          : `<p class="dressup__player-name">${esc(player.name)}</p>`}
        <div class="dressup__group">
          <p class="dressup__label" id="dressup-seasons-label">Camiseta</p>
          <div class="chip-row" id="dressup-seasons" role="group" aria-labelledby="dressup-seasons-label"></div>
        </div>
      </div>
    </div>`;
}

export function mountDressUp() {
  const root = qs('#dressup');
  if (!root) return;

  const photo = qs('#dressup-photo', root);
  const overlay = qs('#dressup-overlay', root);
  const legend = qs('#dressup-legend', root);
  const seasonRow = qs('#dressup-seasons', root);
  const playerRow = qs('#dressup-players', root);

  let player = HERO_PLAYERS[0];
  let seasonIndex = 0;
  let legendTimer = null;
  let requestToken = 0;

  const preload = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    });

  const paintSeasons = () => {
    seasonRow.innerHTML = player.seasons
      .map((s, i) => `<button type="button" class="chip${i === seasonIndex ? ' is-on' : ''}" data-i="${i}">${s.year}</button>`)
      .join('');
  };

  const showSeason = async () => {
    const token = ++requestToken;
    const season = player.seasons[seasonIndex];

    clearInterval(legendTimer);
    let i = 0;
    legend.textContent = LEGENDS[0];
    legendTimer = setInterval(() => {
      i = (i + 1) % LEGENDS.length;
      legend.textContent = LEGENDS[i];
    }, 900);
    overlay.hidden = false;
    root.classList.add('is-loading');

    const delay = 2000 + Math.random() * 3000;
    await Promise.all([preload(season.src), new Promise((resolve) => setTimeout(resolve, delay))]);
    if (token !== requestToken) return;

    clearInterval(legendTimer);
    photo.src = season.src;
    photo.alt = `${player.name} con la camiseta de ${season.year}`;
    overlay.hidden = true;
    root.classList.remove('is-loading');
  };

  paintSeasons();
  showSeason();

  on(seasonRow, 'click', '.chip', (event, btn) => {
    const i = Number(btn.dataset.i);
    if (i === seasonIndex) return;
    seasonIndex = i;
    qsa('.chip', seasonRow).forEach((c) => c.classList.toggle('is-on', c === btn));
    showSeason();
  });

  if (playerRow) {
    on(playerRow, 'click', '.chip', (event, btn) => {
      const found = HERO_PLAYERS.find((p) => p.id === btn.dataset.id);
      if (!found || found === player) return;
      player = found;
      seasonIndex = 0;
      qsa('.chip', playerRow).forEach((c) => c.classList.toggle('is-on', c === btn));
      paintSeasons();
      showSeason();
    });
  }
}
