/**
 * Temporadas de camiseta.
 *
 * Una camiseta no dura un año calendario: dura lo que duraba el campeonato. Por
 * eso la colección no se ordena por año sino por TEMPORADA, escrita como la dicen
 * los coleccionistas: '2002-03' o '2013'.
 *
 * CÓMO SE CORTA
 * - De julio de 1985 a junio de 2007 el fútbol argentino jugaba de agosto a
 *   junio: temporadas partidas ('1985-86' … '2006-07'). Lo confirman los nombres
 *   de los torneos en el archivo y, desde 1999, las camisetas mismas (Envion
 *   99-00, Signia 02-03, Meister 03-04 y 04-05, Kappa 05-06 y 06-07).
 * - Antes y después, una camiseta por año calendario. Vitto confirmó que 2008,
 *   2009 y 2017 a 2020 eran de un año.
 * - Quedan dos filas de medio año, que son las costuras: '1985' (enero a junio)
 *   y '2007' (julio a diciembre, el Apertura del ascenso).
 *
 * El resto del sitio (estadísticas, #/temporada/<año>) sigue por año calendario:
 * esto sólo ordena las camisetas.
 */

import { allYears, matchesOfYear, indexesVersion } from './store.js';

/** Primera y última temporada partida, por su año de arranque. */
const SPLIT_FROM = 1985;
const SPLIT_TO = 2006;

const splitKey = (start) => `${start}-${String((start + 1) % 100).padStart(2, '0')}`;

/** '2004-03-12' -> '2003-04' · '2023-03-12' -> '2023' */
export function seasonOfDate(date) {
  const year = Number(String(date).slice(0, 4));
  const month = Number(String(date).slice(5, 7)) || 1;
  const start = month >= 7 ? year : year - 1;
  if (start >= SPLIT_FROM && start <= SPLIT_TO) return splitKey(start);
  return String(year);
}

/** El año en que arrancó: '2002-03' -> 2002 · '2013' -> 2013. Sirve para marca y década. */
export const seasonStart = (key) => Number(String(key).slice(0, 4));

/** De la más nueva a la más vieja. '1985-86' va antes que '1985', que es su primer semestre. */
export const bySeasonDesc = (a, b) => seasonStart(b) - seasonStart(a) || String(b).length - String(a).length;

/** Todas las temporadas con partidos, con sus partidos. Se calcula una sola vez. */
let bySeason = null;
let builtFor = -1;
function index() {
  if (bySeason && builtFor === indexesVersion()) return bySeason;
  builtFor = indexesVersion();
  bySeason = new Map();
  for (const y of allYears()) {
    for (const match of matchesOfYear(y)) {
      const key = seasonOfDate(match.date);
      if (!bySeason.has(key)) bySeason.set(key, []);
      bySeason.get(key).push(match);
    }
  }
  for (const list of bySeason.values()) list.sort((a, b) => a.date.localeCompare(b.date));
  return bySeason;
}

export const allSeasons = () => [...index().keys()].sort(bySeasonDesc);
export const matchesOfSeason = (key) => (index().get(String(key)) || []).slice();
