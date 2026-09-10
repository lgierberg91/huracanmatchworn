/**
 * Camisetas por temporada.
 *
 * Es el nivel intermedio del archivo: por año sabemos qué camisetas existieron
 * (de jugador y de arquero); el dato fino — qué camiseta se usó en CADA partido —
 * se carga a mano desde la ficha del partido y vive en la tabla `match_kits`.
 *
 * De dónde salen: hoy, de las fotos que están en assets/camisetas, registradas
 * en js/data/dressup.js. Ese registro nació para el Kit Creator, pero son las
 * únicas camisetas reales que tenemos, así que también alimentan la colección.
 *
 * PARA SUMAR UNA CAMISETA
 * 1. Dejá la foto en assets/camisetas/
 * 2. Agregá la línea en js/data/dressup.js (id, label, file)
 * 3. Si sabés si es de jugador o de arquero, anotala en ROLES acá abajo.
 */

import { JERSEYS } from './dressup.js';

/**
 * Rol de cada camiseta: 'jugador' | 'arquero'.
 * Está vacío a propósito: todavía nadie clasificó las fotos y no se inventa.
 * Lo que no figure acá aparece como "sin clasificar" en la interfaz.
 *
 * Ejemplo:  '2019-ringo': 'arquero',
 */
export const ROLES = {};

/**
 * Notas por camiseta: sponsor, parche, detalle de esa prenda.
 * Mismo criterio — sólo lo que alguien haya confirmado.
 */
export const NOTES = {};

export const ROLE_LABEL = {
  jugador: 'Jugador',
  arquero: 'Arquero',
  null: 'Sin clasificar',
};

/** '2025-v3' -> 2025 · '2019-ringo' -> 2019 */
function yearOf(id) {
  const found = String(id).match(/(19|20)\d{2}/);
  return found ? Number(found[0]) : null;
}

/** '2025-v3' -> 'v3' · '2019-ringo' -> 'ringo' · '2012' -> null */
function variantOf(id) {
  const rest = String(id).replace(/^(19|20)\d{2}-?/, '');
  return rest || null;
}

/** Todas las camisetas conocidas, normalizadas y ordenadas de la más nueva a la más vieja. */
export const SEASON_KITS = JERSEYS.map((jersey) => {
  const year = yearOf(jersey.id);
  return {
    id: jersey.id,
    year,
    label: jersey.label,
    variant: variantOf(jersey.id),
    role: ROLES[jersey.id] || null,
    note: NOTES[jersey.id] || null,
    src: jersey.src,
    file: jersey.file,
  };
})
  .filter((kit) => kit.year)
  .sort((a, b) => b.year - a.year || String(a.id).localeCompare(String(b.id)));

const BY_YEAR = new Map();
for (const kit of SEASON_KITS) {
  if (!BY_YEAR.has(kit.year)) BY_YEAR.set(kit.year, []);
  BY_YEAR.get(kit.year).push(kit);
}

const BY_ID = new Map(SEASON_KITS.map((k) => [k.id, k]));

export const kitsForYear = (year) => (BY_YEAR.get(Number(year)) || []).slice();
export const seasonKitById = (id) => BY_ID.get(id) || null;
export const yearsWithKits = () => [...BY_YEAR.keys()].sort((a, b) => b - a);
export const kitCount = () => SEASON_KITS.length;

/** Cuántas camisetas hay por rol, para las cifras de la colección. */
export function roleCounts() {
  const counts = { jugador: 0, arquero: 0, sinClasificar: 0 };
  for (const kit of SEASON_KITS) {
    if (kit.role === 'jugador') counts.jugador++;
    else if (kit.role === 'arquero') counts.arquero++;
    else counts.sinClasificar++;
  }
  return counts;
}
