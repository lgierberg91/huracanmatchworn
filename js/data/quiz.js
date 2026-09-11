/**
 * "¿Qué camiseta es?" — datos del minijuego.
 *
 * El juego muestra la foto de una camiseta del archivo con el sponsor y el logo
 * de la marca tapados, y va preguntando: marca → sponsor → temporada.
 *
 * DE DÓNDE SALEN LAS FOTOS
 * Del registro viejo de camisetas sueltas (JERSEYS, en js/data/dressup.js), NO
 * del catálogo clasificado que alimenta la línea de tiempo. Es a propósito: las
 * zonas tapadas están ajustadas a estas fotos y cambiarlas dejaría los parches
 * en cualquier lado. Para pasar el juego al catálogo nuevo hay que reemplazar
 * QUIZ_KITS por SEASON_KITS y volver a ajustar MASKS foto por foto.
 *
 * QUÉ ESTÁ CARGADO Y QUÉ NO
 * - La marca sale sola de las eras de indumentaria (js/data/brands.js).
 * - La temporada sale del año de la propia camiseta, así que la pregunta existe
 *   siempre.
 * - El sponsor NO lo sé y no se inventa: hay que cargarlo acá abajo. Mientras una
 *   camiseta no lo tenga, esa pregunta se saltea.
 * - `seasons` sirve para los modelos que se usaron más de una temporada: si está
 *   cargado, el juego pregunta primero cuántas fueron y después cuáles.
 *
 * PARA SUMAR DATOS DE UNA CAMISETA
 *   'id-de-la-camiseta': {
 *     brand: 'Kappa',                  // opcional: si falta, se usa la era del año
 *     sponsors: ['Sponsor Principal'], // uno o varios; acepta alias
 *     seasons: ['2024', '2025'],       // sólo si el modelo duró más de una
 *   }
 * El id es el mismo de JERSEYS ('2025-v2', '2019-ringo', etc.).
 */

import { JERSEYS } from './dressup.js';
import { brandForYear } from './brands.js';

/** '2025-v3' -> 2025 · '2019-ringo' -> 2019 */
function yearOf(id) {
  const found = String(id).match(/(19|20)\d{2}/);
  return found ? Number(found[0]) : null;
}

/** El mazo del juego: las fotos viejas, con el año que se les puede leer al id. */
export const QUIZ_KITS = JERSEYS.map((jersey) => ({
  id: jersey.id,
  label: jersey.label,
  src: jersey.src,
  year: yearOf(jersey.id),
})).filter((kit) => kit.year);

const QUIZ_BY_ID = new Map(QUIZ_KITS.map((k) => [k.id, k]));
export const quizKitById = (id) => QUIZ_BY_ID.get(id) || null;

/** Respuestas cargadas a mano. Empieza vacío a propósito. */
export const ANSWERS = {
  // '2024': { sponsors: ['Sponsor'], seasons: ['2024', '2025'] },
};

/**
 * Zonas a tapar, en porcentaje DE LA CAMISETA (no de la foto): {x, y, w, h}.
 * El origen es la esquina superior izquierda.
 *
 * Si una camiseta no tiene zonas propias se usan las de abajo, que cubren los
 * lugares habituales. Conviene ajustarlas foto por foto: se ven en pantalla y
 * es cuestión de mover los números.
 */
export const MASKS = {
  // '2024': [{ x: 28, y: 40, w: 44, h: 15 }],
};

/**
 * En las camisetas de Huracán la marca va sobre el pecho izquierdo (visto de
 * frente, a la izquierda) y el escudo del globo sobre el derecho. Se tapa la
 * marca y el centro del pecho, donde va el sponsor — el escudo queda a la vista,
 * porque es la pista que hace jugable la foto.
 */
export const DEFAULT_MASKS = [
  { x: 16, y: 30, w: 68, h: 26 },  // pecho: sponsor
  { x: 20, y: 10, w: 24, h: 14 },  // pecho izquierdo: marca
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
  const kit = quizKitById(kitId);
  if (!kit) return null;

  const answer = ANSWERS[kitId] || {};
  const brand = answer.brand || brandForYear(kit.year);

  // Si nadie cargó en qué temporadas se usó el modelo, la respuesta es el año de
  // la propia camiseta: un dato que ya tenemos y que no hace falta inventar.
  const multiSeason = Boolean(answer.seasons && answer.seasons.length);
  const seasons = multiSeason ? answer.seasons.map(String) : [String(kit.year)];

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

  // Cuántas temporadas duró el modelo sólo tiene sentido preguntarlo cuando
  // alguien cargó el dato: si no, la respuesta sería siempre "una".
  if (multiSeason) {
    steps.push({
      id: 'cuantas',
      kind: 'number',
      title: '¿En cuántas temporadas se usó este modelo?',
      placeholder: 'Un número…',
      accepts: [String(seasons.length)],
      reveal: `${seasons.length}`,
    });
  }

  steps.push({
    id: 'temporadas',
    kind: 'seasons',
    title: multiSeason ? 'Seleccioná las temporadas en que se usó' : '¿De qué temporada es esta camiseta?',
    targets: seasons,
    reveal: seasons.join(', '),
  });

  return { kit, steps, brand, seasons };
}

/** Camisetas que tienen al menos una pregunta respondible. */
export function playableKits() {
  return QUIZ_KITS.filter((kit) => {
    const round = buildRound(kit.id);
    return round && round.steps.length > 0;
  });
}

/** Cuántas tienen además el sponsor cargado, que es el dato que falta. */
export const fullyLoadedKits = () =>
  QUIZ_KITS.filter((kit) => {
    const answer = ANSWERS[kit.id];
    return answer && answer.sponsors && answer.sponsors.length;
  });
