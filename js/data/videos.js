/**
 * El video de cada partido. 70 encontrados.
 *
 * ARCHIVO GENERADO: no editar a mano. Lo escribe el script que busca en YouTube
 * el resumen de cada partido; para cambiar algo hay que tocar el script o cargar
 * el video en la base, que siempre manda sobre esto.
 *
 * CÓMO SE ELIGE CADA VIDEO
 * No alcanza con que "parezca" el del partido: se acepta sólo si el título
 * nombra a Huracán y al rival, y además trae el resultado exacto, o trae el año
 * y viene de un canal que transmite el fútbol argentino. Todo lo demás queda
 * afuera. Es preferible un partido sin video que un partido con el resumen de
 * otro.
 *
 * Cada entrada es [id de YouTube, título, canal, confianza]:
 *   - alta: el título trae el año y, casi siempre, el resultado exacto.
 *
 * El título y el canal se muestran en la ficha a propósito: si alguna vez cae el
 * video equivocado, se ve de una y se puede corregir.
 */

export const VIDEOS = {
  '1995-04-21-rosario-central': ['P1Htz2dNMYY', 'Huracán 2 - 5 Rosario Central (Clausura 1995) [Expediente Fútbol]', 'Santiago Strods', 'alta'],
  '1995-05-17-independiente': ['oQIQfCzvX84', 'Huracán 1-3 Independiente - Torneo Clausura 1995', 'EstadisticasCAI', 'alta'],
  '1995-06-25-newell-s-ob': ['2MOhdbcCjec', 'Clausura 1995 | Fecha 19 | Huracán 2 - 2 Newell\'s | Capo de Rosario', 'Partidos Leprosos', 'alta'],
  '1995-08-26-colon': ['igkyMoI0Hvk', 'Colón 3-0 Huracán / Apertura 1995', 'Archivo Sabalero', 'alta'],
  '1995-12-11-ferro-co': ['jhNahEbl7Ek', 'Huracan vs Ferro Carril Oeste (1-0) - DiFilm 1995', 'ArchivoDiChiara Canal 2', 'alta'],
  '1996-10-18-independiente': ['kwU8UfkDL64', 'Huracan 1-1 Independiente - Torneo Apertura 1996', 'EstadisticasCAI', 'alta'],
  '1997-02-28-san-lorenzo': ['RcRn-Y9zoM0', 'San Lorenzo 5-1 Huracan Clausura 1997', 'San Lorenzo Retro', 'alta'],
  '1997-05-03-union-de-santa-fe': ['xS9C7jMK_PE', 'UNION 5 - 0 HURACÁN • Fecha 10 • Clausura 1997', 'Bóveda Tatengue', 'alta'],
  '1997-09-17-colon-de-santa-fe': ['3SU0FHFFQCQ', 'Colón 2-1 Huracan / Apertura 1997', 'Archivo Sabalero', 'alta'],
  '1997-12-21-san-lorenzo': ['glH_C-BSAyo', 'San Lorenzo 0-0 Huracan Suspendido Apertura 1997', 'San Lorenzo Retro', 'alta'],
  '1998-02-21-independiente': ['mmpNgtMiCrk', 'Huracán 0-1 Independiente | Torneo Clausura 1998', 'EstadisticasCAI', 'alta'],
  '1998-05-31-velez-sarsfield': ['hhhnhuxvhag', 'REVIVIENDO PARTIDOS | VÉLEZ 1-0 HURACÁN | Torneo Clausura 1998', 'Partidos Vélez', 'alta'],
  '1998-10-04-newell-s-ob': ['SQ_2mH4heHY', '1998 - Apertura - Fecha 09 - Huracan 3 - 2 Newell\'s', 'resumenesPL', 'alta'],
  '1998-10-11-racing-club': ['IrCjiRk9nB4', '11-10-1998, Racing le ganó 2-1 a Huracán , con goles de Latorre y Zanetti. (Fecha 10', 'GolDeRacingClub', 'alta'],
  '1998-10-24-colon': ['cjuZ6RzmhV4', 'Colon 2-0 Huracan / Apertura 1998', 'Archivo Sabalero', 'alta'],
  '1998-12-11-independiente': ['xIcvDgGCowM', 'Huracán 1-1 Independiente | Torneo Apertura 1998', 'EstadisticasCAI', 'alta'],
  '1999-04-29-racing-club': ['5EC7pI2W0pA', 'HURACAN - RACING (1-2) CLAUSURA 1999. FECHA 10 (29 abril)', 'Quique 5', 'alta'],
  '1999-05-08-colon-de-santa-fe': ['A4yu_3EsUpI', 'Huracan 0-3 Colon / Clausura 1999', 'Archivo Sabalero', 'alta'],
  '1999-06-01-san-lorenzo': ['FmUEvCcpU0c', 'Huracan 1-1 San Lorenzo Clausura 1999', 'San Lorenzo Retro', 'alta'],
  '1999-06-20-independiente': ['yg0W5U9D_T4', 'Independiente 4 - 1 Huracan Torneo Clausura 1999', 'Diego Ricciardelli', 'alta'],
  '2001-02-10-colon': ['D1iVKGFqPwg', 'Huracan 1-3 Colon / Clausura 2001', 'Archivo Sabalero', 'alta'],
  '2001-02-24-talleres': ['c3dYy3RwKag', 'TALLERES - HURACAN (4-2) Torneo Clausura 2001', 'lobocordone55', 'alta'],
  '2001-11-25-newell-s-ob': ['ILnoqOtSZE8', 'Newells 5-2 Huracan (Apertura 2001)', 'Futbol de Primera', 'alta'],
  '2002-02-17-river-plate': ['UX0Gv3w2FXc', 'Huracán 0 - 4 River (Clausura 2002) [Partidazos TyC Sports]', 'Santiago Strods', 'alta'],
  '2002-03-17-racing-club': ['j84c0rkLHWY', 'Racing Club 2-1 Huracan (Clausura 2002)', 'Futbol de Primera', 'alta'],
  '2025-06-01-platense': ['jg_Conf-EKg', 'HURACÁN 0 - 1 PLATENSE I Resumen del partido | #TorneoBetano Apertura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2025-07-12-belgrano-de-cordoba': ['Uv2uCKmGZB0', 'HURACÁN 0 - 3 BELGRANO I Resumen del partido | #TorneoBetano Clausura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2025-07-22-estudiantes': ['VBlBD_jS4zk', 'ESTUDIANTES 2 - 1 HURACÁN I Resumen del partido | #TorneoBetano Clausura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2025-07-27-boca-juniors': ['QDQ5LULP5C8', 'HURACÁN 1 - 0 BOCA I Resumen del partido | #TorneoBetano Clausura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2025-08-02-lanus': ['g6ucNBHChvU', 'Lanús 2 - 0 Huracán | EL GRANATE ELIMINÓ AL GLOBO | Copa Argentina 2025 | Octavos de final', 'TyC Sports', 'alta'],
  '2025-08-09-tigre': ['BqoVePfkv54', '⚽ RESUMEN FECHA 4 - TORNEO CLAUSURA 2025 - TIGRE 0-1 HURACÁN', 'Club Atlético Tigre', 'alta'],
  '2025-08-13-once-caldas': ['2bMKD2CRcVM', 'LA SACÓ BARATA | Once Caldas 1 - 0 Huracán - Ida 8avos Copa Sudamericana 2025', 'Brian Pécora', 'alta'],
  '2025-08-16-argentinos-juniors': ['vfP1S0SkKgs', 'HURACÁN 1 - 0 ARGENTINOS | Resumen del partido | #TorneoBetano Clausura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2025-08-20-once-caldas': ['vDxVgAc-lzM', 'ONCE CALDAS vs. HURACÁN | HIGHLIGHTS | CONMEBOL SUDAMERICANA 2025', 'CONMEBOL Sudamericana', 'alta'],
  '2025-08-24-union-de-santa-fe': ['Euyyb3iVOQg', 'UNIÓN 1 - 1 HURACÁN | Resumen del partido | #TorneoBetano Clausura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2025-08-30-san-lorenzo': ['1BZwnKrGiN8', 'SAN LORENZO 0 - 0 HURACÁN | Resumen del partido | #TorneoBetano Clausura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2025-09-13-velez-sarsfield': ['-hR6PaDTYrI', 'HURACÁN 0 - 0 VÉLEZ | Resumen del partido | #TorneoBetano Clausura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2025-09-20-racing-club': ['GtkcGBERwC8', 'HURACÁN 0 - 2 RACING | Resumen del partido | #TorneoBetano Clausura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2025-09-29-independiente-rivadavia': ['I15fTXVck4I', 'INDEPENDIENTE RIVADAVIA 0 - 0 HURACÁN | Resumen del partido | #TorneoBetano Clausura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2025-10-05-banfield': ['LBAvJmm3XoE', 'HURACÁN 1 - 0 BANFIELD | Resumen del partido | #TorneoBetano Clausura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2025-10-12-aldosivi': ['xurENhqDY68', 'ALDOSIVI 2 - 0 HURACÁN | Resumen del partido | #TorneoBetano Clausura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2025-11-03-defensa-y-justicia': ['Cnq77a-ZCuM', 'DEFENSA Y JUSTICIA 1 - 3 HURACÁN | Resumen del partido | #TorneoBetano Clausura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2025-11-08-newell-s-old-boys': ['A1wTgEknXVQ', 'HURACÁN 0 - 2 NEWELL\'S | Resumen del partido | #TorneoBetano Clausura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2025-11-17-barracas-central': ['WOTUYrkCG-E', 'BARRACAS CENTRAL 1 - 1 HURACÁN | Resumen del partido | #TorneoBetano Clausura 2025', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-01-23-banfield': ['A0Ciao3W-NA', 'BANFIELD 1 - 1 HURACÁN | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-01-28-independiente-rivadavia': ['ApHLpKg0bVo', 'HURACÁN 1 - 2 INDEPENDIENTE RIVADAVIA | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-02-01-atletico-tucuman': ['kCxshNXPaPE', 'ATLÉTICO TUCUMÁN 1 - 1 HURACÁN | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-02-08-san-lorenzo': ['pONw9YR8qZM', 'HURACÁN 1 - 0 SAN LORENZO | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-02-14-sarmiento-de-junin': ['jUpGnBDn-w8', 'HURACÁN 1 - 0 SARMIENTO | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-02-26-estudiantes-de-rio-cuarto': ['w4kzrW4ywzc', 'ESTUDIANTES (RIO CUARTO) 2 - 0 HURACÁN | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-03-03-belgrano-de-cordoba': ['bU4h10pGZ3E', 'HURACÁN 3 - 1 BELGRANO | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-03-13-river-plate': ['hcUNdsTKq5I', 'HURACÁN 1 - 2 RIVER | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-03-16-aldosivi': ['03jWXO8NCEY', 'ALDOSIVI 0 - 0 HURACÁN | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-03-24-barracas-central': ['whHHOqnmol0', 'HURACÁN 0 - 0 BARRACAS CENTRAL | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-03-29-olimpo-de-bahia-blanca': ['MPVhmfY6taQ', 'Huracán 2 - 1 Olimpo | Copa Argentina 2026 | 32avos de final', 'TyC Sports', 'alta'],
  '2026-04-05-gimnasia-de-la-plata': ['Ndsi-5tmlvY', 'GIMNASIA 0 - 3 HURACÁN | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-04-12-rosario-central': ['yQnWGKW7ELY', 'HURACÁN 3 - 1 ROSARIO CENTRAL | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-04-21-tigre': ['yQLS1V7u2GI', 'TIGRE 1 - 1 HURACÁN | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-04-28-argentinos-juniors': ['Po14uMU2IMw', 'HURACÁN 1 - 2 ARGENTINOS | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-05-03-racing-club': ['sKMgssymhvc', 'RACING 0 - 0 HURACÁN | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-05-10-boca-juniors': ['ODjcINY7maM', 'BOCA 2 - 3 HURACÁN | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-05-13-argentinos-juniors': ['uoqcgshTcO8', 'ARGENTINOS 1 - 0 HURACÁN | Resumen del partido | #TorneoMercadoLibre 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-06-03-barracas-central': ['8k_rJ6TBb98', 'Barracas Central 1- 0 Huracán | Copa Argentina 2026 | 16avos de final', 'TyC Sports', 'alta'],
  '2026-07-25-banfield': ['35NlgYXfrkE', 'HURACÁN 1 - 0 BANFIELD | Resumen del partido | #TorneoMercadoLibre Clausura 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-07-31-independiente-rivadavia': ['BjPzm8ofl6U', 'INDEPENDIENTE RIVADAVIA 2 - 1 HURACÁN | Resumen del partido | #TorneoMercadoLibre Clausura 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-08-04-atletico-tucuman': ['cO9ir2kqd_4', 'HURACÁN 0 - 0 ATLÉTICO TUCUMÁN | Resumen del partido | #TorneoMercadoLibre Clausura 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-08-09-san-lorenzo': ['dqlxJw59P-8', 'SAN LORENZO 0 - 2 HURACÁN | Resumen del partido | #TorneoMercadoLibre Clausura 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-08-16-sarmiento-de-junin': ['EJ8-NOcUwaI', 'SARMIENTO 2 - 0 HURACÁN | Resumen del partido | #TorneoMercadoLibre Clausura 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-08-30-estudiantes-de-rio-cuarto': ['tnwHsH04-R4', 'HURACÁN 1 - 1 ESTUDIANTES RC | Resumen del partido | #TorneoMercadoLibre Clausura 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
  '2026-09-05-belgrano-de-cordoba': ['BEO9q1uGHUQ', 'BELGRANO 1 - 1 HURACÁN | Resumen del partido | #TorneoMercadoLibre Clausura 2026 🏆', 'Liga Profesional de Fútbol de la AFA', 'alta'],
};

/** El video de un partido, o null. */
export function videoFor(matchId) {
  const fila = VIDEOS[matchId];
  if (!fila) return null;
  const [id, titulo, canal, confianza] = fila;
  return { id, url: `https://www.youtube.com/watch?v=${id}`, titulo, canal, confianza };
}

export const videoCount = () => Object.keys(VIDEOS).length;
