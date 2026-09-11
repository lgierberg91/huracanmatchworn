/**
 * Los dos registros que alimentan el Kit Creator.
 *
 * JERSEYS      — las fotos de camiseta que tenemos (assets/camisetas). Además del
 *                Kit Creator son la materia prima de la línea de tiempo y del
 *                minijuego: ver js/data/seasonKits.js y js/data/quiz.js.
 *
 * HERO_PLAYERS — fotos pre-generadas con IA: el jugador YA con la camiseta puesta
 *                (assets/hero/<temporada>/). No se componen en vivo — el compositor
 *                en tiempo real nunca se veía integrado, así que cada combinación se
 *                genera aparte y acá sólo se registra.
 *
 * PARA SUMAR UNA COMBINACIÓN
 * 1. Dejá la imagen en assets/hero/<temporada>/
 * 2. Agregá la línea a `seasons` del jugador. Si el jugador es nuevo, sumale un
 *    objeto a HERO_PLAYERS: el Kit Creator ya soporta cualquier cantidad.
 */

import { HERO_DIR, JERSEY_DIR } from '../config.js';

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
  {
    id: 'turco-garcia',
    name: 'Turco García',
    seasons: [{ year: 2026, file: '2026/TurcoGarcia2026.jpeg' }],
  },
  {
    id: 'montenegro',
    name: 'Montenegro',
    seasons: [{ year: 2026, file: '2026/Montenegro_2026.jpeg' }],
  },
  {
    id: 'wanchope-abila',
    name: 'Wanchope Ábila',
    seasons: [{ year: 2026, file: '2026/Wanchope2026.jpeg' }],
  },
  {
    id: 'kaku-gamarra',
    name: 'Kaku Gamarra',
    seasons: [{ year: 2026, file: '2026/Kaku2026.jpeg' }],
  },
  {
    id: 'ignacio-pussetto',
    name: 'Ignacio Pussetto',
    seasons: [{ year: 2026, file: '2026/Pussetto2026.jpeg' }],
  },
].map((p) => ({
  ...p,
  seasons: p.seasons.map((s) => ({ ...s, src: `${HERO_DIR}/${s.file}` })),
}));

/** Cuántas combinaciones jugador + camiseta hay generadas. */
export const heroPhotoCount = () =>
  HERO_PLAYERS.reduce((total, player) => total + player.seasons.length, 0);

export const JERSEYS = [
  { id: '2012', label: '2012', file: 'Camiseta2012.jpeg' },
  { id: '2012-v2', label: '2012 · v2', file: 'Camiseta_2012_2.jpeg' },
  { id: '2013', label: '2013', file: 'Camiseta_2013.jpeg' },
  { id: '2013-v2', label: '2013 · v2', file: 'Camiseta_2013_2.jpeg' },
  { id: '2013-v3', label: '2013 · v3', file: 'Camiseta2013_3.jpg' },
  { id: '2015', label: '2015', file: 'Camiseta2015.jpeg' },
  { id: '2015-v2', label: '2015 · v2', file: 'Camiseta2015.jpg' },
  { id: '2016', label: '2016', file: 'Camiseta2016.jpg' },
  { id: '2018', label: '2018', file: 'Camiseta2018_2.jpeg' },
  { id: '2019', label: '2019', file: 'Camiseta2019.jpeg' },
  { id: '2019-ringo', label: '2019 · Ringo', file: 'Camiseta2019_Ringo.jpeg' },
  { id: '2020', label: '2020', file: 'Camiseta2020.jpeg' },
  { id: '2023', label: '2023', file: 'Camiseta2023.jpeg' },
  { id: '2023-v2', label: '2023 · v2', file: 'Camiseta2023_2.jpeg' },
  { id: '2024', label: '2024', file: 'Camiseta_2024.jpg' },
  { id: '2024-v2', label: '2024 · v2', file: 'Camiseta2024.jpeg' },
  { id: '2024-v3', label: '2024 · v3', file: 'Camiseta2024_2.jpeg' },
  { id: '2025', label: '2025', file: 'Camiseta_2025.jpeg' },
  { id: '2025-v2', label: '2025 · v2', file: 'Camiseta2025_1.jpeg' },
  { id: '2025-v3', label: '2025 · v3', file: 'Camiseta2025_2.jpeg' },
  { id: '2025-v4', label: '2025 · v4', file: 'Camiseta2025_3.jpeg' },
  { id: '2026', label: '2026', file: 'Camiseta2026.webp' },
].map((j) => ({ ...j, src: `${JERSEY_DIR}/${j.file}` }));
