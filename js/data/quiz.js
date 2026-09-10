/**
 * "¿Qué camiseta es?" — datos del minijuego.
 *
 * El juego muestra la foto de una camiseta del archivo con el sponsor y el logo
 * de la marca tapados, y va preguntando: marca → sponsor → cuántas temporadas
 * se usó ese modelo → cuáles.
 *
 * QUÉ ESTÁ CARGADO Y QUÉ NO
 * - La marca sale sola de las eras de indumentaria (js/data/brands.js), que es
 *   un dato real que ya traía el proyecto.
 * - El sponsor y las temporadas NO los sé y no se inventan: hay que cargarlos
 *   acá abajo. Mientras una camiseta no los tenga, esa pregunta se saltea.
 *
 * PARA SUMAR UNA CAMISETA AL JUEGO
 *   'id-de-la-camiseta': {
 *     brand: 'Kappa',                  // opcional: si falta, se usa la era del año
 *     sponsors: ['Sponsor Principal'], // uno o varios; acepta alias
 *     seasons: ['2024', '2025'],       // temporadas en que se usó ese modelo
 *   }
 * El id es el mismo de js/data/dressup.js ('2025-v2', '2019-ringo', etc.).
 */

import { SEASON_KITS, seasonKitById } from './seasonKits.js';
import { brandForYear } from './brands.js';

/** Respuestas cargadas a mano. Empieza vacío a propósito. */
export const ANSWERS = {
  // '2024': { sponsors: ['Sponsor'], seasons: ['2024', '2025'] },
};

/**
 * Zonas a tapar de cada foto, en porcentaje de la imagen: {x, y, w, h}.
 * El origen es la esquina superior izquierda.
 *
 * Si una camiseta no tiene zonas propias se usan las de abajo, que cubren los
 * lugares habituales. Conviene ajustarlas foto por foto: se ven en pantalla y
 * es cuestión de mover los números.
 */
export const MASKS = {
  // '2024': [{ x: 28, y: 40, w: 44, h: 15 }],
};

/** Pecho (sponsor) y pectoral derecho (marca). */
export const DEFAULT_MASKS = [
  { x: 26, y: 38, w: 48, h: 16 },
  { x: 57, y: 24, w: 17, h: 10 },
];

export const masksFor = (kitId) => MASKS[kitId] || DEFAULT_MASKS;

/** Texto comparable: sin acentos, sin signos, en minúsculas. */
export function normalize(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

export const matches = (given, expected) => normalize(given) === normalize(expected);

/**
 * Arma la ronda de una camiseta: la foto y las preguntas que se pueden responder.
 * Las que no tienen dato cargado no aparecen.
 */
export function buildRound(kitId) {
  const kit = seasonKitById(kitId);
  if (!kit) return null;

  const answer = ANSWERS[kitId] || {};
  const brand = answer.brand || brandForYear(kit.year);
  const seasons = answer.seasons && answer.seasons.length ? answer.seasons : null;

  const steps = [];

  if (brand) {
    steps.push({
      id: 'marca',
      kind: 'text',
      title: '¿Cuál es la marca de la indumentaria?',
      placeholder: 'Escribí la marca…',
      accepts: [brand],
      reveal: brand,
    });
  }

  if (answer.sponsors && answer.sponsors.length) {
    steps.push({
      id: 'sponsor',
      kind: 'multi',
      title: answer.sponsors.length === 1 ? 'Nombrá el sponsor principal' : 'Nombrá los sponsors',
      placeholder: 'Escribí un sponsor y presioná Enter…',
      targets: answer.sponsors,
      reveal: answer.sponsors.join(', '),
    });
  }

  if (seasons) {
    steps.push({
      id: 'cuantas',
      kind: 'number',
      title: '¿En cuántas temporadas se usó este modelo?',
      placeholder: 'Un número…',
      accepts: [String(seasons.length)],
      reveal: `${seasons.length}`,
    });
    steps.push({
      id: 'temporadas',
      kind: 'seasons',
      title: 'Seleccioná las temporadas correctas',
      targets: seasons,
      reveal: seasons.join(', '),
    });
  }

  return { kit, steps, brand, seasons };
}

/** Camisetas que tienen al menos una pregunta respondible. */
export function playableKits() {
  return SEASON_KITS.filter((kit) => {
    const round = buildRound(kit.id);
    return round && round.steps.length > 0;
  });
}

/** Cuántas están completas (las cuatro preguntas). */
export const fullyLoadedKits = () =>
  SEASON_KITS.filter((kit) => {
    const answer = ANSWERS[kit.id];
    return answer && answer.sponsors && answer.sponsors.length && answer.seasons && answer.seasons.length;
  });
