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
      const x = 14 + (i + 0.5) * (72 / count);
      const at = slots.length - 1;
      slots.push({ x, y, number: numbers[at] != null ? numbers[at] : at + 2, perLine: count });
    }
  });

  return slots;
}

/** Ancho de un puesto, en porcentaje del ancho de la cancha. */
export const slotWidth = (perLine) => 72 / Math.max(perLine || 1, 1);

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
  '2025-01-25-belgrano-de-cordoba': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [22, 'Daniel Zabala'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [21, 'Franco Watson'], [17, 'Gabriel Alanís'], [43, 'Eric Ramírez'],
  ], {
    bench: [[11, 'Agustín Urzi'], [7, 'Matías Tissera'], [31, 'Marco Pellegrino'], [16, 'Rodrigo Cabral'], [20, 'Emmanuel Ojeda'], [23, 'Víctor Cantillo'], [15, 'Agostino Spina'], [2, 'Nicolás Goitea'], [32, 'Sebastián Meza'], [34, 'Ignacio Campo'], [19, 'Leandro Lescano'], [9, 'Ramón Ábila']],
    subs: [
      { minute: '68', out: 'Gabriel Alanís', in: 'Agustín Urzi' },
      { minute: '69', out: 'Eric Ramírez', in: 'Matías Tissera' },
      { minute: '73', out: 'Daniel Zabala', in: 'Marco Pellegrino' },
      { minute: '81', out: 'Walter Mazzantti', in: 'Rodrigo Cabral' },
      { minute: '82', out: 'Franco Watson', in: 'Emmanuel Ojeda' },
    ],
  }),

  '2025-01-29-estudiantes': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [21, 'Franco Watson'], [17, 'Gabriel Alanís'], [43, 'Eric Ramírez'],
  ], {
    bench: [[18, 'Matko Miljevic'], [26, 'Leonardo Sequeira'], [11, 'Agustín Urzi'], [7, 'Matías Tissera'], [19, 'Leandro Lescano'], [2, 'Nicolás Goitea'], [32, 'Sebastián Meza'], [16, 'Rodrigo Cabral'], [34, 'Ignacio Campo'], [33, 'Santiago Moya'], [20, 'Emmanuel Ojeda'], [23, 'Víctor Cantillo']],
    subs: [
      { minute: '56', out: 'Franco Watson', in: 'Matko Miljevic' },
      { minute: '68', out: 'Eric Ramírez', in: 'Leonardo Sequeira' },
      { minute: '68', out: 'Gabriel Alanís', in: 'Agustín Urzi' },
      { minute: '82', out: 'Leonel Pérez', in: 'Matías Tissera' },
    ],
  }),

  '2025-02-02-boca-juniors': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [17, 'Gabriel Alanís'], [43, 'Eric Ramírez'],
  ], {
    bench: [[21, 'Franco Watson'], [26, 'Leonardo Sequeira'], [20, 'Emmanuel Ojeda'], [7, 'Matías Tissera'], [11, 'Agustín Urzi'], [32, 'Sebastián Meza'], [2, 'Nicolás Goitea'], [34, 'Ignacio Campo'], [19, 'Leandro Lescano'], [23, 'Víctor Cantillo'], [33, 'Santiago Moya'], [9, 'Ramón Ábila']],
    subs: [
      { minute: '61', out: 'Matko Miljevic', in: 'Franco Watson' },
      { minute: '62', out: 'Eric Ramírez', in: 'Leonardo Sequeira' },
      { minute: '77', out: 'Leonel Pérez', in: 'Emmanuel Ojeda' },
      { minute: '77', out: 'Gabriel Alanís', in: 'Matías Tissera' },
      { minute: '86', out: 'Walter Mazzantti', in: 'Agustín Urzi' },
    ],
  }),

  '2025-02-08-tigre': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [17, 'Gabriel Alanís'], [7, 'Matías Tissera'],
  ], {
    bench: [[11, 'Agustín Urzi'], [20, 'Emmanuel Ojeda'], [43, 'Eric Ramírez'], [23, 'Víctor Cantillo'], [29, 'Hernán De La Fuente'], [19, 'Leandro Lescano'], [26, 'Leonardo Sequeira'], [15, 'Agostino Spina'], [2, 'Nicolás Goitea'], [21, 'Franco Watson'], [32, 'Sebastián Meza'], [9, 'Ramón Ábila']],
    subs: [
      { minute: '62', out: 'Walter Mazzantti', in: 'Agustín Urzi' },
      { minute: '66', out: 'Leonel Pérez', in: 'Emmanuel Ojeda' },
      { minute: '66', out: 'Matías Tissera', in: 'Eric Ramírez' },
      { minute: '87', out: 'Gabriel Alanís', in: 'Víctor Cantillo' },
      { minute: '87', out: 'Tomás Guidara', in: 'Hernán De La Fuente' },
    ],
  }),

  '2025-02-13-argentinos-juniors': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [29, 'Hernán De La Fuente'], [25, 'César Ibáñez'], [8, 'Leonardo Gil'], [20, 'Emmanuel Ojeda'], [26, 'Leonardo Sequeira'], [18, 'Matko Miljevic'], [17, 'Gabriel Alanís'], [7, 'Matías Tissera'],
  ], {
    bench: [[10, 'Walter Mazzantti'], [43, 'Eric Ramírez'], [5, 'Leonel Pérez'], [11, 'Agustín Urzi'], [9, 'Ramón Ábila'], [23, 'Víctor Cantillo'], [21, 'Franco Watson'], [2, 'Nicolás Goitea'], [15, 'Agostino Spina'], [32, 'Sebastián Meza'], [19, 'Leandro Lescano'], [24, 'Tomás Guidara']],
    subs: [
      { minute: '45', out: 'Leonardo Sequeira', in: 'Walter Mazzantti' },
      { minute: '66', out: 'Matías Tissera', in: 'Eric Ramírez' },
      { minute: '72', out: 'Emmanuel Ojeda', in: 'Leonel Pérez' },
      { minute: '72', out: 'Matko Miljevic', in: 'Agustín Urzi' },
      { minute: '90', out: 'Gabriel Alanís', in: 'Ramón Ábila' },
    ],
  }),

  '2025-02-17-union-de-santa-fe': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [17, 'Gabriel Alanís'], [7, 'Matías Tissera'],
  ], {
    bench: [[43, 'Eric Ramírez'], [26, 'Leonardo Sequeira'], [21, 'Franco Watson'], [20, 'Emmanuel Ojeda'], [19, 'Leandro Lescano'], [2, 'Nicolás Goitea'], [9, 'Ramón Ábila'], [23, 'Víctor Cantillo'], [16, 'Rodrigo Cabral'], [29, 'Hernán De La Fuente'], [15, 'Agostino Spina'], [32, 'Sebastián Meza']],
    subs: [
      { minute: '45', out: 'Matías Tissera', in: 'Eric Ramírez' },
      { minute: '71', out: 'Gabriel Alanís', in: 'Leonardo Sequeira' },
      { minute: '71', out: 'Matko Miljevic', in: 'Franco Watson' },
      { minute: '90', out: 'Walter Mazzantti', in: 'Emmanuel Ojeda' },
    ],
  }),

  '2025-02-23-san-lorenzo': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [17, 'Gabriel Alanís'], [43, 'Eric Ramírez'],
  ], {
    bench: [[19, 'Leandro Lescano'], [20, 'Emmanuel Ojeda'], [16, 'Rodrigo Cabral'], [26, 'Leonardo Sequeira'], [9, 'Ramón Ábila'], [2, 'Nicolás Goitea'], [32, 'Sebastián Meza'], [7, 'Matías Tissera'], [28, 'Luca Babino'], [22, 'Daniel Zabala'], [23, 'Víctor Cantillo'], [29, 'Hernán De La Fuente']],
    subs: [
      { minute: '42', out: 'César Ibáñez', in: 'Leandro Lescano' },
      { minute: '70', out: 'Matko Miljevic', in: 'Emmanuel Ojeda' },
      { minute: '71', out: 'Gabriel Alanís', in: 'Rodrigo Cabral' },
      { minute: '71', out: 'Eric Ramírez', in: 'Leonardo Sequeira' },
      { minute: '87', out: 'Walter Mazzantti', in: 'Ramón Ábila' },
    ],
  }),

  '2025-03-02-velez-sarsfield': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [17, 'Gabriel Alanís'], [43, 'Eric Ramírez'],
  ], {
    bench: [[26, 'Leonardo Sequeira'], [20, 'Emmanuel Ojeda'], [7, 'Matías Tissera'], [16, 'Rodrigo Cabral'], [19, 'Leandro Lescano'], [15, 'Agostino Spina'], [32, 'Sebastián Meza'], [29, 'Hernán De La Fuente'], [2, 'Nicolás Goitea'], [9, 'Ramón Ábila'], [22, 'Daniel Zabala'], [21, 'Franco Watson']],
    subs: [
      { minute: '58', out: 'Walter Mazzantti', in: 'Leonardo Sequeira' },
      { minute: '68', out: 'Matko Miljevic', in: 'Emmanuel Ojeda' },
      { minute: '68', out: 'Eric Ramírez', in: 'Matías Tissera' },
      { minute: '81', out: 'Gabriel Alanís', in: 'Rodrigo Cabral' },
    ],
  }),

  '2025-03-08-racing-club': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [17, 'Gabriel Alanís'], [43, 'Eric Ramírez'],
  ], {
    bench: [[20, 'Emmanuel Ojeda'], [26, 'Leonardo Sequeira'], [7, 'Matías Tissera'], [16, 'Rodrigo Cabral'], [9, 'Ramón Ábila'], [29, 'Hernán De La Fuente'], [19, 'Leandro Lescano'], [22, 'Daniel Zabala'], [15, 'Agostino Spina'], [2, 'Nicolás Goitea'], [32, 'Sebastián Meza'], [21, 'Franco Watson']],
    subs: [
      { minute: '70', out: 'Matko Miljevic', in: 'Emmanuel Ojeda' },
      { minute: '76', out: 'Gabriel Alanís', in: 'Leonardo Sequeira' },
      { minute: '76', out: 'Eric Ramírez', in: 'Matías Tissera' },
      { minute: '90', out: 'Walter Mazzantti', in: 'Rodrigo Cabral' },
    ],
  }),

  '2025-03-13-san-martin-de-formosa': eleven('5-3-2', [
    [32, 'Sebastián Meza'],
    [22, 'Daniel Zabala'], [2, 'Nicolás Goitea'], [31, 'Marco Pellegrino'], [29, 'Hernán De La Fuente'], [19, 'Leandro Lescano'], [21, 'Franco Watson'], [20, 'Emmanuel Ojeda'], [8, 'Leonardo Gil'], [43, 'Eric Ramírez'], [9, 'Ramón Ábila'],
  ], {
    bench: [[18, 'Matko Miljevic'], [26, 'Leonardo Sequeira'], [17, 'Gabriel Alanís'], [25, 'César Ibáñez'], [15, 'Agostino Spina'], [6, 'Fabio Pereyra'], [24, 'Tomás Guidara'], [16, 'Rodrigo Cabral'], [1, 'Hernán Galíndez'], [28, 'Luca Babino'], [7, 'Matías Tissera'], [5, 'Leonel Pérez']],
    subs: [
      { minute: '57', out: 'Franco Watson', in: 'Matko Miljevic' },
      { minute: '57', out: 'Marco Pellegrino', in: 'Leonardo Sequeira' },
      { minute: '74', out: 'Eric Ramírez', in: 'Gabriel Alanís' },
      { minute: '74', out: 'Leandro Lescano', in: 'César Ibáñez' },
    ],
  }),

  '2025-03-16-independiente-rivadavia': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [17, 'Gabriel Alanís'], [7, 'Matías Tissera'],
  ], {
    bench: [[43, 'Eric Ramírez'], [20, 'Emmanuel Ojeda'], [16, 'Rodrigo Cabral'], [21, 'Franco Watson'], [19, 'Leandro Lescano'], [9, 'Ramón Ábila'], [22, 'Daniel Zabala'], [15, 'Agostino Spina'], [32, 'Sebastián Meza'], [28, 'Luca Babino'], [29, 'Hernán De La Fuente'], [2, 'Nicolás Goitea']],
    subs: [
      { minute: '55', out: 'Matías Tissera', in: 'Eric Ramírez' },
      { minute: '56', out: 'Matko Miljevic', in: 'Emmanuel Ojeda' },
      { minute: '89', out: 'Walter Mazzantti', in: 'Rodrigo Cabral' },
    ],
  }),

  '2025-03-28-banfield': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [29, 'Hernán De La Fuente'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [17, 'Gabriel Alanís'], [43, 'Eric Ramírez'],
  ], {
    bench: [[26, 'Leonardo Sequeira'], [9, 'Ramón Ábila'], [21, 'Franco Watson'], [7, 'Matías Tissera'], [34, 'Ignacio Campo'], [32, 'Sebastián Meza'], [33, 'Santiago Moya'], [19, 'Leandro Lescano'], [15, 'Agostino Spina'], [11, 'Agustín Urzi'], [23, 'Víctor Cantillo'], [2, 'Nicolás Goitea']],
    subs: [
      { minute: '60', out: 'Walter Mazzantti', in: 'Leonardo Sequeira' },
      { minute: '60', out: 'Gabriel Alanís', in: 'Ramón Ábila' },
      { minute: '80', out: 'Matko Miljevic', in: 'Franco Watson' },
      { minute: '81', out: 'Eric Ramírez', in: 'Matías Tissera' },
    ],
  }),

  '2025-04-03-corinthians-sp': eleven('4-1-4-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [29, 'Hernán De La Fuente'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [20, 'Emmanuel Ojeda'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [17, 'Gabriel Alanís'], [26, 'Leonardo Sequeira'],
  ], {
    bench: [[16, 'Rodrigo Cabral'], [9, 'Ramón Ábila'], [2, 'Nicolás Goitea'], [11, 'Agustín Urzi'], [22, 'Daniel Zabala'], [32, 'Sebastián Meza'], [19, 'Leandro Lescano'], [36, 'Milton Ríos'], [33, 'Santiago Moya'], [21, 'Franco Watson'], [23, 'Víctor Cantillo'], [18, 'Matko Miljevic']],
    subs: [
      { minute: '75', out: 'Gabriel Alanís', in: 'Rodrigo Cabral' },
      { minute: '81', out: 'Leonardo Sequeira', in: 'Ramón Ábila' },
      { minute: '89', out: 'Leonardo Gil', in: 'Nicolás Goitea' },
      { minute: '89', out: 'Walter Mazzantti', in: 'Agustín Urzi' },
    ],
  }),

  '2025-04-05-aldosivi': eleven('4-1-4-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [29, 'Hernán De La Fuente'], [19, 'Leandro Lescano'], [5, 'Leonel Pérez'], [18, 'Matko Miljevic'], [8, 'Leonardo Gil'], [11, 'Agustín Urzi'], [16, 'Rodrigo Cabral'], [43, 'Eric Ramírez'],
  ], {
    bench: [[26, 'Leonardo Sequeira'], [10, 'Walter Mazzantti'], [20, 'Emmanuel Ojeda'], [9, 'Ramón Ábila'], [22, 'Daniel Zabala'], [33, 'Santiago Moya'], [21, 'Franco Watson'], [25, 'César Ibáñez'], [15, 'Agostino Spina'], [2, 'Nicolás Goitea'], [32, 'Sebastián Meza'], [23, 'Víctor Cantillo']],
    subs: [
      { minute: '45', out: 'Eric Ramírez', in: 'Leonardo Sequeira' },
      { minute: '69', out: 'Agustín Urzi', in: 'Walter Mazzantti' },
      { minute: '69', out: 'Rodrigo Cabral', in: 'Emmanuel Ojeda' },
      { minute: '84', out: 'Matko Miljevic', in: 'Ramón Ábila' },
    ],
  }),

  '2025-04-10-racing': eleven('4-3-3', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [29, 'Hernán De La Fuente'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [18, 'Matko Miljevic'], [5, 'Leonel Pérez'], [10, 'Walter Mazzantti'], [11, 'Agustín Urzi'], [26, 'Leonardo Sequeira'],
  ], {
    bench: [[16, 'Rodrigo Cabral'], [9, 'Ramón Ábila'], [23, 'Víctor Cantillo'], [8, 'Leonardo Gil'], [28, 'Luca Babino'], [32, 'Sebastián Meza'], [21, 'Franco Watson'], [19, 'Leandro Lescano'], [15, 'Agostino Spina'], [2, 'Nicolás Goitea'], [22, 'Daniel Zabala'], [33, 'Santiago Moya']],
    subs: [
      { minute: '63', out: 'Agustín Urzi', in: 'Rodrigo Cabral' },
      { minute: '63', out: 'Leonardo Sequeira', in: 'Ramón Ábila' },
      { minute: '73', out: 'Emmanuel Ojeda', in: 'Víctor Cantillo' },
      { minute: '73', out: 'Matko Miljevic', in: 'Leonardo Gil' },
      { minute: '82', out: 'Walter Mazzantti', in: 'Luca Babino' },
    ],
  }),

  '2025-04-14-central-cordoba-sde': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [29, 'Hernán De La Fuente'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [5, 'Leonel Pérez'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [11, 'Agustín Urzi'], [26, 'Leonardo Sequeira'],
  ], {
    bench: [[17, 'Gabriel Alanís'], [16, 'Rodrigo Cabral'], [23, 'Víctor Cantillo'], [24, 'Tomás Guidara'], [9, 'Ramón Ábila'], [36, 'Milton Ríos'], [19, 'Leandro Lescano'], [32, 'Sebastián Meza'], [22, 'Daniel Zabala'], [15, 'Agostino Spina'], [2, 'Nicolás Goitea'], [21, 'Franco Watson']],
    subs: [
      { minute: '38', out: 'Agustín Urzi', in: 'Gabriel Alanís' },
      { minute: '66', out: 'Walter Mazzantti', in: 'Rodrigo Cabral' },
      { minute: '66', out: 'Emmanuel Ojeda', in: 'Víctor Cantillo' },
      { minute: '77', out: 'Hernán De La Fuente', in: 'Tomás Guidara' },
      { minute: '77', out: 'Leonardo Sequeira', in: 'Ramón Ábila' },
    ],
  }),

  '2025-04-19-defensa-y-justicia': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [19, 'Leandro Lescano'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [11, 'Agustín Urzi'], [18, 'Matko Miljevic'], [16, 'Rodrigo Cabral'], [43, 'Eric Ramírez'],
  ], {
    bench: [[10, 'Walter Mazzantti'], [26, 'Leonardo Sequeira'], [29, 'Hernán De La Fuente'], [20, 'Emmanuel Ojeda'], [9, 'Ramón Ábila'], [17, 'Gabriel Alanís'], [25, 'César Ibáñez'], [23, 'Víctor Cantillo'], [32, 'Sebastián Meza'], [22, 'Daniel Zabala'], [21, 'Franco Watson'], [2, 'Nicolás Goitea']],
    subs: [
      { minute: '45', out: 'Rodrigo Cabral', in: 'Walter Mazzantti' },
      { minute: '45', out: 'Eric Ramírez', in: 'Leonardo Sequeira' },
      { minute: '83', out: 'Tomás Guidara', in: 'Hernán De La Fuente' },
      { minute: '83', out: 'Agustín Urzi', in: 'Emmanuel Ojeda' },
      { minute: '87', out: 'Leonel Pérez', in: 'Ramón Ábila' },
    ],
  }),

  '2025-04-24-america-de-cali': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [16, 'Rodrigo Cabral'], [26, 'Leonardo Sequeira'],
  ], {
    bench: [[20, 'Emmanuel Ojeda'], [11, 'Agustín Urzi'], [9, 'Ramón Ábila'], [29, 'Hernán De La Fuente'], [2, 'Nicolás Goitea'], [32, 'Sebastián Meza'], [22, 'Daniel Zabala'], [36, 'Milton Ríos'], [21, 'Franco Watson'], [17, 'Gabriel Alanís'], [23, 'Víctor Cantillo'], [19, 'Leandro Lescano']],
    subs: [
      { minute: '67', out: 'Matko Miljevic', in: 'Emmanuel Ojeda' },
      { minute: '67', out: 'Rodrigo Cabral', in: 'Agustín Urzi' },
      { minute: '80', out: 'Leonardo Sequeira', in: 'Ramón Ábila' },
    ],
  }),

  '2025-04-30-newell-s-old-boys': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [17, 'Gabriel Alanís'], [26, 'Leonardo Sequeira'],
  ], {
    bench: [[43, 'Eric Ramírez'], [2, 'Nicolás Goitea'], [11, 'Agustín Urzi'], [9, 'Ramón Ábila'], [19, 'Leandro Lescano'], [20, 'Emmanuel Ojeda'], [16, 'Rodrigo Cabral'], [21, 'Franco Watson'], [29, 'Hernán De La Fuente'], [23, 'Víctor Cantillo'], [22, 'Daniel Zabala'], [32, 'Sebastián Meza']],
    subs: [
      { minute: '17', out: 'Leonardo Sequeira', in: 'Eric Ramírez' },
      { minute: '31', out: 'Fabio Pereyra', in: 'Nicolás Goitea' },
      { minute: '45', out: 'Gabriel Alanís', in: 'Agustín Urzi' },
      { minute: '45', out: 'Walter Mazzantti', in: 'Ramón Ábila' },
      { minute: '77', out: 'César Ibáñez', in: 'Leandro Lescano' },
    ],
  }),

  '2025-05-04-barracas-central': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [22, 'Daniel Zabala'], [29, 'Hernán De La Fuente'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [11, 'Agustín Urzi'], [16, 'Rodrigo Cabral'], [43, 'Eric Ramírez'],
  ], {
    bench: [[2, 'Nicolás Goitea'], [9, 'Ramón Ábila'], [18, 'Matko Miljevic'], [19, 'Leandro Lescano'], [7, 'Matías Tissera'], [33, 'Santiago Moya'], [17, 'Gabriel Alanís'], [32, 'Sebastián Meza'], [20, 'Emmanuel Ojeda'], [23, 'Víctor Cantillo'], [24, 'Tomás Guidara'], [21, 'Franco Watson']],
    subs: [
      { minute: '30', out: 'Daniel Zabala', in: 'Nicolás Goitea' },
      { minute: '45', out: 'Rodrigo Cabral', in: 'Ramón Ábila' },
      { minute: '59', out: 'Eric Ramírez', in: 'Matko Miljevic' },
      { minute: '77', out: 'César Ibáñez', in: 'Leandro Lescano' },
      { minute: '77', out: 'Agustín Urzi', in: 'Matías Tissera' },
    ],
  }),

  '2025-05-09-racing': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [11, 'Agustín Urzi'], [26, 'Leonardo Sequeira'],
  ], {
    bench: [[7, 'Matías Tissera'], [20, 'Emmanuel Ojeda'], [17, 'Gabriel Alanís'], [16, 'Rodrigo Cabral'], [23, 'Víctor Cantillo'], [33, 'Santiago Moya'], [2, 'Nicolás Goitea'], [19, 'Leandro Lescano'], [32, 'Sebastián Meza'], [9, 'Ramón Ábila'], [21, 'Franco Watson'], [29, 'Hernán De La Fuente']],
    subs: [
      { minute: '45', out: 'Walter Mazzantti', in: 'Matías Tissera' },
      { minute: '70', out: 'Agustín Urzi', in: 'Emmanuel Ojeda' },
      { minute: '85', out: 'Matko Miljevic', in: 'Gabriel Alanís' },
      { minute: '85', out: 'Leonardo Sequeira', in: 'Rodrigo Cabral' },
    ],
  }),

  '2025-05-12-deportivo-riestra': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [29, 'Hernán De La Fuente'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [8, 'Leonardo Gil'], [11, 'Agustín Urzi'], [43, 'Eric Ramírez'], [18, 'Matko Miljevic'], [26, 'Leonardo Sequeira'],
  ], {
    bench: [[5, 'Leonel Pérez'], [17, 'Gabriel Alanís'], [24, 'Tomás Guidara'], [2, 'Nicolás Goitea'], [7, 'Matías Tissera'], [33, 'Santiago Moya'], [21, 'Franco Watson'], [9, 'Ramón Ábila'], [19, 'Leandro Lescano'], [32, 'Sebastián Meza'], [23, 'Víctor Cantillo'], [16, 'Rodrigo Cabral']],
    subs: [
      { minute: '75', out: 'Eric Ramírez', in: 'Leonel Pérez' },
      { minute: '83', out: 'Agustín Urzi', in: 'Gabriel Alanís' },
      { minute: '83', out: 'Hernán De La Fuente', in: 'Tomás Guidara' },
      { minute: '88', out: 'Matko Miljevic', in: 'Nicolás Goitea' },
      { minute: '88', out: 'Leonardo Sequeira', in: 'Matías Tissera' },
    ],
  }),

  '2025-05-15-america-de-cali': eleven('4-4-2', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [5, 'Leonel Pérez'], [10, 'Walter Mazzantti'], [17, 'Gabriel Alanís'], [26, 'Leonardo Sequeira'], [8, 'Leonardo Gil'],
  ], {
    bench: [[18, 'Matko Miljevic'], [11, 'Agustín Urzi'], [2, 'Nicolás Goitea'], [7, 'Matías Tissera'], [33, 'Santiago Moya'], [23, 'Víctor Cantillo'], [19, 'Leandro Lescano'], [15, 'Agostino Spina'], [9, 'Ramón Ábila'], [32, 'Sebastián Meza'], [16, 'Rodrigo Cabral'], [29, 'Hernán De La Fuente']],
    subs: [
      { minute: '70', out: 'Emmanuel Ojeda', in: 'Matko Miljevic' },
      { minute: '70', out: 'Gabriel Alanís', in: 'Agustín Urzi' },
      { minute: '84', out: 'Walter Mazzantti', in: 'Nicolás Goitea' },
      { minute: '84', out: 'Leonardo Sequeira', in: 'Matías Tissera' },
    ],
  }),

  '2025-05-19-rosario-central': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [11, 'Agustín Urzi'], [43, 'Eric Ramírez'],
  ], {
    bench: [[26, 'Leonardo Sequeira'], [20, 'Emmanuel Ojeda'], [17, 'Gabriel Alanís'], [29, 'Hernán De La Fuente'], [19, 'Leandro Lescano'], [7, 'Matías Tissera'], [23, 'Víctor Cantillo'], [2, 'Nicolás Goitea'], [32, 'Sebastián Meza'], [9, 'Ramón Ábila'], [33, 'Santiago Moya'], [16, 'Rodrigo Cabral']],
    subs: [
      { minute: '64', out: 'Eric Ramírez', in: 'Leonardo Sequeira' },
      { minute: '68', out: 'Walter Mazzantti', in: 'Emmanuel Ojeda' },
      { minute: '79', out: 'Agustín Urzi', in: 'Gabriel Alanís' },
      { minute: '79', out: 'Tomás Guidara', in: 'Hernán De La Fuente' },
    ],
  }),

  '2025-05-24-independiente': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [11, 'Agustín Urzi'], [43, 'Eric Ramírez'],
  ], {
    bench: [[26, 'Leonardo Sequeira'], [17, 'Gabriel Alanís'], [9, 'Ramón Ábila'], [7, 'Matías Tissera'], [32, 'Sebastián Meza'], [16, 'Rodrigo Cabral'], [23, 'Víctor Cantillo'], [3, 'Lucas Carrizo'], [2, 'Nicolás Goitea'], [29, 'Hernán De La Fuente'], [20, 'Emmanuel Ojeda'], [19, 'Leandro Lescano']],
    subs: [
      { minute: '64', out: 'Eric Ramírez', in: 'Leonardo Sequeira' },
      { minute: '78', out: 'Agustín Urzi', in: 'Gabriel Alanís' },
    ],
  }),

  '2025-05-28-corinthians-sp': eleven('4-2-3-1', [
    [32, 'Sebastián Meza'],
    [6, 'Fabio Pereyra'], [2, 'Nicolás Goitea'], [29, 'Hernán De La Fuente'], [19, 'Leandro Lescano'], [5, 'Leonel Pérez'], [23, 'Víctor Cantillo'], [16, 'Rodrigo Cabral'], [21, 'Franco Watson'], [17, 'Gabriel Alanís'], [26, 'Leonardo Sequeira'],
  ], {
    bench: [[3, 'Lucas Carrizo'], [20, 'Emmanuel Ojeda'], [33, 'Santiago Moya'], [7, 'Matías Tissera'], [9, 'Ramón Ábila'], [1, 'Hernán Galíndez'], [24, 'Tomás Guidara'], [10, 'Walter Mazzantti'], [11, 'Agustín Urzi'], [31, 'Marco Pellegrino'], [18, 'Matko Miljevic'], [8, 'Leonardo Gil']],
    subs: [
      { minute: '23', out: 'Víctor Cantillo', in: 'Lucas Carrizo' },
      { minute: '45', out: 'Leonel Pérez', in: 'Emmanuel Ojeda' },
      { minute: '63', out: 'Fabio Pereyra', in: 'Santiago Moya' },
      { minute: '63', out: 'Leonardo Sequeira', in: 'Matías Tissera' },
      { minute: '76', out: 'Gabriel Alanís', in: 'Ramón Ábila' },
    ],
  }),

  '2025-06-01-platense': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [31, 'Marco Pellegrino'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [10, 'Walter Mazzantti'], [18, 'Matko Miljevic'], [11, 'Agustín Urzi'], [43, 'Eric Ramírez'],
  ], {
    bench: [[26, 'Leonardo Sequeira'], [17, 'Gabriel Alanís'], [29, 'Hernán De La Fuente'], [7, 'Matías Tissera'], [9, 'Ramón Ábila'], [21, 'Franco Watson'], [32, 'Sebastián Meza'], [2, 'Nicolás Goitea'], [16, 'Rodrigo Cabral'], [3, 'Lucas Carrizo'], [19, 'Leandro Lescano'], [20, 'Emmanuel Ojeda']],
    subs: [
      { minute: '45', out: 'Eric Ramírez', in: 'Leonardo Sequeira' },
      { minute: '58', out: 'Agustín Urzi', in: 'Gabriel Alanís' },
      { minute: '72', out: 'Tomás Guidara', in: 'Hernán De La Fuente' },
      { minute: '72', out: 'Leonel Pérez', in: 'Matías Tissera' },
      { minute: '83', out: 'Marco Pellegrino', in: 'Ramón Ábila' },
    ],
  }),

  '2025-07-04-instituto-de-cordoba': eleven('4-2-3-1', [
    [32, 'Sebastián Meza'],
    [6, 'Fabio Pereyra'], [2, 'Nicolás Goitea'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [26, 'Leonardo Sequeira'], [10, 'Matko Miljevic'], [17, 'Gabriel Alanís'], [43, 'Eric Ramírez'],
  ], {
    bench: [[7, 'Matías Tissera'], [11, 'Agustín Urzi'], [21, 'Juan Bisanz'], [33, 'Santiago Moya'], [3, 'Lucas Carrizo'], [20, 'Emmanuel Ojeda'], [36, 'Milton Ríos'], [29, 'Hernán De La Fuente'], [19, 'Leandro Lescano'], [16, 'Rodrigo Cabral'], [27, 'Nazareno Durán'], [9, 'Ramón Ábila']],
    subs: [
      { minute: '61', out: 'Eric Ramírez', in: 'Matías Tissera' },
      { minute: '81', out: 'Gabriel Alanís', in: 'Agustín Urzi' },
    ],
  }),

  '2025-07-12-belgrano-de-cordoba': eleven('4-2-3-1', [
    [32, 'Sebastián Meza'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [17, 'Gabriel Alanís'], [10, 'Matko Miljevic'], [26, 'Leonardo Sequeira'], [43, 'Eric Ramírez'],
  ], {
    bench: [[21, 'Juan Bisanz'], [11, 'Agustín Urzi'], [9, 'Ramón Ábila'], [38, 'Natanael Samaniego'], [29, 'Hernán De La Fuente'], [20, 'Emmanuel Ojeda'], [36, 'Milton Ríos'], [7, 'Matías Tissera'], [16, 'Rodrigo Cabral'], [19, 'Leandro Lescano'], [33, 'Santiago Moya'], [27, 'Nazareno Durán']],
    subs: [
      { minute: '55', out: 'Gabriel Alanís', in: 'Juan Bisanz' },
      { minute: '60', out: 'Matko Miljevic', in: 'Agustín Urzi' },
      { minute: '60', out: 'Eric Ramírez', in: 'Ramón Ábila' },
    ],
  }),

  '2025-07-22-estudiantes': eleven('4-2-3-1', [
    [32, 'Sebastián Meza'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [26, 'Leonardo Sequeira'], [10, 'Matko Miljevic'], [16, 'Rodrigo Cabral'], [43, 'Eric Ramírez'],
  ], {
    bench: [[21, 'Juan Bisanz'], [11, 'Agustín Urzi'], [29, 'Hernán De La Fuente'], [9, 'Ramón Ábila'], [19, 'Leandro Lescano'], [20, 'Emmanuel Ojeda'], [36, 'Milton Ríos'], [7, 'Matías Tissera'], [38, 'Natanael Samaniego'], [17, 'Gabriel Alanís'], [3, 'Lucas Carrizo'], [27, 'Nazareno Durán']],
    subs: [
      { minute: '69', out: 'Rodrigo Cabral', in: 'Juan Bisanz' },
      { minute: '69', out: 'Eric Ramírez', in: 'Agustín Urzi' },
      { minute: '77', out: 'Tomás Guidara', in: 'Hernán De La Fuente' },
      { minute: '89', out: 'Leonel Pérez', in: 'Ramón Ábila' },
    ],
  }),

  '2025-07-27-boca-juniors': eleven('4-2-3-1', [
    [32, 'Sebastián Meza'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [21, 'Juan Bisanz'], [10, 'Matko Miljevic'], [16, 'Rodrigo Cabral'], [7, 'Matías Tissera'],
  ], {
    bench: [[43, 'Eric Ramírez'], [20, 'Emmanuel Ojeda'], [29, 'Hernán De La Fuente'], [11, 'Agustín Urzi'], [46, 'Thaiel Peralta'], [19, 'Leandro Lescano'], [27, 'Nazareno Durán'], [17, 'Gabriel Alanís'], [2, 'Nicolás Goitea'], [9, 'Ramón Ábila'], [15, 'Hugo Nervo'], [3, 'Lucas Carrizo']],
    subs: [
      { minute: '71', out: 'Matías Tissera', in: 'Eric Ramírez' },
      { minute: '82', out: 'Juan Bisanz', in: 'Emmanuel Ojeda' },
      { minute: '90+3', out: 'Rodrigo Cabral', in: 'Hernán De La Fuente' },
      { minute: '90+3', out: 'Matko Miljevic', in: 'Agustín Urzi' },
    ],
  }),

  '2025-08-02-lanus': eleven('4-2-3-1', [
    [32, 'Sebastián Meza'],
    [15, 'Hugo Nervo'], [30, 'Nehuén Paz'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [3, 'Lucas Carrizo'], [26, 'Leonardo Sequeira'], [10, 'Matko Miljevic'], [16, 'Rodrigo Cabral'], [7, 'Matías Tissera'],
  ], {
    bench: [[23, 'Luciano Giménez'], [11, 'Agustín Urzi'], [43, 'Eric Ramírez'], [31, 'Facundo Waller'], [19, 'Leandro Lescano'], [27, 'Nazareno Durán'], [17, 'Gabriel Alanís'], [2, 'Nicolás Goitea'], [6, 'Fabio Pereyra'], [36, 'Milton Ríos'], [29, 'Hernán De La Fuente'], [9, 'Ramón Ábila']],
    subs: [
      { minute: '59', out: 'Matías Tissera', in: 'Luciano Giménez' },
      { minute: '59', out: 'Rodrigo Cabral', in: 'Agustín Urzi' },
      { minute: '73', out: 'Leonardo Sequeira', in: 'Eric Ramírez' },
      { minute: '73', out: 'Lucas Carrizo', in: 'Facundo Waller' },
    ],
  }),

  '2025-08-09-tigre': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [29, 'Hernán De La Fuente'], [19, 'Leandro Lescano'], [20, 'Emmanuel Ojeda'], [3, 'Lucas Carrizo'], [21, 'Juan Bisanz'], [8, 'Leonardo Gil'], [11, 'Agustín Urzi'], [23, 'Luciano Giménez'],
  ], {
    bench: [[17, 'Gabriel Alanís'], [26, 'Leonardo Sequeira'], [5, 'Leonel Pérez'], [7, 'Matías Tissera'], [15, 'Hugo Nervo'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [32, 'Sebastián Meza'], [31, 'Facundo Waller'], [2, 'Nicolás Goitea'], [9, 'Ramón Ábila'], [16, 'Rodrigo Cabral']],
    subs: [
      { minute: '68', out: 'Luciano Giménez', in: 'Gabriel Alanís' },
      { minute: '69', out: 'Agustín Urzi', in: 'Leonardo Sequeira' },
      { minute: '83', out: 'Lucas Carrizo', in: 'Leonel Pérez' },
      { minute: '83', out: 'Leonardo Sequeira', in: 'Matías Tissera' },
      { minute: '90+1', out: 'Leonardo Gil', in: 'Hugo Nervo' },
    ],
  }),

  '2025-08-13-once-caldas': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [5, 'Leonel Pérez'], [21, 'Juan Bisanz'], [8, 'Leonardo Gil'], [16, 'Rodrigo Cabral'], [7, 'Matías Tissera'],
  ], {
    bench: [[17, 'Gabriel Alanís'], [23, 'Luciano Giménez'], [11, 'Agustín Urzi'], [31, 'Facundo Waller'], [3, 'Lucas Carrizo'], [15, 'Hugo Nervo'], [29, 'Hernán De La Fuente'], [43, 'Eric Ramírez'], [9, 'Ramón Ábila'], [2, 'Nicolás Goitea'], [19, 'Leandro Lescano'], [32, 'Sebastián Meza']],
    subs: [
      { minute: '45', out: 'Rodrigo Cabral', in: 'Gabriel Alanís' },
      { minute: '45', out: 'Matías Tissera', in: 'Luciano Giménez' },
      { minute: '82', out: 'Juan Bisanz', in: 'Agustín Urzi' },
      { minute: '83', out: 'Leonardo Gil', in: 'Facundo Waller' },
      { minute: '89', out: 'Emmanuel Ojeda', in: 'Lucas Carrizo' },
    ],
  }),

  '2025-08-16-argentinos-juniors': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [15, 'Hugo Nervo'], [2, 'Nicolás Goitea'], [29, 'Hernán De La Fuente'], [19, 'Leandro Lescano'], [20, 'Emmanuel Ojeda'], [31, 'Facundo Waller'], [41, 'Lautaro Mora'], [8, 'Leonardo Gil'], [16, 'Rodrigo Cabral'], [43, 'Eric Ramírez'],
  ], {
    bench: [[11, 'Agustín Urzi'], [21, 'Juan Bisanz'], [23, 'Luciano Giménez'], [6, 'Fabio Pereyra'], [10, 'Matko Miljevic'], [5, 'Leonel Pérez'], [30, 'Nehuén Paz'], [17, 'Gabriel Alanís'], [24, 'Tomás Guidara'], [3, 'Lucas Carrizo'], [32, 'Sebastián Meza'], [7, 'Matías Tissera']],
    subs: [
      { minute: '45', out: 'Rodrigo Cabral', in: 'Agustín Urzi' },
      { minute: '59', out: 'Lautaro Mora', in: 'Juan Bisanz' },
      { minute: '59', out: 'Eric Ramírez', in: 'Luciano Giménez' },
      { minute: '60', out: 'Nicolás Goitea', in: 'Fabio Pereyra' },
      { minute: '71', out: 'Facundo Waller', in: 'Matko Miljevic' },
    ],
  }),

  '2025-08-20-once-caldas': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [21, 'Juan Bisanz'], [18, 'Matko Miljevic'], [16, 'Rodrigo Cabral'], [23, 'Luciano Giménez'],
  ], {
    bench: [[7, 'Matías Tissera'], [15, 'Hugo Nervo'], [11, 'Agustín Urzi'], [43, 'Eric Ramírez'], [19, 'Leandro Lescano'], [41, 'Lautaro Mora'], [29, 'Hernán De La Fuente'], [17, 'Gabriel Alanís'], [31, 'Facundo Waller'], [2, 'Nicolás Goitea'], [32, 'Sebastián Meza'], [20, 'Emmanuel Ojeda']],
    subs: [
      { minute: '45', out: 'Rodrigo Cabral', in: 'Matías Tissera' },
      { minute: '60', out: 'Nehuén Paz', in: 'Hugo Nervo' },
      { minute: '79', out: 'César Ibáñez', in: 'Agustín Urzi' },
      { minute: '88', out: 'Tomás Guidara', in: 'Eric Ramírez' },
    ],
  }),

  '2025-08-24-union-de-santa-fe': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [15, 'Hugo Nervo'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [21, 'Juan Bisanz'], [10, 'Matko Miljevic'], [16, 'Rodrigo Cabral'], [23, 'Luciano Giménez'],
  ], {
    bench: [[20, 'Emmanuel Ojeda'], [43, 'Eric Ramírez'], [17, 'Gabriel Alanís'], [2, 'Nicolás Goitea'], [11, 'Agustín Urzi'], [9, 'Ramón Ábila'], [38, 'Natanael Samaniego'], [7, 'Matías Tissera'], [29, 'Hernán De La Fuente'], [31, 'Facundo Waller'], [19, 'Leandro Lescano'], [32, 'Sebastián Meza']],
    subs: [
      { minute: '73', out: 'Matko Miljevic', in: 'Emmanuel Ojeda' },
      { minute: '73', out: 'Luciano Giménez', in: 'Eric Ramírez' },
      { minute: '74', out: 'Juan Bisanz', in: 'Gabriel Alanís' },
      { minute: '87', out: 'Rodrigo Cabral', in: 'Nicolás Goitea' },
    ],
  }),

  '2025-08-30-san-lorenzo': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [2, 'Nicolás Goitea'], [15, 'Hugo Nervo'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [21, 'Juan Bisanz'], [10, 'Matko Miljevic'], [16, 'Rodrigo Cabral'], [23, 'Luciano Giménez'],
  ], {
    bench: [[17, 'Gabriel Alanís'], [7, 'Matías Tissera'], [11, 'Agustín Urzi'], [20, 'Emmanuel Ojeda'], [38, 'Natanael Samaniego'], [9, 'Ramón Ábila'], [32, 'Sebastián Meza'], [29, 'Hernán De La Fuente'], [43, 'Eric Ramírez'], [19, 'Leandro Lescano'], [31, 'Facundo Waller'], [3, 'Lucas Carrizo']],
    subs: [
      { minute: '70', out: 'Rodrigo Cabral', in: 'Gabriel Alanís' },
      { minute: '71', out: 'Matko Miljevic', in: 'Matías Tissera' },
      { minute: '71', out: 'Juan Bisanz', in: 'Agustín Urzi' },
      { minute: '84', out: 'Leonardo Gil', in: 'Emmanuel Ojeda' },
    ],
  }),

  '2025-09-13-velez-sarsfield': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [15, 'Hugo Nervo'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [21, 'Juan Bisanz'], [10, 'Matko Miljevic'], [16, 'Rodrigo Cabral'], [43, 'Eric Ramírez'],
  ], {
    bench: [[11, 'Agustín Urzi'], [9, 'Ramón Ábila'], [26, 'Leonardo Sequeira'], [19, 'Leandro Lescano'], [17, 'Gabriel Alanís'], [2, 'Nicolás Goitea'], [29, 'Hernán De La Fuente'], [28, 'Luca Babino'], [38, 'Natanael Samaniego'], [20, 'Emmanuel Ojeda'], [31, 'Facundo Waller'], [32, 'Sebastián Meza']],
    subs: [
      { minute: '45', out: 'Rodrigo Cabral', in: 'Agustín Urzi' },
      { minute: '58', out: 'Eric Ramírez', in: 'Ramón Ábila' },
      { minute: '67', out: 'Juan Bisanz', in: 'Leonardo Sequeira' },
    ],
  }),

  '2025-09-20-racing-club': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [15, 'Hugo Nervo'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [8, 'Leonardo Gil'], [21, 'Juan Bisanz'], [10, 'Matko Miljevic'], [11, 'Agustín Urzi'], [26, 'Leonardo Sequeira'],
  ], {
    bench: [[20, 'Emmanuel Ojeda'], [17, 'Gabriel Alanís'], [43, 'Eric Ramírez'], [9, 'Ramón Ábila'], [41, 'Lautaro Mora'], [2, 'Nicolás Goitea'], [31, 'Facundo Waller'], [19, 'Leandro Lescano'], [32, 'Sebastián Meza'], [29, 'Hernán De La Fuente'], [16, 'Rodrigo Cabral'], [30, 'Nehuén Paz']],
    subs: [
      { minute: '45', out: 'Leonel Pérez', in: 'Emmanuel Ojeda' },
      { minute: '66', out: 'Agustín Urzi', in: 'Gabriel Alanís' },
      { minute: '76', out: 'Leonardo Gil', in: 'Eric Ramírez' },
      { minute: '76', out: 'Leonardo Sequeira', in: 'Ramón Ábila' },
    ],
  }),

  '2025-09-29-independiente-rivadavia': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [8, 'Leonardo Gil'], [26, 'Leonardo Sequeira'], [10, 'Matko Miljevic'], [21, 'Juan Bisanz'], [23, 'Luciano Giménez'],
  ], {
    bench: [[19, 'Leandro Lescano'], [11, 'Agustín Urzi'], [16, 'Rodrigo Cabral'], [7, 'Matías Tissera'], [31, 'Facundo Waller'], [17, 'Gabriel Alanís'], [34, 'Ignacio Campo'], [43, 'Eric Ramírez'], [15, 'Hugo Nervo'], [36, 'Milton Ríos'], [2, 'Nicolás Goitea'], [32, 'Sebastián Meza']],
    subs: [
      { minute: '72', out: 'César Ibáñez', in: 'Leandro Lescano' },
      { minute: '72', out: 'Leonardo Sequeira', in: 'Agustín Urzi' },
      { minute: '90', out: 'Juan Bisanz', in: 'Rodrigo Cabral' },
      { minute: '90+1', out: 'Luciano Giménez', in: 'Matías Tissera' },
      { minute: '90+1', out: 'Matko Miljevic', in: 'Facundo Waller' },
    ],
  }),

  '2025-10-05-banfield': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [8, 'Leonardo Gil'], [21, 'Juan Bisanz'], [10, 'Matko Miljevic'], [16, 'Rodrigo Cabral'], [23, 'Luciano Giménez'],
  ], {
    bench: [[31, 'Facundo Waller'], [11, 'Agustín Urzi'], [3, 'Lucas Carrizo'], [46, 'Thaiel Peralta'], [7, 'Matías Tissera'], [32, 'Sebastián Meza'], [19, 'Leandro Lescano'], [2, 'Nicolás Goitea'], [29, 'Hernán De La Fuente'], [15, 'Hugo Nervo'], [43, 'Eric Ramírez'], [17, 'Gabriel Alanís']],
    subs: [
      { minute: '45', out: 'Rodrigo Cabral', in: 'Facundo Waller' },
      { minute: '64', out: 'Leonardo Gil', in: 'Agustín Urzi' },
      { minute: '85', out: 'Matko Miljevic', in: 'Lucas Carrizo' },
      { minute: '85', out: 'Juan Bisanz', in: 'Thaiel Peralta' },
      { minute: '88', out: 'Luciano Giménez', in: 'Matías Tissera' },
    ],
  }),

  '2025-10-12-aldosivi': eleven('4-2-3-1', [
    [32, 'Sebastián Meza'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [8, 'Leonardo Gil'], [21, 'Juan Bisanz'], [10, 'Matko Miljevic'], [16, 'Rodrigo Cabral'], [23, 'Luciano Giménez'],
  ], {
    bench: [[11, 'Agustín Urzi'], [43, 'Eric Ramírez'], [29, 'Hernán De La Fuente'], [46, 'Thaiel Peralta'], [27, 'Nazareno Durán'], [31, 'Facundo Waller'], [17, 'Gabriel Alanís'], [19, 'Leandro Lescano'], [7, 'Matías Tissera'], [15, 'Hugo Nervo'], [3, 'Lucas Carrizo'], [9, 'Ramón Ábila']],
    subs: [
      { minute: '55', out: 'Rodrigo Cabral', in: 'Agustín Urzi' },
      { minute: '66', out: 'Juan Bisanz', in: 'Eric Ramírez' },
      { minute: '83', out: 'Tomás Guidara', in: 'Hernán De La Fuente' },
      { minute: '83', out: 'Leonardo Gil', in: 'Thaiel Peralta' },
    ],
  }),

  '2025-10-23-central-cordoba-sde': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [31, 'Facundo Waller'], [21, 'Juan Bisanz'], [10, 'Matko Miljevic'], [11, 'Agustín Urzi'], [23, 'Luciano Giménez'],
  ], {
    bench: [[26, 'Leonardo Sequeira'], [46, 'Thaiel Peralta'], [19, 'Leandro Lescano'], [7, 'Matías Tissera'], [43, 'Eric Ramírez'], [3, 'Lucas Carrizo'], [32, 'Sebastián Meza'], [2, 'Nicolás Goitea'], [29, 'Hernán De La Fuente'], [5, 'Leonel Pérez'], [15, 'Hugo Nervo'], [16, 'Rodrigo Cabral']],
    subs: [
      { minute: '45', out: 'Agustín Urzi', in: 'Leonardo Sequeira' },
      { minute: '61', out: 'Juan Bisanz', in: 'Thaiel Peralta' },
      { minute: '73', out: 'César Ibáñez', in: 'Leandro Lescano' },
      { minute: '73', out: 'Emmanuel Ojeda', in: 'Matías Tissera' },
    ],
  }),

  '2025-11-03-defensa-y-justicia': eleven('4-3-1-2', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [29, 'Hernán De La Fuente'], [25, 'César Ibáñez'], [5, 'Leonel Pérez'], [20, 'Emmanuel Ojeda'], [31, 'Facundo Waller'], [10, 'Matko Miljevic'], [26, 'Leonardo Sequeira'], [23, 'Luciano Giménez'],
  ], {
    bench: [[21, 'Juan Bisanz'], [24, 'Tomás Guidara'], [19, 'Leandro Lescano'], [43, 'Eric Ramírez'], [3, 'Lucas Carrizo'], [9, 'Ramón Ábila'], [15, 'Hugo Nervo'], [2, 'Nicolás Goitea'], [32, 'Sebastián Meza'], [7, 'Matías Tissera'], [41, 'Lautaro Mora'], [11, 'Agustín Urzi']],
    subs: [
      { minute: '59', out: 'Emmanuel Ojeda', in: 'Juan Bisanz' },
      { minute: '59', out: 'Hernán De La Fuente', in: 'Tomás Guidara' },
      { minute: '64', out: 'César Ibáñez', in: 'Leandro Lescano' },
      { minute: '64', out: 'Leonardo Sequeira', in: 'Eric Ramírez' },
      { minute: '83', out: 'Matko Miljevic', in: 'Lucas Carrizo' },
    ],
  }),

  '2025-11-08-newell-s-old-boys': eleven('4-3-3', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [24, 'Tomás Guidara'], [19, 'Leandro Lescano'], [20, 'Emmanuel Ojeda'], [31, 'Facundo Waller'], [5, 'Leonel Pérez'], [26, 'Leonardo Sequeira'], [10, 'Matko Miljevic'], [23, 'Luciano Giménez'],
  ], {
    bench: [[21, 'Juan Bisanz'], [43, 'Eric Ramírez'], [8, 'Leonardo Gil'], [9, 'Ramón Ábila'], [46, 'Thaiel Peralta'], [29, 'Hernán De La Fuente'], [7, 'Matías Tissera'], [2, 'Nicolás Goitea'], [32, 'Sebastián Meza'], [15, 'Hugo Nervo'], [3, 'Lucas Carrizo'], [41, 'Lautaro Mora']],
    subs: [
      { minute: '45', out: 'Leonel Pérez', in: 'Juan Bisanz' },
      { minute: '45', out: 'Leonardo Sequeira', in: 'Eric Ramírez' },
      { minute: '62', out: 'Luciano Giménez', in: 'Leonardo Gil' },
      { minute: '62', out: 'Facundo Waller', in: 'Ramón Ábila' },
      { minute: '80', out: 'Tomás Guidara', in: 'Thaiel Peralta' },
    ],
  }),

  '2025-11-17-barracas-central': eleven('4-2-3-1', [
    [32, 'Sebastián Meza'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [24, 'Tomás Guidara'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [31, 'Facundo Waller'], [43, 'Eric Ramírez'], [10, 'Matko Miljevic'], [21, 'Juan Bisanz'], [23, 'Luciano Giménez'],
  ], {
    bench: [[26, 'Leonardo Sequeira'], [8, 'Leonardo Gil'], [19, 'Leandro Lescano'], [46, 'Thaiel Peralta'], [7, 'Matías Tissera'], [9, 'Ramón Ábila'], [3, 'Lucas Carrizo'], [2, 'Nicolás Goitea'], [29, 'Hernán De La Fuente'], [27, 'Nazareno Durán'], [15, 'Hugo Nervo'], [5, 'Leonel Pérez']],
    subs: [
      { minute: '51', out: 'Juan Bisanz', in: 'Leonardo Sequeira' },
      { minute: '63', out: 'Matko Miljevic', in: 'Leonardo Gil' },
      { minute: '63', out: 'Eric Ramírez', in: 'Leandro Lescano' },
      { minute: '88', out: 'Facundo Waller', in: 'Thaiel Peralta' },
      { minute: '88', out: 'Luciano Giménez', in: 'Matías Tissera' },
    ],
  }),

  '2026-01-23-banfield': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [4, 'Federico Vera'], [19, 'Leandro Lescano'], [20, 'Emmanuel Ojeda'], [15, 'Facundo Waller'], [10, 'Thaiel Peralta'], [8, 'Leonardo Gil'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[25, 'César Ibáñez'], [11, 'Eric Ramírez'], [26, 'Leonardo Sequeira'], [21, 'Hugo Nervo'], [34, 'Ignacio Campo'], [32, 'Sebastián Meza'], [41, 'Lautaro Mora'], [28, 'Luca Babino'], [17, 'Juan Bisanz'], [5, 'Leonel Pérez'], [3, 'Lucas Carrizo'], [18, 'Luciano Giménez']],
    subs: [
      { minute: '71', out: 'Leandro Lescano', in: 'César Ibáñez' },
      { minute: '71', out: 'Óscar Cortés', in: 'Eric Ramírez' },
      { minute: '80', out: 'Federico Vera', in: 'Leonardo Sequeira' },
    ],
  }),

  '2026-01-28-independiente-rivadavia': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [4, 'Federico Vera'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [15, 'Facundo Waller'], [17, 'Juan Bisanz'], [8, 'Leonardo Gil'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[3, 'Lucas Carrizo'], [14, 'Silvio Martínez'], [18, 'Luciano Giménez'], [11, 'Eric Ramírez'], [26, 'Leonardo Sequeira'], [41, 'Lautaro Mora'], [28, 'Luca Babino'], [19, 'Leandro Lescano'], [52, 'Facundo Kalinger'], [21, 'Hugo Nervo'], [32, 'Sebastián Meza'], [34, 'Ignacio Campo']],
    subs: [
      { minute: '41', out: 'Nehuén Paz', in: 'Lucas Carrizo' },
      { minute: '65', out: 'Juan Bisanz', in: 'Silvio Martínez' },
      { minute: '82', out: 'Facundo Waller', in: 'Luciano Giménez' },
      { minute: '82', out: 'César Ibáñez', in: 'Eric Ramírez' },
    ],
  }),

  '2026-02-01-atletico-tucuman': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [3, 'Lucas Carrizo'], [4, 'Federico Vera'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [8, 'Leonardo Gil'], [14, 'Silvio Martínez'], [11, 'Eric Ramírez'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[17, 'Juan Bisanz'], [15, 'Facundo Waller'], [41, 'Lautaro Mora'], [21, 'Hugo Nervo'], [26, 'Leonardo Sequeira'], [19, 'Leandro Lescano'], [28, 'Luca Babino'], [34, 'Ignacio Campo'], [52, 'Facundo Kalinger'], [32, 'Sebastián Meza'], [18, 'Luciano Giménez']],
    subs: [
      { minute: '55', out: 'Eric Ramírez', in: 'Juan Bisanz' },
      { minute: '55', out: 'Leonardo Gil', in: 'Facundo Waller' },
      { minute: '71', out: 'Silvio Martínez', in: 'Lautaro Mora' },
      { minute: '71', out: 'César Ibáñez', in: 'Hugo Nervo' },
      { minute: '85', out: 'Óscar Cortés', in: 'Leonardo Sequeira' },
    ],
  }),

  '2026-02-08-san-lorenzo': eleven('4-3-3', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [3, 'Lucas Carrizo'], [4, 'Federico Vera'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [8, 'Leonardo Gil'], [15, 'Facundo Waller'], [14, 'Silvio Martínez'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[17, 'Juan Bisanz'], [21, 'Hugo Nervo'], [41, 'Lautaro Mora'], [18, 'Luciano Giménez'], [52, 'Facundo Kalinger'], [10, 'Thaiel Peralta'], [11, 'Eric Ramírez'], [30, 'Nehuén Paz'], [19, 'Leandro Lescano'], [32, 'Sebastián Meza'], [34, 'Ignacio Campo'], [26, 'Leonardo Sequeira']],
    subs: [
      { minute: '74', out: 'Óscar Cortés', in: 'Juan Bisanz' },
      { minute: '74', out: 'Silvio Martínez', in: 'Hugo Nervo' },
      { minute: '84', out: 'Emmanuel Ojeda', in: 'Lautaro Mora' },
      { minute: '90+3', out: 'Jordy Caicedo', in: 'Luciano Giménez' },
      { minute: '90+3', out: 'Leonardo Gil', in: 'Facundo Kalinger' },
    ],
  }),

  '2026-02-14-sarmiento-de-junin': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [3, 'Lucas Carrizo'], [4, 'Federico Vera'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [15, 'Facundo Waller'], [7, 'Óscar Cortés'], [8, 'Leonardo Gil'], [14, 'Silvio Martínez'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[17, 'Juan Bisanz'], [26, 'Leonardo Sequeira'], [41, 'Lautaro Mora'], [18, 'Luciano Giménez'], [21, 'Hugo Nervo'], [10, 'Thaiel Peralta'], [19, 'Leandro Lescano'], [30, 'Nehuén Paz'], [52, 'Facundo Kalinger'], [34, 'Ignacio Campo'], [11, 'Eric Ramírez'], [32, 'Sebastián Meza']],
    subs: [
      { minute: '62', out: 'Silvio Martínez', in: 'Juan Bisanz' },
      { minute: '83', out: 'Óscar Cortés', in: 'Leonardo Sequeira' },
      { minute: '84', out: 'Emmanuel Ojeda', in: 'Lautaro Mora' },
      { minute: '90+2', out: 'Jordy Caicedo', in: 'Luciano Giménez' },
      { minute: '90+2', out: 'Leonardo Gil', in: 'Hugo Nervo' },
    ],
  }),

  '2026-02-21-deportivo-riestra': eleven('3-4-3', [
    [1, 'Hernán Galíndez'],
    [21, 'Hugo Nervo'], [6, 'Fabio Pereyra'], [3, 'Lucas Carrizo'], [15, 'Facundo Waller'], [8, 'Leonardo Gil'], [20, 'Emmanuel Ojeda'], [25, 'César Ibáñez'], [14, 'Silvio Martínez'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[34, 'Ignacio Campo'], [19, 'Leandro Lescano'], [18, 'Luciano Giménez'], [26, 'Leonardo Sequeira'], [23, 'Thaiel Peralta'], [10, 'Óscar Romero'], [41, 'Lautaro Mora'], [52, 'Facundo Kalinger'], [17, 'Juan Bisanz'], [11, 'Eric Ramírez'], [32, 'Sebastián Meza'], [30, 'Nehuén Paz']],
    subs: [
      { minute: '55', out: 'Óscar Cortés', in: 'Ignacio Campo' },
      { minute: '55', out: 'Silvio Martínez', in: 'Leandro Lescano' },
      { minute: '87', out: 'Leonardo Gil', in: 'Luciano Giménez' },
      { minute: '87', out: 'Jordy Caicedo', in: 'Leonardo Sequeira' },
    ],
  }),

  '2026-02-26-estudiantes-de-rio-cuarto': eleven('4-3-1-2', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [34, 'Ignacio Campo'], [19, 'Leandro Lescano'], [15, 'Facundo Waller'], [20, 'Emmanuel Ojeda'], [8, 'Leonardo Gil'], [23, 'Thaiel Peralta'], [9, 'Jordy Caicedo'], [7, 'Óscar Cortés'],
  ], {
    bench: [[3, 'Lucas Carrizo'], [11, 'Eric Ramírez'], [10, 'Óscar Romero'], [14, 'Silvio Martínez'], [26, 'Leonardo Sequeira'], [21, 'Hugo Nervo'], [37, 'Thiago Pérez'], [17, 'Juan Bisanz'], [41, 'Lautaro Mora'], [32, 'Sebastián Meza'], [18, 'Luciano Giménez'], [52, 'Facundo Kalinger']],
    subs: [
      { minute: '35', out: 'Thaiel Peralta', in: 'Lucas Carrizo' },
      { minute: '59', out: 'Óscar Cortés', in: 'Eric Ramírez' },
      { minute: '59', out: 'Facundo Waller', in: 'Óscar Romero' },
      { minute: '74', out: 'Ignacio Campo', in: 'Silvio Martínez' },
      { minute: '74', out: 'Nehuén Paz', in: 'Leonardo Sequeira' },
    ],
  }),

  '2026-03-03-belgrano-de-cordoba': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [3, 'Lucas Carrizo'], [34, 'Ignacio Campo'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [8, 'Leonardo Gil'], [23, 'Thaiel Peralta'], [10, 'Óscar Romero'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[15, 'Facundo Waller'], [17, 'Juan Bisanz'], [21, 'Hugo Nervo'], [41, 'Lautaro Mora'], [26, 'Leonardo Sequeira'], [18, 'Luciano Giménez'], [14, 'Silvio Martínez'], [11, 'Eric Ramírez'], [35, 'Máximo Palazzo'], [32, 'Sebastián Meza'], [30, 'Nehuén Paz'], [52, 'Facundo Kalinger']],
    subs: [
      { minute: '58', out: 'Emmanuel Ojeda', in: 'Facundo Waller' },
      { minute: '76', out: 'Óscar Romero', in: 'Juan Bisanz' },
      { minute: '76', out: 'Thaiel Peralta', in: 'Hugo Nervo' },
      { minute: '82', out: 'Facundo Waller', in: 'Lautaro Mora' },
      { minute: '82', out: 'Óscar Cortés', in: 'Leonardo Sequeira' },
    ],
  }),

  '2026-03-13-river-plate': eleven('4-4-2', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [3, 'Lucas Carrizo'], [34, 'Ignacio Campo'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [8, 'Leonardo Gil'], [23, 'Thaiel Peralta'], [14, 'Silvio Martínez'], [10, 'Óscar Romero'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[17, 'Juan Bisanz'], [2, 'Lucas Blondel'], [18, 'Luciano Giménez'], [26, 'Leonardo Sequeira'], [11, 'Eric Ramírez'], [41, 'Lautaro Mora'], [32, 'Sebastián Meza'], [30, 'Nehuén Paz'], [52, 'Facundo Kalinger'], [19, 'Leandro Lescano'], [21, 'Hugo Nervo'], [28, 'Luca Babino']],
    subs: [
      { minute: '55', out: 'Silvio Martínez', in: 'Juan Bisanz' },
      { minute: '74', out: 'Thaiel Peralta', in: 'Lucas Blondel' },
      { minute: '74', out: 'Jordy Caicedo', in: 'Luciano Giménez' },
      { minute: '90', out: 'Óscar Romero', in: 'Leonardo Sequeira' },
    ],
  }),

  '2026-03-16-aldosivi': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [30, 'Nehuén Paz'], [2, 'Lucas Blondel'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [8, 'Leonardo Gil'], [23, 'Thaiel Peralta'], [10, 'Óscar Romero'], [17, 'Juan Bisanz'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[26, 'Leonardo Sequeira'], [15, 'Facundo Waller'], [14, 'Silvio Martínez'], [41, 'Lautaro Mora'], [11, 'Eric Ramírez'], [35, 'Máximo Palazzo'], [18, 'Luciano Giménez'], [19, 'Leandro Lescano'], [21, 'Hugo Nervo'], [52, 'Facundo Kalinger'], [34, 'Ignacio Campo'], [32, 'Sebastián Meza']],
    subs: [
      { minute: '61', out: 'Thaiel Peralta', in: 'Leonardo Sequeira' },
      { minute: '61', out: 'Emmanuel Ojeda', in: 'Facundo Waller' },
      { minute: '74', out: 'Juan Bisanz', in: 'Silvio Martínez' },
      { minute: '82', out: 'Leonardo Gil', in: 'Lautaro Mora' },
      { minute: '82', out: 'Óscar Romero', in: 'Eric Ramírez' },
    ],
  }),

  '2026-03-24-barracas-central': eleven('4-2-3-1', [
    [32, 'Sebastián Meza'],
    [6, 'Fabio Pereyra'], [35, 'Máximo Palazzo'], [34, 'Ignacio Campo'], [25, 'César Ibáñez'], [8, 'Leonardo Gil'], [15, 'Facundo Waller'], [2, 'Lucas Blondel'], [10, 'Óscar Romero'], [23, 'Thaiel Peralta'], [18, 'Luciano Giménez'],
  ], {
    bench: [[7, 'Óscar Cortés'], [26, 'Leonardo Sequeira'], [14, 'Silvio Martínez'], [11, 'Eric Ramírez'], [17, 'Juan Bisanz'], [21, 'Hugo Nervo'], [4, 'Federico Vera'], [30, 'Nehuén Paz'], [52, 'Facundo Kalinger'], [19, 'Leandro Lescano'], [27, 'Nazareno Durán'], [20, 'Emmanuel Ojeda']],
    subs: [
      { minute: '56', out: 'Óscar Romero', in: 'Óscar Cortés' },
      { minute: '69', out: 'Ignacio Campo', in: 'Leonardo Sequeira' },
      { minute: '78', out: 'Thaiel Peralta', in: 'Silvio Martínez' },
      { minute: '78', out: 'Luciano Giménez', in: 'Eric Ramírez' },
    ],
  }),

  '2026-03-29-olimpo-de-bahia-blanca': eleven('4-3-1-2', [
    [32, 'Sebastián Meza'],
    [6, 'Fabio Pereyra'], [35, 'Máximo Palazzo'], [34, 'Ignacio Campo'], [25, 'César Ibáñez'], [15, 'Facundo Waller'], [2, 'Lucas Blondel'], [10, 'Óscar Romero'], [52, 'Facundo Kalinger'], [26, 'Leonardo Sequeira'], [7, 'Óscar Cortés'],
  ], {
    bench: [[8, 'Leonardo Gil'], [14, 'Silvio Martínez'], [20, 'Emmanuel Ojeda'], [11, 'Eric Ramírez'], [19, 'Leandro Lescano'], [21, 'Hugo Nervo'], [17, 'Juan Bisanz'], [18, 'Luciano Giménez'], [27, 'Nazareno Durán'], [3, 'Lucas Carrizo'], [23, 'Thaiel Peralta'], [4, 'Federico Vera']],
    subs: [
      { minute: '61', out: 'Ignacio Campo', in: 'Leonardo Gil' },
      { minute: '61', out: 'Facundo Kalinger', in: 'Silvio Martínez' },
      { minute: '75', out: 'Óscar Romero', in: 'Emmanuel Ojeda' },
      { minute: '75', out: 'Leonardo Sequeira', in: 'Eric Ramírez' },
      { minute: '83', out: 'César Ibáñez', in: 'Leandro Lescano' },
    ],
  }),

  '2026-04-05-gimnasia-de-la-plata': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [35, 'Máximo Palazzo'], [34, 'Ignacio Campo'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [15, 'Facundo Waller'], [2, 'Lucas Blondel'], [10, 'Óscar Romero'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[8, 'Leonardo Gil'], [17, 'Juan Bisanz'], [4, 'Federico Vera'], [11, 'Eric Ramírez'], [52, 'Facundo Kalinger'], [26, 'Leonardo Sequeira'], [23, 'Thaiel Peralta'], [3, 'Lucas Carrizo'], [21, 'Hugo Nervo'], [32, 'Sebastián Meza'], [19, 'Leandro Lescano'], [14, 'Silvio Martínez']],
    subs: [
      { minute: '60', out: 'Óscar Romero', in: 'Leonardo Gil' },
      { minute: '80', out: 'Óscar Cortés', in: 'Juan Bisanz' },
      { minute: '80', out: 'Ignacio Campo', in: 'Federico Vera' },
      { minute: '87', out: 'Jordy Caicedo', in: 'Eric Ramírez' },
      { minute: '88', out: 'Facundo Waller', in: 'Facundo Kalinger' },
    ],
  }),

  '2026-04-12-rosario-central': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [35, 'Máximo Palazzo'], [34, 'Ignacio Campo'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [15, 'Facundo Waller'], [2, 'Lucas Blondel'], [10, 'Óscar Romero'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[17, 'Juan Bisanz'], [52, 'Facundo Kalinger'], [8, 'Leonardo Gil'], [3, 'Lucas Carrizo'], [21, 'Hugo Nervo'], [11, 'Eric Ramírez'], [26, 'Leonardo Sequeira'], [4, 'Federico Vera'], [19, 'Leandro Lescano'], [32, 'Sebastián Meza'], [23, 'Thaiel Peralta'], [14, 'Silvio Martínez']],
    subs: [
      { minute: '59', out: 'Óscar Romero', in: 'Juan Bisanz' },
      { minute: '59', out: 'Ignacio Campo', in: 'Facundo Kalinger' },
      { minute: '66', out: 'Emmanuel Ojeda', in: 'Leonardo Gil' },
      { minute: '88', out: 'Facundo Waller', in: 'Lucas Carrizo' },
      { minute: '88', out: 'Óscar Cortés', in: 'Hugo Nervo' },
    ],
  }),

  '2026-04-21-tigre': eleven('4-1-4-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [35, 'Máximo Palazzo'], [2, 'Lucas Blondel'], [25, 'César Ibáñez'], [3, 'Lucas Carrizo'], [15, 'Facundo Waller'], [8, 'Leonardo Gil'], [52, 'Facundo Kalinger'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[17, 'Juan Bisanz'], [10, 'Óscar Romero'], [23, 'Thaiel Peralta'], [32, 'Sebastián Meza'], [20, 'Emmanuel Ojeda'], [21, 'Hugo Nervo'], [34, 'Ignacio Campo'], [19, 'Leandro Lescano'], [11, 'Eric Ramírez'], [14, 'Silvio Martínez'], [26, 'Leonardo Sequeira'], [41, 'Lautaro Mora']],
    subs: [
      { minute: '58', out: 'Máximo Palazzo', in: 'Juan Bisanz' },
      { minute: '74', out: 'Facundo Kalinger', in: 'Óscar Romero' },
      { minute: '90+1', out: 'Óscar Cortés', in: 'Thaiel Peralta' },
    ],
  }),

  '2026-04-28-argentinos-juniors': eleven('4-3-3', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [35, 'Máximo Palazzo'], [2, 'Lucas Blondel'], [25, 'César Ibáñez'], [8, 'Leonardo Gil'], [15, 'Facundo Waller'], [3, 'Lucas Carrizo'], [17, 'Juan Bisanz'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[20, 'Emmanuel Ojeda'], [23, 'Thaiel Peralta'], [11, 'Eric Ramírez'], [10, 'Óscar Romero'], [26, 'Leonardo Sequeira'], [32, 'Sebastián Meza'], [30, 'Nehuén Paz'], [14, 'Silvio Martínez'], [34, 'Ignacio Campo'], [21, 'Hugo Nervo'], [52, 'Facundo Kalinger'], [19, 'Leandro Lescano']],
    subs: [
      { minute: '45', out: 'Máximo Palazzo', in: 'Emmanuel Ojeda' },
      { minute: '72', out: 'Juan Bisanz', in: 'Thaiel Peralta' },
      { minute: '84', out: 'Facundo Waller', in: 'Eric Ramírez' },
      { minute: '84', out: 'Leonardo Gil', in: 'Óscar Romero' },
      { minute: '84', out: 'Óscar Cortés', in: 'Leonardo Sequeira' },
    ],
  }),

  '2026-05-03-racing-club': eleven('4-4-2', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [3, 'Lucas Carrizo'], [34, 'Ignacio Campo'], [19, 'Leandro Lescano'], [10, 'Óscar Romero'], [15, 'Facundo Waller'], [2, 'Lucas Blondel'], [7, 'Óscar Cortés'], [23, 'Thaiel Peralta'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[52, 'Facundo Kalinger'], [35, 'Máximo Palazzo'], [17, 'Juan Bisanz'], [8, 'Leonardo Gil'], [11, 'Eric Ramírez'], [14, 'Silvio Martínez'], [4, 'Federico Vera'], [32, 'Sebastián Meza'], [26, 'Leonardo Sequeira'], [21, 'Hugo Nervo'], [41, 'Lautaro Mora'], [20, 'Emmanuel Ojeda']],
    subs: [
      { minute: '45', out: 'Óscar Cortés', in: 'Facundo Kalinger' },
      { minute: '45', out: 'Leandro Lescano', in: 'Máximo Palazzo' },
      { minute: '64', out: 'Thaiel Peralta', in: 'Juan Bisanz' },
      { minute: '64', out: 'Óscar Romero', in: 'Leonardo Gil' },
      { minute: '90+3', out: 'Jordy Caicedo', in: 'Eric Ramírez' },
    ],
  }),

  '2026-05-10-boca-juniors': eleven('4-4-1-1', [
    [1, 'Hernán Galíndez'],
    [6, 'Fabio Pereyra'], [3, 'Lucas Carrizo'], [34, 'Ignacio Campo'], [25, 'César Ibáñez'], [15, 'Facundo Waller'], [8, 'Leonardo Gil'], [2, 'Lucas Blondel'], [7, 'Óscar Cortés'], [52, 'Facundo Kalinger'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[20, 'Emmanuel Ojeda'], [17, 'Juan Bisanz'], [21, 'Hugo Nervo'], [11, 'Eric Ramírez'], [10, 'Óscar Romero'], [35, 'Máximo Palazzo'], [19, 'Leandro Lescano'], [23, 'Thaiel Peralta'], [32, 'Sebastián Meza'], [14, 'Silvio Martínez'], [4, 'Federico Vera'], [41, 'Lautaro Mora']],
    subs: [
      { minute: '61', out: 'Óscar Cortés', in: 'Emmanuel Ojeda' },
      { minute: '73', out: 'Facundo Kalinger', in: 'Juan Bisanz' },
      { minute: '81', out: 'Lucas Carrizo', in: 'Hugo Nervo' },
      { minute: '82', out: 'Jordy Caicedo', in: 'Eric Ramírez' },
      { minute: '82', out: 'Leonardo Gil', in: 'Óscar Romero' },
      { minute: '105+4', out: 'Óscar Romero', in: 'Máximo Palazzo' },
    ],
  }),

  '2026-05-13-argentinos-juniors': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [21, 'Hugo Nervo'], [3, 'Lucas Carrizo'], [34, 'Ignacio Campo'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [15, 'Facundo Waller'], [2, 'Lucas Blondel'], [8, 'Leonardo Gil'], [52, 'Facundo Kalinger'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[17, 'Juan Bisanz'], [30, 'Nehuén Paz'], [7, 'Óscar Cortés'], [10, 'Óscar Romero'], [18, 'Luciano Giménez'], [14, 'Silvio Martínez'], [41, 'Lautaro Mora'], [19, 'Leandro Lescano'], [23, 'Thaiel Peralta'], [4, 'Federico Vera'], [35, 'Máximo Palazzo'], [32, 'Sebastián Meza']],
    subs: [
      { minute: '64', out: 'Facundo Kalinger', in: 'Juan Bisanz' },
      { minute: '72', out: 'Ignacio Campo', in: 'Nehuén Paz' },
      { minute: '83', out: 'Jordy Caicedo', in: 'Óscar Cortés' },
      { minute: '83', out: 'Emmanuel Ojeda', in: 'Óscar Romero' },
      { minute: '104', out: 'Lucas Blondel', in: 'Luciano Giménez' },
      { minute: '104', out: 'César Ibáñez', in: 'Silvio Martínez' },
    ],
  }),

  '2026-06-03-barracas-central': eleven('4-1-3-2', [
    [32, 'Sebastián Meza'],
    [6, 'Fabio Pereyra'], [35, 'Máximo Palazzo'], [34, 'Ignacio Campo'], [25, 'César Ibáñez'], [15, 'Facundo Waller'], [2, 'Lucas Blondel'], [10, 'Óscar Romero'], [52, 'Facundo Kalinger'], [11, 'Eric Ramírez'], [7, 'Óscar Cortés'],
  ], {
    bench: [[17, 'Juan Bisanz'], [21, 'Hugo Nervo'], [8, 'Leonardo Gil'], [23, 'Thaiel Peralta'], [26, 'Leonardo Sequeira'], [4, 'Federico Vera'], [3, 'Lucas Carrizo'], [27, 'Nazareno Durán'], [18, 'Luciano Giménez'], [19, 'Leandro Lescano'], [14, 'Silvio Martínez'], [20, 'Emmanuel Ojeda']],
    subs: [
      { minute: '61', out: 'Óscar Cortés', in: 'Juan Bisanz' },
      { minute: '61', out: 'Fabio Pereyra', in: 'Hugo Nervo' },
      { minute: '66', out: 'Óscar Romero', in: 'Leonardo Gil' },
      { minute: '66', out: 'Facundo Kalinger', in: 'Thaiel Peralta' },
      { minute: '71', out: 'Lucas Blondel', in: 'Leonardo Sequeira' },
    ],
  }),

  '2026-07-25-banfield': eleven('4-4-2', [
    [1, 'Hernán Galíndez'],
    [21, 'Hugo Nervo'], [35, 'Máximo Palazzo'], [2, 'Lucas Blondel'], [25, 'César Ibáñez'], [20, 'Emmanuel Ojeda'], [15, 'Facundo Waller'], [8, 'Leonardo Gil'], [7, 'Óscar Cortés'], [17, 'Juan Bisanz'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[24, 'Facundo Kalinger'], [6, 'Fabio Pereyra'], [19, 'Leandro Lescano'], [11, 'Thaiel Peralta'], [10, 'Óscar Romero'], [32, 'Sebastián Meza'], [14, 'Silvio Martínez'], [3, 'Lucas Carrizo'], [41, 'Lautaro Mora'], [4, 'Federico Vera'], [49, 'Tomás Natanael Uribe Sanders'], [34, 'Ignacio Campo']],
    subs: [
      { minute: '30', out: 'Facundo Waller', in: 'Facundo Kalinger' },
      { minute: '82', out: 'Juan Bisanz', in: 'Fabio Pereyra' },
      { minute: '89', out: 'César Ibáñez', in: 'Leandro Lescano' },
      { minute: '89', out: 'Óscar Cortés', in: 'Thaiel Peralta' },
      { minute: '89', out: 'Leonardo Gil', in: 'Óscar Romero' },
    ],
  }),

  '2026-07-31-independiente-rivadavia': eleven('5-3-2', [
    [1, 'Hernán Galíndez'],
    [21, 'Hugo Nervo'], [6, 'Fabio Pereyra'], [35, 'Máximo Palazzo'], [2, 'Lucas Blondel'], [25, 'César Ibáñez'], [8, 'Leonardo Gil'], [20, 'Emmanuel Ojeda'], [7, 'Óscar Cortés'], [17, 'Juan Bisanz'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[24, 'Facundo Kalinger'], [19, 'Leandro Lescano'], [14, 'Silvio Martínez'], [10, 'Óscar Romero'], [4, 'Federico Vera'], [49, 'Tomás Natanael Uribe Sanders'], [41, 'Lautaro Mora'], [32, 'Sebastián Meza'], [34, 'Ignacio Campo'], [48, 'Santino Raynelli'], [11, 'Thaiel Peralta'], [3, 'Lucas Carrizo']],
    subs: [
      { minute: '45', out: 'Fabio Pereyra', in: 'Facundo Kalinger' },
      { minute: '69', out: 'César Ibáñez', in: 'Leandro Lescano' },
      { minute: '82', out: 'Óscar Cortés', in: 'Silvio Martínez' },
      { minute: '86', out: 'Emmanuel Ojeda', in: 'Óscar Romero' },
    ],
  }),

  '2026-08-04-atletico-tucuman': eleven('4-3-3', [
    [1, 'Hernán Galíndez'],
    [21, 'Hugo Nervo'], [3, 'Lucas Carrizo'], [2, 'Lucas Blondel'], [35, 'Máximo Palazzo'], [24, 'Facundo Kalinger'], [8, 'Leonardo Gil'], [20, 'Emmanuel Ojeda'], [17, 'Juan Bisanz'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[10, 'Óscar Romero'], [11, 'Thaiel Peralta'], [41, 'Lautaro Mora'], [49, 'Tomás Natanael Uribe Sanders'], [14, 'Silvio Martínez'], [46, 'Fabrizio Martínez'], [4, 'Federico Vera'], [32, 'Sebastián Meza'], [6, 'Fabio Pereyra'], [48, 'Santino Raynelli'], [51, 'Martín Soto'], [34, 'Ignacio Campo']],
    subs: [
      { minute: '45', out: 'Emmanuel Ojeda', in: 'Óscar Romero' },
      { minute: '73', out: 'Juan Bisanz', in: 'Thaiel Peralta' },
      { minute: '81', out: 'Facundo Kalinger', in: 'Lautaro Mora' },
      { minute: '81', out: 'Óscar Cortés', in: 'Tomás Natanael Uribe Sanders' },
      { minute: '90+6', out: 'Leonardo Gil', in: 'Silvio Martínez' },
    ],
  }),

  '2026-08-09-san-lorenzo': eleven('4-3-3', [
    [1, 'Hernán Galíndez'],
    [21, 'Hugo Nervo'], [3, 'Lucas Carrizo'], [2, 'Lucas Blondel'], [35, 'Máximo Palazzo'], [24, 'Facundo Kalinger'], [8, 'Leonardo Gil'], [5, 'Rodrigo Fernández Cedrés'], [17, 'Juan Bisanz'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[23, 'Ignacio Pussetto'], [41, 'Lautaro Mora'], [10, 'Óscar Romero'], [32, 'Sebastián Meza'], [11, 'Thaiel Peralta'], [48, 'Santino Raynelli'], [49, 'Tomás Natanael Uribe Sanders'], [14, 'Silvio Martínez'], [19, 'Leandro Lescano'], [34, 'Ignacio Campo'], [6, 'Fabio Pereyra'], [4, 'Federico Vera']],
    subs: [
      { minute: '66', out: 'Jordy Caicedo', in: 'Ignacio Pussetto' },
      { minute: '78', out: 'Facundo Kalinger', in: 'Lautaro Mora' },
      { minute: '90', out: 'Óscar Cortés', in: 'Óscar Romero' },
    ],
  }),

  '2026-08-16-sarmiento-de-junin': eleven('4-3-3', [
    [1, 'Hernán Galíndez'],
    [21, 'Hugo Nervo'], [35, 'Máximo Palazzo'], [2, 'Lucas Blondel'], [19, 'Leandro Lescano'], [24, 'Facundo Kalinger'], [8, 'Leonardo Gil'], [5, 'Rodrigo Fernández Cedrés'], [17, 'Juan Bisanz'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[10, 'Óscar Romero'], [23, 'Ignacio Pussetto'], [11, 'Thaiel Peralta'], [34, 'Ignacio Campo'], [41, 'Lautaro Mora'], [4, 'Federico Vera'], [6, 'Fabio Pereyra'], [49, 'Tomás Natanael Uribe Sanders'], [51, 'Martín Soto'], [32, 'Sebastián Meza'], [46, 'Fabrizio Martínez'], [48, 'Santino Raynelli']],
    subs: [
      { minute: '9', out: 'Leonardo Gil', in: 'Óscar Romero' },
      { minute: '45', out: 'Facundo Kalinger', in: 'Ignacio Pussetto' },
      { minute: '57', out: 'Juan Bisanz', in: 'Thaiel Peralta' },
      { minute: '73', out: 'Lucas Blondel', in: 'Ignacio Campo' },
      { minute: '73', out: 'Óscar Cortés', in: 'Lautaro Mora' },
    ],
  }),

  '2026-08-23-deportivo-riestra': eleven('4-4-2', [
    [1, 'Hernán Galíndez'],
    [21, 'Hugo Nervo'], [35, 'Máximo Palazzo'], [2, 'Lucas Blondel'], [25, 'César Ibáñez'], [41, 'Lautaro Mora'], [5, 'Rodrigo Fernández Cedrés'], [49, 'Tomás Natanael Uribe Sanders'], [7, 'Óscar Cortés'], [17, 'Juan Bisanz'], [23, 'Ignacio Pussetto'],
  ], {
    bench: [[15, 'Facundo Waller'], [11, 'Thaiel Peralta'], [51, 'Martín Soto'], [34, 'Ignacio Campo'], [46, 'Fabrizio Martínez'], [4, 'Federico Vera'], [6, 'Fabio Pereyra'], [48, 'Santino Raynelli'], [14, 'Silvio Martínez'], [10, 'Óscar Romero'], [19, 'Leandro Lescano'], [32, 'Sebastián Meza']],
    subs: [
      { minute: '58', out: 'Tomás Natanael Uribe Sanders', in: 'Facundo Waller' },
      { minute: '73', out: 'Juan Bisanz', in: 'Thaiel Peralta' },
      { minute: '73', out: 'Lautaro Mora', in: 'Martín Soto' },
      { minute: '80', out: 'Ignacio Pussetto', in: 'Ignacio Campo' },
    ],
  }),

  '2026-08-30-estudiantes-de-rio-cuarto': eleven('4-3-3', [
    [1, 'Hernán Galíndez'],
    [21, 'Hugo Nervo'], [35, 'Máximo Palazzo'], [2, 'Lucas Blondel'], [25, 'César Ibáñez'], [41, 'Lautaro Mora'], [15, 'Facundo Waller'], [5, 'Rodrigo Fernández Cedrés'], [17, 'Juan Bisanz'], [7, 'Óscar Cortés'], [23, 'Ignacio Pussetto'],
  ], {
    bench: [[24, 'Facundo Kalinger'], [8, 'Leonardo Gil'], [49, 'Tomás Natanael Uribe Sanders'], [51, 'Martín Soto'], [11, 'Thaiel Peralta'], [6, 'Fabio Pereyra'], [46, 'Fabrizio Martínez'], [34, 'Ignacio Campo'], [19, 'Leandro Lescano'], [10, 'Óscar Romero'], [48, 'Santino Raynelli'], [32, 'Sebastián Meza']],
    subs: [
      { minute: '58', out: 'Ignacio Pussetto', in: 'Facundo Kalinger' },
      { minute: '65', out: 'Facundo Waller', in: 'Leonardo Gil' },
      { minute: '65', out: 'Lautaro Mora', in: 'Tomás Natanael Uribe Sanders' },
      { minute: '85', out: 'Rodrigo Fernández Cedrés', in: 'Martín Soto' },
    ],
  }),

  '2026-09-05-belgrano-de-cordoba': eleven('4-2-3-1', [
    [1, 'Hernán Galíndez'],
    [21, 'Hugo Nervo'], [35, 'Máximo Palazzo'], [2, 'Lucas Blondel'], [25, 'César Ibáñez'], [5, 'Rodrigo Fernández Cedrés'], [15, 'Facundo Waller'], [24, 'Facundo Kalinger'], [8, 'Leonardo Gil'], [7, 'Óscar Cortés'], [9, 'Jordy Caicedo'],
  ], {
    bench: [[17, 'Juan Bisanz'], [33, 'Bruno Barticciotto'], [20, 'Emmanuel Ojeda'], [19, 'Leandro Lescano'], [11, 'Thaiel Peralta'], [49, 'Tomás Natanael Uribe Sanders'], [41, 'Lautaro Mora'], [4, 'Federico Vera'], [6, 'Fabio Pereyra'], [34, 'Ignacio Campo'], [10, 'Óscar Romero'], [32, 'Sebastián Meza']],
    subs: [
      { minute: '57', out: 'Facundo Waller', in: 'Juan Bisanz' },
      { minute: '68', out: 'Leonardo Gil', in: 'Bruno Barticciotto' },
      { minute: '68', out: 'Facundo Kalinger', in: 'Emmanuel Ojeda' },
      { minute: '86', out: 'César Ibáñez', in: 'Leandro Lescano' },
      { minute: '86', out: 'Óscar Cortés', in: 'Thaiel Peralta' },
    ],
  }),
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
