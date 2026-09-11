/**
 * Registro estático del "vestidor" del hero: fotos pre-generadas con IA de un
 * jugador histórico con la camiseta de distintas temporadas. Viven en
 * assets/hero/<temporada>/<archivo>.
 *
 * Para sumar una temporada a un jugador ya cargado: dejar el archivo en su
 * carpeta y agregar una línea a `seasons`. Para sumar un jugador nuevo,
 * agregar un objeto a HERO_PLAYERS (el layout ya soporta más de uno).
 */

import { HERO_DIR } from '../config.js';

export const HERO_PLAYERS = [
  {
    id: 'houseman',
    name: 'René Houseman',
    seasons: [
      { year: 2014, file: '2014/Houseman2014.jpeg' },
      { year: 2015, file: '2015/Houseman2015.jpeg' },
      { year: 2026, file: '2026/Houseman2026.jpeg' },
    ],
  },
].map((p) => ({
  ...p,
  seasons: p.seasons.map((s) => ({ ...s, src: `${HERO_DIR}/${s.file}` })),
}));
