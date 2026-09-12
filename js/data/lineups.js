/**
 * Formaciones de Huracán partido por partido.
 *
 * QUÉ GUARDA
 * Quiénes fueron los once, quiénes al banco, qué cambios se hicieron y una nota
 * suelta sobre la camiseta de ese día ("se usó la alternativa por choque de
 * colores", "parche del centenario", lo que sea). Sólo de Huracán: el equipo
 * rival no es lo que busca quien entra a ver una camiseta.
 *
 * DÓNDE VIVE — Y LA LIMITACIÓN
 * En el navegador de cada uno (localStorage), NO en Supabase. La base no tiene
 * tabla de formaciones y crearla necesita correr SQL, que hoy no es una opción.
 * O sea: lo que cargues lo ves vos, en esta máquina, y no lo ve nadie más.
 * Para que sea compartido hay que crear la tabla `match_lineups` y reemplazar
 * readLineup/saveLineup por llamadas a la API, sin tocar la interfaz.
 */

const KEY = 'hmw:lineups';

/**
 * Una formación es su dibujo: cuántos por línea, del fondo al ataque.
 * Las posiciones en la cancha se calculan solas, así que sumar una nueva es
 * agregar una línea acá.
 */
export const FORMATIONS = [
  { id: '4-3-3', lines: [4, 3, 3] },
  { id: '4-4-2', lines: [4, 4, 2] },
  { id: '4-2-3-1', lines: [4, 2, 3, 1] },
  { id: '4-3-1-2', lines: [4, 3, 1, 2] },
  { id: '3-5-2', lines: [3, 5, 2] },
  { id: '5-3-2', lines: [5, 3, 2] },
  { id: '3-4-3', lines: [3, 4, 3] },
];

export const DEFAULT_FORMATION = '4-3-3';

/**
 * Números de camiseta por defecto, a la argentina y leídos de izquierda a
 * derecha. Lo que no esté acá se numera 2, 3, 4… y se corrige a mano.
 */
const DEFAULT_NUMBERS = {
  '4-3-3': [3, 6, 2, 4, 10, 8, 5, 11, 9, 7],
  '4-4-2': [3, 6, 2, 4, 11, 8, 5, 7, 10, 9],
  '4-2-3-1': [3, 6, 2, 4, 5, 8, 11, 10, 7, 9],
  '4-3-1-2': [3, 6, 2, 4, 5, 8, 7, 10, 11, 9],
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

  const slots = [{ x: 50, y: 92, number: 1 }];

  lines.forEach((count, lineIndex) => {
    const y = lines.length === 1 ? 45 : 74 - (lineIndex * 58) / (lines.length - 1);
    for (let i = 0; i < count; i++) {
      const x = 14 + (i + 0.5) * (72 / count);
      const at = slots.length - 1;
      slots.push({ x, y, number: numbers[at] != null ? numbers[at] : at + 2 });
    }
  });

  return slots;
}

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

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

/** Lo cargado para un partido, o null si nadie lo completó. */
export function readLineup(matchId) {
  const stored = readAll()[matchId];
  if (!stored) return null;
  const base = emptyLineup(stored.formation || DEFAULT_FORMATION);
  return {
    ...base,
    ...stored,
    starters: (stored.starters && stored.starters.length ? stored.starters : base.starters).slice(0, base.starters.length),
    bench: stored.bench && stored.bench.length ? stored.bench : base.bench,
    subs: stored.subs || [],
    kitNote: stored.kitNote || '',
  };
}

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
