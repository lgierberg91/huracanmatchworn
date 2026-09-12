/**
 * Formaciones de Huracán partido por partido.
 *
 * QUÉ GUARDA
 * Quiénes fueron los once, quiénes al banco, qué cambios se hicieron y una nota
 * suelta sobre la camiseta de ese día ("se usó la alternativa por choque de
 * colores", "parche del centenario", lo que sea). Sólo de Huracán: el equipo
 * rival no es lo que busca quien entra a ver una camiseta.
 *
 * DE DÓNDE SALE
 * 1. js/data/lineupsSeed.js: 641 partidos bajados de las fichas de ESPN, que
 *    vienen con el sitio y los ve cualquiera que entre.
 * 2. El navegador de cada uno (localStorage), para lo que se edita a mano. Eso
 *    NO se comparte: la base no tiene tabla de formaciones y crearla necesita
 *    correr SQL, que hoy no es una opción. Lo editado pisa a lo cargado.
 *    Para volverlo compartido hay que crear `match_lineups` y reemplazar
 *    readLineup/saveLineup por llamadas a la API, sin tocar la interfaz.
 *
 * PARTIDOS SIN ESQUEMA
 * De 2014 para atrás ESPN publica el once pero no el dibujo, así que esas
 * formaciones llegan con `formation` vacío. No se les inventa uno: la vista los
 * muestra como lista en vez de dibujarlos en la cancha.
 */

import { SEED } from './lineupsSeed.js';

const KEY = 'hmw:lineups';

/**
 * Una formación es su dibujo: cuántos por línea, del fondo al ataque.
 * Las posiciones en la cancha se calculan solas, así que sumar una nueva es
 * agregar una línea acá.
 */
export const FORMATIONS = [
  { id: '4-2-3-1', lines: [4, 2, 3, 1] },
  { id: '4-3-3', lines: [4, 3, 3] },
  { id: '4-4-2', lines: [4, 4, 2] },
  { id: '4-3-1-2', lines: [4, 3, 1, 2] },
  { id: '4-1-4-1', lines: [4, 1, 4, 1] },
  { id: '4-1-3-2', lines: [4, 1, 3, 2] },
  { id: '4-4-1-1', lines: [4, 4, 1, 1] },
  { id: '3-5-2', lines: [3, 5, 2] },
  { id: '5-3-2', lines: [5, 3, 2] },
  { id: '3-4-3', lines: [3, 4, 3] },
];

/* El 4-2-3-1 es, por lejos, el dibujo más repetido del archivo. */
export const DEFAULT_FORMATION = '4-2-3-1';

/**
 * Números de camiseta por defecto, a la argentina y leídos de izquierda a
 * derecha. Lo que no esté acá se numera 2, 3, 4… y se corrige a mano.
 */
const DEFAULT_NUMBERS = {
  '4-3-3': [3, 6, 2, 4, 10, 8, 5, 11, 9, 7],
  '4-4-2': [3, 6, 2, 4, 11, 8, 5, 7, 10, 9],
  '4-2-3-1': [3, 6, 2, 4, 5, 8, 11, 10, 7, 9],
  '4-3-1-2': [3, 6, 2, 4, 5, 8, 7, 10, 11, 9],
  '4-1-4-1': [3, 6, 2, 4, 5, 11, 8, 10, 7, 9],
  '4-1-3-2': [3, 6, 2, 4, 5, 11, 8, 7, 10, 9],
  '4-4-1-1': [3, 6, 2, 4, 11, 8, 5, 7, 10, 9],
  '3-5-2': [6, 2, 4, 11, 8, 5, 7, 3, 10, 9],
  '5-3-2': [3, 6, 2, 4, 5, 10, 8, 7, 11, 9],
  '3-4-3': [6, 2, 4, 3, 8, 5, 7, 11, 9, 10],
};

export const formationById = (id) => FORMATIONS.find((f) => f.id === id) || FORMATIONS[0];

/**
 * Las once posiciones sobre la cancha, en porcentaje: el arquero abajo (nuestro
 * arco) y el ataque arriba. Cada línea se reparte el ancho en partes iguales.
 */
export function slotsFor(formationId) {
  const formation = formationById(formationId);
  const numbers = DEFAULT_NUMBERS[formation.id] || [];
  const lines = formation.lines;

  /*
    `perLine` es cuántos comparten esa franja. Lo necesita la vista para darle a
    cada puesto el ancho que le toca: con cuatro en el fondo hay lugar para la
    cuarta parte del ancho y ni un píxel más, o los apellidos se pisan.
    El arquero está solo, pero se lo trata como si fueran tres para que su
    etiqueta no se estire de punta a punta.
  */
  const slots = [{ x: 50, y: 92, number: 1, perLine: 3 }];

  lines.forEach((count, lineIndex) => {
    const y = lines.length === 1 ? 45 : 74 - (lineIndex * 58) / (lines.length - 1);
    for (let i = 0; i < count; i++) {
      const x = BORDE + (i + 0.5) * (ANCHO_UTIL / count);
      const at = slots.length - 1;
      slots.push({ x, y, number: numbers[at] != null ? numbers[at] : at + 2, perLine: count });
    }
  });

  return slots;
}

/*
  Cuánto de la cancha se reparten los puestos. Se usa casi todo el ancho a
  propósito: lo que sobra a los costados es ancho que le falta a cada apellido, y
  con cuatro en el fondo la diferencia es entre leer "Blondel" y leer "Blo…".
*/
const BORDE = 8;
const ANCHO_UTIL = 84;

/** Ancho de un puesto, en porcentaje del ancho de la cancha. */
export const slotWidth = (perLine) => ANCHO_UTIL / Math.max(perLine || 1, 1);

/** Cuántos van al banco. 12 a 23, como la planilla. */
export const BENCH_SIZE = 12;
export const benchNumbers = () => Array.from({ length: BENCH_SIZE }, (_, i) => i + 12);

/** Una formación vacía, lista para completar. */
export function emptyLineup(formationId = DEFAULT_FORMATION) {
  return {
    formation: formationId,
    starters: slotsFor(formationId).map((slot) => ({ number: slot.number, name: '' })),
    bench: benchNumbers().map((number) => ({ number, name: '' })),
    subs: [],
    kitNote: '',
  };
}

/* ---------------- lo que viene cargado con el sitio ---------------- */

/**
 * Las formaciones que vienen con el sitio viven en js/data/lineupsSeed.js, en
 * formato compacto. Acá se desarma cada una la primera vez que se pide y se
 * guarda, para no recorrer 641 partidos al arrancar.
 */
function persona(texto) {
  const corte = texto.indexOf(' ');
  // El dorsal va antes del primer espacio; si falta, la entrada arranca con él.
  return corte < 0
    ? { number: '', name: texto }
    : { number: texto.slice(0, corte), name: texto.slice(corte + 1) };
}

const gente = (linea) => (linea ? linea.split('|').map(persona) : []);

function cambio(texto) {
  const corte = texto.indexOf(' ');
  const minute = corte < 0 ? '' : texto.slice(0, corte);
  const resto = corte < 0 ? texto : texto.slice(corte + 1);
  const flecha = resto.indexOf('>');
  return flecha < 0
    ? { minute, out: resto, in: '' }
    : { minute, out: resto.slice(0, flecha), in: resto.slice(flecha + 1) };
}

const cache = new Map();

/** La formación cargada para un partido, ya desarmada, o null. */
function seedFor(matchId) {
  if (cache.has(matchId)) return cache.get(matchId);
  const fila = SEED[matchId];
  const valor = fila
    ? {
        formation: fila[0] || '',
        starters: gente(fila[1]),
        bench: gente(fila[2]),
        subs: fila[3] ? fila[3].split('|').map(cambio) : [],
        kitNote: '',
      }
    : null;
  cache.set(matchId, valor);
  return valor;
}

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * Lo cargado para un partido, o null si nadie lo completó.
 * Lo editado a mano manda sobre lo que viene con el sitio.
 *
 * `formation` puede volver vacío: es un partido del que sabemos el once pero no
 * el dibujo. Quien lo muestre tiene que contemplarlo.
 */
export function readLineup(matchId) {
  const stored = readAll()[matchId] || seedFor(matchId);
  if (!stored) return null;
  const base = emptyLineup(stored.formation || DEFAULT_FORMATION);
  return {
    ...base,
    ...stored,
    formation: stored.formation || '',
    starters: (stored.starters && stored.starters.length ? stored.starters : base.starters).slice(0, base.starters.length),
    bench: stored.bench && stored.bench.length ? stored.bench : base.bench,
    subs: stored.subs || [],
    kitNote: stored.kitNote || '',
  };
}

/** Si viene con el sitio y nadie lo editó todavía. */
export const isSeeded = (matchId) => Boolean(SEED[matchId] && !readAll()[matchId]);

export function saveLineup(matchId, lineup) {
  const all = readAll();
  all[matchId] = lineup;
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* sin persistencia: se pierde al recargar, pero la vista sigue andando */
  }
  return lineup;
}

export function clearLineup(matchId) {
  const all = readAll();
  delete all[matchId];
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* idem */
  }
}

/** Si tiene al menos un nombre, alguien se tomó el trabajo de cargarla. */
export function hasContent(lineup) {
  if (!lineup) return false;
  return Boolean(
    lineup.starters.some((p) => p.name) ||
      lineup.bench.some((p) => p.name) ||
      lineup.subs.length ||
      lineup.kitNote
  );
}
