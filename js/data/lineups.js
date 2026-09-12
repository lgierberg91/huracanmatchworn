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

/* ---------------- lo que viene cargado con el sitio ---------------- */

/** Atajo para escribir un once sin repetir la misma estructura once veces. */
function eleven(formation, starters, extra = {}) {
  return {
    formation,
    starters: starters.map(([number, name]) => ({ number: String(number), name })),
    bench: (extra.bench || []).map(([number, name]) => ({ number: String(number), name })),
    subs: extra.subs || [],
    kitNote: extra.kitNote || '',
  };
}

/**
 * Formaciones confirmadas, de las fichas de ESPN/Canchallena fecha por fecha.
 *
 * DOS ACLARACIONES SOBRE LA EXACTITUD
 * 1. El dibujo sólo está confirmado donde la fuente lo dice (River 4-4-2 y
 *    Belgrano de septiembre 4-2-3-1). En el resto se dedujo del orden en que la
 *    ficha lista a los once, que es el orden habitual arquero → fondo → ataque.
 *    Puede estar mal sin que estén mal los nombres.
 * 2. El banco lista sólo a los que efectivamente entraron y están confirmados;
 *    los cambios sin minuto son los que la crónica no precisó. Lo que no se
 *    pudo confirmar no se inventa: queda vacío.
 *
 * Los dorsales cambian de un partido a otro porque así figuran en las fichas.
 */
const SEEDED = {
  /* --- 2025 --- */
  '2025-10-05-banfield': eleven('4-3-3', [
    [1, 'Hernán Galíndez'],
    [25, 'César Ibáñez'], [30, 'Nehuén Paz'], [6, 'Fabio Pereyra'], [24, 'Tomás Guidara'],
    [8, 'Leonardo Gil'], [20, 'Emmanuel Ojeda'], [16, 'Rodrigo Cabral'],
    [10, 'Matko Miljevic'], [21, 'Juan Bisanz'], [23, 'Luciano Giménez'],
  ]),

  /* --- 2026 --- */
  '2026-01-23-banfield': eleven('4-3-3', [
    [1, 'Hernán Galíndez'],
    [4, 'Federico Vera'], [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [19, 'Leandro Lescano'],
    [20, 'Emmanuel Ojeda'], [15, 'Facundo Waller'], [11, 'Thaiel Peralta'],
    [8, 'Leonardo Gil'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ]),

  '2026-03-03-belgrano-de-cordoba': eleven('4-3-3', [
    [1, 'Hernán Galíndez'],
    [25, 'César Ibáñez'], [3, 'Lucas Carrizo'], [6, 'Fabio Pereyra'], [34, 'Ignacio Campo'],
    [8, 'Leonardo Gil'], [20, 'Emmanuel Ojeda'], [7, 'Óscar Cortés'],
    [10, 'Óscar Romero'], [23, 'Thaiel Peralta'], [9, 'Jordy Caicedo'],
  ]),

  '2026-03-13-river-plate': eleven('4-4-2', [
    [1, 'Hernán Galíndez'],
    [25, 'César Ibáñez'], [3, 'Lucas Carrizo'], [6, 'Fabio Pereyra'], [34, 'Ignacio Campo'],
    [14, 'Alejandro Martínez'], [8, 'Leonardo Gil'], [20, 'Emmanuel Ojeda'], [23, 'Thaiel Peralta'],
    [9, 'Jordy Caicedo'], [10, 'Óscar Romero'],
  ]),

  '2026-05-10-boca-juniors': eleven(
    '4-3-3',
    [
      [1, 'Hernán Galíndez'],
      [34, 'Ignacio Campo'], [6, 'Fabio Pereyra'], [3, 'Lucas Carrizo'], [19, 'Leandro Lescano'],
      [15, 'Facundo Waller'], [8, 'Leonardo Gil'], [2, 'Lucas Blondel'],
      [24, 'Facundo Kalinger'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
    ],
    {
      bench: [[10, 'Óscar Romero'], ['', 'Eric Ramírez']],
      subs: [
        { minute: '', out: '', in: 'Óscar Romero' },
        { minute: '', out: '', in: 'Eric Ramírez' },
      ],
    }
  ),

  '2026-07-25-banfield': eleven(
    '4-3-3',
    [
      [1, 'Hernán Galíndez'],
      [2, 'Lucas Blondel'], [6, 'Fabio Pereyra'], [35, 'Máximo Palazzo'], [25, 'César Ibáñez'],
      [8, 'Leonardo Gil'], [15, 'Facundo Waller'], [11, 'Thaiel Peralta'],
      [10, 'Óscar Romero'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
    ],
    {
      bench: [[24, 'Facundo Kalinger']],
      subs: [{ minute: '', out: 'Facundo Waller', in: 'Facundo Kalinger' }],
    }
  ),

  '2026-08-30-estudiantes-de-rio-cuarto': eleven('4-3-3', [
    [1, 'Hernán Galíndez'],
    [2, 'Lucas Blondel'], [6, 'Fabio Pereyra'], [35, 'Máximo Palazzo'], [25, 'César Ibáñez'],
    [8, 'Leonardo Gil'], [15, 'Facundo Waller'], [11, 'Thaiel Peralta'],
    [10, 'Óscar Romero'], [7, 'Óscar Cortés'], [23, 'Ignacio Pussetto'],
  ]),

  '2026-09-05-belgrano-de-cordoba': eleven(
    '4-2-3-1',
    [
      [1, 'Hernán Galíndez'],
      [25, 'César Ibáñez'], [35, 'Máximo Palazzo'], [21, 'Hugo Nervo'], [2, 'Lucas Blondel'],
      [15, 'Facundo Waller'], [5, 'Rodrigo Fernández Cedrés'],
      [7, 'Óscar Cortés'], [8, 'Leonardo Gil'], [24, 'Facundo Kalinger'],
      [9, 'Jordy Caicedo'],
    ],
    {
      bench: [[19, 'Leandro Lescano'], [11, 'Thaiel Peralta'], [33, 'Bruno Barticciotto']],
      subs: [
        { minute: '', out: 'César Ibáñez', in: 'Leandro Lescano' },
        { minute: '', out: 'Óscar Cortés', in: 'Thaiel Peralta' },
        { minute: '67', out: 'Leonardo Gil', in: 'Bruno Barticciotto' },
      ],
    }
  ),
};

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * Lo cargado para un partido, o null si nadie lo completó.
 * Lo editado a mano manda sobre lo que viene cargado en SEEDED.
 */
export function readLineup(matchId) {
  const stored = readAll()[matchId] || SEEDED[matchId];
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

/** Si viene del archivo y nadie lo editó todavía. */
export const isSeeded = (matchId) => Boolean(SEEDED[matchId] && !readAll()[matchId]);

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
