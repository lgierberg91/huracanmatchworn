/**
 * "Vestidor": el probador de camisetas.
 *
 * Muestra una foto pre-generada con IA (jugador histórico + camiseta de una
 * temporada). Al cambiar de jugador o de camiseta se simula una breve instancia
 * de "generación" con leyenda antes de revelar la imagen, que ya está generada
 * y sólo se precarga.
 *
 * Viene en dos formas, sobre el mismo motor:
 * - completa (dressUpHTML): chips con el nombre de cada ídolo y cada temporada.
 *   Es la sección Kit Creator, js/views/kitCreator.js.
 * - compacta (dressUpCompactHTML): sólo la foto y dos pares de flechas — las de
 *   arriba cambian de ídolo, las de abajo de camiseta. Sin nombres. Es lo primero
 *   que se ve en la portada.
 */

import { esc, qs, qsa, on } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { HERO_PLAYERS } from '../data/dressup.js';

const LEGENDS = [
  'Creando imagen con IA…',
  'Probándole la camiseta…',
  'Afinando los últimos detalles…',
];

/** El escenario: la foto más la capa de "generando". Igual en las dos formas. */
function stageHTML(idPrefix) {
  return `<div class="dressup__stage">
      <img class="dressup__photo" id="${idPrefix}-photo" alt="">
      <div class="dressup__overlay" id="${idPrefix}-overlay" hidden>
        <span class="spinner" aria-hidden="true"></span>
        <p class="dressup__legend" id="${idPrefix}-legend"></p>
      </div>
    </div>`;
}

/**
 * El motor: quién está elegido, qué camiseta, y el revelado.
 * `onPaint` se llama cada vez que cambia el jugador, para que cada forma
 * redibuje sus propios controles.
 */
function createEngine(root, idPrefix, onPaint) {
  const photo = qs(`#${idPrefix}-photo`, root);
  const overlay = qs(`#${idPrefix}-overlay`, root);
  const legend = qs(`#${idPrefix}-legend`, root);

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

  async function show() {
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
  }

  const api = {
    get player() { return player; },
    get seasonIndex() { return seasonIndex; },
    setPlayer(next) {
      if (!next || next === player) return;
      player = next;
      seasonIndex = 0;
      onPaint(api);
      show();
    },
    setSeason(index) {
      if (index === seasonIndex || !player.seasons[index]) return;
      seasonIndex = index;
      onPaint(api);
      show();
    },
    /** Avanza en círculo, para las flechas. */
    stepPlayer(delta) {
      const at = HERO_PLAYERS.indexOf(player);
      const next = (at + delta + HERO_PLAYERS.length) % HERO_PLAYERS.length;
      api.setPlayer(HERO_PLAYERS[next]);
    },
    stepSeason(delta) {
      const total = player.seasons.length;
      if (total < 2) return;
      api.setSeason((seasonIndex + delta + total) % total);
    },
    dispose() {
      clearInterval(legendTimer);
      requestToken++;
    },
  };

  onPaint(api);
  show();
  return api;
}

/* ---------------- forma completa: chips ---------------- */

export function dressUpHTML() {
  const player = HERO_PLAYERS[0];
  const showPlayerPicker = HERO_PLAYERS.length > 1;

  return `<div class="dressup" id="dressup">
      ${stageHTML('dressup')}
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

  const seasonRow = qs('#dressup-seasons', root);
  const playerRow = qs('#dressup-players', root);

  const engine = createEngine(root, 'dressup', (api) => {
    seasonRow.innerHTML = api.player.seasons
      .map((s, i) => `<button type="button" class="chip${i === api.seasonIndex ? ' is-on' : ''}" data-i="${i}">${s.year}</button>`)
      .join('');
    if (playerRow) {
      qsa('.chip', playerRow).forEach((c) => c.classList.toggle('is-on', c.dataset.id === api.player.id));
    }
  });

  on(seasonRow, 'click', '.chip', (event, btn) => engine.setSeason(Number(btn.dataset.i)));

  if (playerRow) {
    on(playerRow, 'click', '.chip', (event, btn) =>
      engine.setPlayer(HERO_PLAYERS.find((p) => p.id === btn.dataset.id))
    );
  }

  return () => engine.dispose();
}

/* ---------------- forma compacta: sólo flechas ---------------- */

function arrowHTML(step, dir, label) {
  return `<button type="button" class="dressup__arrow dressup__arrow--${step} is-${dir < 0 ? 'left' : 'right'}"
      data-step="${step}" data-dir="${dir}" title="${esc(label)}" aria-label="${esc(label)}">
      ${icon(dir < 0 ? 'chevronLeft' : 'chevronRight')}
    </button>`;
}

export function dressUpCompactHTML() {
  return `<div class="dressup dressup--compact" id="dressup-mini">
      ${stageHTML('dressup-mini')}
      ${arrowHTML('player', -1, 'Ídolo anterior')}
      ${arrowHTML('player', 1, 'Ídolo siguiente')}
      ${arrowHTML('season', -1, 'Camiseta anterior')}
      ${arrowHTML('season', 1, 'Camiseta siguiente')}
    </div>`;
}

export function mountDressUpCompact() {
  const root = qs('#dressup-mini');
  if (!root) return;

  const engine = createEngine(root, 'dressup-mini', (api) => {
    // Con un solo año cargado las flechas de camiseta no llevan a ningún lado.
    const single = api.player.seasons.length < 2;
    qsa('.dressup__arrow--season', root).forEach((b) => { b.disabled = single; });
  });

  on(root, 'click', '.dressup__arrow', (event, btn) => {
    const dir = Number(btn.dataset.dir);
    if (btn.dataset.step === 'player') engine.stepPlayer(dir);
    else engine.stepSeason(dir);
  });

  return () => engine.dispose();
}
