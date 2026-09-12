/**
 * Camisetas por temporada: el catálogo del archivo.
 *
 * Es el nivel intermedio del proyecto: por año sabemos qué prendas existieron
 * (de jugador y de arquero); el dato fino — qué camiseta se usó en CADA partido —
 * se carga a mano desde la ficha del partido y vive en la tabla `match_kits`.
 *
 * DE DÓNDE SALEN
 * 1. CATALOGUE, acá abajo: las fotos clasificadas que viven en
 *    assets/camisetas/<año>/. Cada una sabe si es titular, suplente, alternativa,
 *    edición especial o de arquero, y en qué orden va.
 * 2. LEGACY_YEARS: las fotos viejas sueltas de assets/camisetas/, registradas en
 *    JERSEYS (js/data/dressup.js). Sólo entran las de los años que el catálogo
 *    todavía no cubre, para no mostrar dos veces la misma camiseta. El tipo de
 *    cada una está en LEGACY_TYPES, sacado de mirar la foto.
 *
 * PARA SUMAR UNA CAMISETA
 * 1. Dejá la foto en assets/camisetas/<año>/ con el nombre del tipo
 *    (titular.jpg, suplente.jpg, alternativa.jpg, especial.jpg, arquero-1.jpg…)
 * 2. Agregá la línea al año que corresponda en CATALOGUE.
 * 3. Si ese año estaba en LEGACY_YEARS, sacalo de ahí.
 */

import { JERSEY_DIR } from '../config.js';
import { JERSEYS } from './dressup.js';

/**
 * Los tipos de camiseta, en el orden en que se muestran dentro de un año.
 * `rank` ordena; `role` separa la fila de jugador de la de arquero.
 */
export const KIT_TYPES = {
  titular: { label: 'Titular', role: 'jugador', rank: 1 },
  suplente: { label: 'Suplente', role: 'jugador', rank: 2 },
  alternativa: { label: 'Alternativa', role: 'jugador', rank: 3 },
  /* Cubre tanto una cuarta equipación como un homenaje suelto: el detalle de
     qué es cada una va en NOTES, no en el nombre del tipo. */
  especial: { label: 'Edición especial', role: 'jugador', rank: 4 },
  arquero: { label: 'Arquero', role: 'arquero', rank: 10 },
};

/** Opciones del filtro por tipo. */
export const TYPE_OPTIONS = [
  { id: 'titular', label: 'Titular' },
  { id: 'suplente', label: 'Suplente' },
  { id: 'alternativa', label: 'Alternativa' },
  { id: 'especial', label: 'Edición especial' },
  { id: 'arquero', label: 'Arquero' },
];

/**
 * El catálogo clasificado. Dentro de cada año el orden de acá no importa:
 * se reordena solo por KIT_TYPES.rank y, entre arqueros, por `slot`.
 */
const CATALOGUE = {
  2026: [
    { kind: 'titular', file: '2026/titular.jpg' },
    { kind: 'suplente', file: '2026/suplente.jpg' },
    { kind: 'arquero', slot: 1, file: '2026/arquero-1.jpg' },
    { kind: 'arquero', slot: 2, file: '2026/arquero-2.jpg' },
  ],
  2025: [
    { kind: 'titular', file: '2025/titular.jpg' },
    { kind: 'suplente', file: '2025/suplente.jpg' },
    { kind: 'alternativa', file: '2025/alternativa.jpg' },
    { kind: 'especial', file: '2025/especial.jpg' },
    { kind: 'arquero', slot: 1, file: '2025/arquero-1.jpg' },
    { kind: 'arquero', slot: 2, file: '2025/arquero-2.jpg' },
    { kind: 'arquero', slot: 3, file: '2025/arquero-3.jpg' },
  ],
  2024: [
    { kind: 'titular', file: '2024/titular.jpg' },
    { kind: 'suplente', file: '2024/suplente.jpg' },
    { kind: 'alternativa', file: '2024/alternativa.jpg' },
    { kind: 'arquero', slot: 1, file: '2024/arquero-1.jpg' },
    { kind: 'arquero', slot: 2, file: '2024/arquero-2.jpg' },
    { kind: 'arquero', slot: 3, file: '2024/arquero-3.jpg' },
  ],
  2023: [
    { kind: 'titular', file: '2023/titular.jpg' },
    { kind: 'suplente', file: '2023/suplente.jpg' },
    { kind: 'alternativa', file: '2023/alternativa.jpg' },
    { kind: 'arquero', slot: 1, file: '2023/arquero-1.jpg' },
    { kind: 'arquero', slot: 2, file: '2023/arquero-2.jpg' },
    { kind: 'arquero', slot: 3, file: '2023/arquero-3.jpg' },
  ],
  2022: [
    { kind: 'titular', file: '2022/titular.jpg' },
    { kind: 'suplente', file: '2022/suplente.jpg' },
    { kind: 'arquero', slot: 1, file: '2022/arquero-1.jpg' },
  ],
  2021: [
    { kind: 'arquero', slot: 1, file: '2021/arquero-1.jpg' },
  ],
  2020: [
    { kind: 'titular', file: '2020/titular.jpg' },
    { kind: 'suplente', file: '2020/suplente.png' },
    { kind: 'alternativa', file: '2020/alternativa.png' },
  ],
  2018: [
    { kind: 'titular', file: '2018/titular.png' },
    { kind: 'suplente', file: '2018/suplente.jpg' },
    { kind: 'alternativa', file: '2018/alternativa.png' },
  ],
  2017: [
    { kind: 'titular', file: '2017/titular.png' },
    { kind: 'suplente', file: '2017/suplente.png' },
    { kind: 'alternativa', file: '2017/alternativa.png' },
  ],
  2015: [
    { kind: 'titular', file: '2015/titular.jpg' },
  ],
  2014: [
    { kind: 'suplente', file: '2014/suplente.png' },
  ],
  1973: [
    { kind: 'titular', file: '1973/titular.png' },
  ],
};

/** Años que todavía dependen de las fotos viejas sin clasificar. */
const LEGACY_YEARS = new Set([2012, 2013, 2016, 2019]);

/**
 * Qué es cada una de las viejas. Salió de mirarlas: en Huracán la titular es
 * blanca, la suplente roja y cualquier otro color es alternativa.
 *
 * La que estaba archivada como '2013-v3' resultó ser la titular 2012: es blanca
 * pero lleva el logo de Kappa, y en 2013 el club vistió Joma. Confirmado por
 * Vitto, así que se la movió de año y ahora es '2012-titular'.
 *
 * FALTA, Y SE SABE QUE EXISTIÓ: la edición especial inspirada en la suplente de
 * 1997. No hay foto todavía.
 */
const LEGACY_TYPES = {
  '2012': 'suplente',        // roja, Kappa, Banco Ciudad
  '2012-v2': 'alternativa',  // negra, Kappa, Banco Ciudad
  '2013': 'titular',         // blanca de cuello rojo, Joma, Banco Ciudad
  '2013-v2': 'alternativa',  // azul, Joma, Banco Ciudad
  '2012-titular': 'titular', // blanca, Kappa, Banco Ciudad — ver la nota de arriba
  '2016': 'alternativa',     // verde, TBS, LN Seguros
  '2019': 'titular',         // blanca de rayas finas, TBS, Banco Ciudad
  '2019-ringo': 'especial',  // negra con la silueta de Ringo Bonavena, TBS
};

/**
 * Notas por camiseta: sponsor, parche, detalle de esa prenda.
 * Sólo lo que alguien haya confirmado — no se inventa.
 *
 * Ejemplo:  '2025-especial': 'La Kombat, cuarta equipación de la temporada.',
 */
export const NOTES = {};

export const ROLE_LABEL = {
  jugador: 'Jugador',
  arquero: 'Arquero',
  null: 'Sin clasificar',
};

/* ---------------- armado ---------------- */

function catalogueKits() {
  const out = [];
  for (const [rawYear, entries] of Object.entries(CATALOGUE)) {
    const year = Number(rawYear);
    for (const entry of entries) {
      const type = KIT_TYPES[entry.kind];
      const slot = entry.slot || 1;
      const isKeeper = entry.kind === 'arquero';
      // El número del arquero ordena y hace único al id, pero no se muestra: las
      // de arquero no tienen nombre, alcanza con que se vea que son de arquero.
      const id = isKeeper ? `${year}-arquero-${slot}` : `${year}-${entry.kind}`;
      out.push({
        id,
        year,
        kind: entry.kind,
        slot,
        label: type.label,
        role: type.role,
        rank: type.rank + (isKeeper ? slot / 100 : 0),
        variant: null,
        note: NOTES[id] || null,
        src: `${JERSEY_DIR}/${entry.file}`,
        file: entry.file,
      });
    }
  }
  return out;
}

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

function legacyKits() {
  return JERSEYS.map((jersey) => {
    const year = yearOf(jersey.id);
    const kind = LEGACY_TYPES[jersey.id] || null;
    const type = kind ? KIT_TYPES[kind] : null;
    return {
      id: jersey.id,
      year,
      kind,
      slot: 1,
      // Clasificada usa el nombre del tipo; sin clasificar, la etiqueta vieja.
      label: type ? type.label : jersey.label,
      role: type ? type.role : null,
      // Sin tipo va al final del año, que es donde no molesta.
      rank: type ? type.rank : 50,
      // La variante sólo tiene sentido mientras no sepamos qué es la camiseta.
      variant: kind ? null : variantOf(jersey.id),
      note: NOTES[jersey.id] || null,
      src: jersey.src,
      file: jersey.file,
    };
  }).filter((kit) => kit.year && LEGACY_YEARS.has(kit.year));
}

/** Todas las camisetas conocidas, de la temporada más nueva a la más vieja. */
export const SEASON_KITS = [...catalogueKits(), ...legacyKits()].sort(
  (a, b) => b.year - a.year || a.rank - b.rank || String(a.id).localeCompare(String(b.id))
);

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
