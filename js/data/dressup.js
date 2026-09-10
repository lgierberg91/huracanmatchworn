/**
 * Registro estático del "vestidor": jugadores y camisetas que se pueden combinar
 * en la figurita de la home. Son recursos locales (assets/jugadores, assets/camisetas),
 * no vienen del archivo de partidos.
 *
 * Para sumar uno nuevo: dejar el archivo en la carpeta y agregar una línea acá.
 */

import { JERSEY_DIR, PLAYER_DIR } from '../config.js';

export const PLAYERS = [
  { id: 'wanchope-abila', name: 'Wanchope Ábila', file: 'Wanchope_Abila.jpeg' },
  { id: 'rene-houseman', name: 'René Houseman', file: 'Rene_Houseman.jpg' },
  { id: 'miguel-brindisi', name: 'Miguel Brindisi', file: 'Miguel_Brindisi.webp' },
  { id: 'tucho-mendez', name: 'Tucho Méndez', file: 'Tucho_Mendez.jpeg' },
  { id: 'kaku-gamarra', name: 'Kaku Gamarra', file: 'Kaku_Gamarra.png' },
  { id: 'ignacio-pussetto', name: 'Ignacio Pussetto', file: 'Ignacio_Pussetto.png' },
  { id: 'montenegro', name: 'Montenegro', file: 'Montenegro.webp' },
  { id: 'edu-dominguez', name: 'Edu Domínguez', file: 'Edu_Dominguez.webp' },
].map((p) => ({ ...p, src: `${PLAYER_DIR}/${p.file}` }));

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
