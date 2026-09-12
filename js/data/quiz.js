/**
 * "¿Qué camiseta es?" — el mazo del minijuego.
 *
 * CÓMO SE JUEGA
 * Cada camiseta se recorre en tres etapas, cada una con su propia foto:
 *   1. Foto sin marca ni sponsor  →  ¿de qué marca es?
 *   2. Foto con la marca puesta   →  ¿qué sponsor lleva en el pecho?
 *   3. La foto original completa  →  ¿en cuántas temporadas se usó? y ¿cuáles?
 *
 * LAS FOTOS
 * Las de las dos primeras etapas vienen ya tapadas desde afuera y viven en
 * assets/minijuego/<id>-1.png y -2.png. Por eso acá no hay máscaras ni nada que
 * recortar: lo que se ve es exactamente el archivo. La tercera etapa reusa la
 * foto del catálogo (js/data/seasonKits.js), que es la misma camiseta destapada.
 *
 * PARA SUMAR UNA CAMISETA
 * 1. Dejá las dos fotos en assets/minijuego/ con el id de la camiseta:
 *    "2017-titular-1.png" (sin nada) y "2017-titular-2.png" (con la marca).
 * 2. Agregá la entrada acá abajo. El `id` tiene que ser el de la camiseta en el
 *    catálogo, así la etapa 3 encuentra sola la foto original.
 * 3. `sponsors` es literal lo que dice en el pecho. `seasons` son las temporadas
 *    en que se usó ESE modelo: si duró más de una, ponelas todas.
 */

import { JERSEY_DIR } from '../config.js';
import { seasonKitById } from './seasonKits.js';

export const QUIZ_DIR = 'assets/minijuego';

/**
 * OJO CON `seasons`: hoy las cuatro dicen una sola temporada, la de la propia
 * camiseta, porque es lo único confirmado. Si alguna se usó también al año
 * siguiente, sumale el año acá y el juego pasa a preguntar "¿en cuántas?" con
 * la respuesta correcta.
 */
const DECK = [
  {
    id: '2017-titular',
    name: 'Titular 2017',
    brand: 'TBS',
    sponsors: ['Banco Ciudad'],
    seasons: ['2017'],
  },
  {
    id: '2020-suplente',
    name: 'Suplente 2020',
    brand: 'TBS',
    sponsors: ['Banco Ciudad'],
    seasons: ['2020'],
  },
  {
    id: '2023-arquero-3',
    name: 'Arquero 2023',
    brand: 'Kappa',
    sponsors: ['Decrypto'],
    seasons: ['2023'],
  },
  {
    id: '2025-suplente',
    name: 'Suplente 2025',
    brand: 'Kappa',
    sponsors: ['Jeluz'],
    seasons: ['2025'],
  },
];

/** '2025-v3' -> 2025 · '2023-arquero-3' -> 2023 */
function yearOf(id) {
  const found = String(id).match(/(19|20)\d{2}/);
  return found ? Number(found[0]) : null;
}

/**
 * El mazo armado: las tres fotos de cada camiseta y su año.
 * La foto original sale del catálogo; si esa camiseta no estuviera registrada,
 * la entrada se descarta en vez de romper el juego con una imagen rota.
 */
export const QUIZ_KITS = DECK.map((entry) => {
  const kit = seasonKitById(entry.id);
  return {
    ...entry,
    year: yearOf(entry.id),
    label: entry.name,
    photos: {
      blank: `${QUIZ_DIR}/${entry.id}-1.png`,
      branded: `${QUIZ_DIR}/${entry.id}-2.png`,
      full: kit ? kit.src : `${JERSEY_DIR}/${entry.id}.jpg`,
    },
    inCatalogue: Boolean(kit),
  };
}).filter((kit) => kit.inCatalogue && kit.year);

const BY_ID = new Map(QUIZ_KITS.map((k) => [k.id, k]));
export const quizKitById = (id) => BY_ID.get(id) || null;

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
 * Las etapas de una camiseta. Cada una dice qué foto mostrar, así la vista sólo
 * la cambia sin saber por qué.
 */
export function buildRound(kitId) {
  const kit = quizKitById(kitId);
  if (!kit) return null;

  const seasons = (kit.seasons && kit.seasons.length ? kit.seasons : [String(kit.year)]).map(String);
  const steps = [];

  steps.push({
    id: 'marca',
    kind: 'text',
    photo: kit.photos.blank,
    title: '¿Qué marca es esta camiseta?',
    placeholder: 'Escribí la marca…',
    accepts: [kit.brand],
    reveal: kit.brand,
  });

  steps.push({
    id: 'sponsor',
    kind: 'multi',
    photo: kit.photos.branded,
    title: kit.sponsors.length === 1 ? '¿Qué sponsor lleva en el pecho?' : '¿Qué sponsors lleva?',
    placeholder: 'Escribí el sponsor y presioná Enter…',
    targets: kit.sponsors,
    reveal: kit.sponsors.join(', '),
  });

  // De acá en más se juega con la camiseta destapada: ya no hay nada que ocultar.
  steps.push({
    id: 'cuantas',
    kind: 'number',
    photo: kit.photos.full,
    title: '¿En cuántas temporadas se usó este modelo?',
    placeholder: 'Un número…',
    accepts: [String(seasons.length)],
    reveal: `${seasons.length}`,
  });

  steps.push({
    id: 'temporadas',
    kind: 'seasons',
    photo: kit.photos.full,
    title: seasons.length === 1 ? '¿De qué temporada es?' : '¿En qué temporadas se usó?',
    targets: seasons,
    reveal: seasons.join(', '),
  });

  return { kit, steps, brand: kit.brand, seasons };
}

/** Todas las del mazo son jugables: siempre tienen las cuatro respuestas. */
export const playableKits = () => QUIZ_KITS.slice();

/** Las que tienen el sponsor cargado — hoy, todas. */
export const fullyLoadedKits = () => QUIZ_KITS.filter((kit) => kit.sponsors && kit.sponsors.length);
