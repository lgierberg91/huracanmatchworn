/**
 * Registro canónico de clubes.
 *
 * El archivo guarda el nombre del rival como texto libre y a lo largo de 50 años
 * el mismo club aparece escrito de muchas formas ("Vélez Sarsfield" / "Vélez Sársfield",
 * "CASL" / "San Lorenzo" / "Club Atlético San Lorenzo de Almagro"). Este módulo
 * unifica todas esas variantes en un único club, con su escudo.
 *
 * PARA AGREGAR UN ESCUDO NUEVO
 * 1. Dejá el PNG en assets/clubs/ (fondo transparente, ~256px).
 * 2. Poné el nombre del archivo (sin .png) en el campo `crest` del club.
 * 3. Si el club todavía no está, agregalo a la lista con sus `aliases`
 *    (tal cual aparecen escritos en la base).
 *
 * Los clubes sin `crest` no rompen nada: se dibuja un monograma elegante.
 * Nunca se descarga un escudo de internet.
 */

import { CREST_DIR } from '../config.js';

/** Huracán, siempre presente en los dos lados de la ficha. */
export const HURACAN = {
  id: 'huracan',
  name: 'Huracán',
  short: 'Huracán',
  crest: 'huracan',
};

/**
 * `aliases` = cómo aparece escrito en la base. `short` = versión para espacios chicos.
 * `intl` marca clubes del exterior (se usa en filtros y estadísticas).
 */
const CLUBS = [
  // ---------- AFA ----------
  { id: 'acassuso', name: 'Acassuso', crest: 'acassuso', aliases: ['Acassuso'] },
  { id: 'agropecuario', name: 'Agropecuario', crest: 'agropecuario', aliases: ['Agropecuario', 'Agropecuario Argentino'] },
  { id: 'aldosivi', name: 'Aldosivi', crest: 'aldosivi', aliases: ['Aldosivi', 'CA Aldosivi'] },
  { id: 'all-boys', name: 'All Boys', crest: 'all-boys', aliases: ['All Boys'] },
  { id: 'almagro', name: 'Almagro', crest: 'almagro', aliases: ['Almagro'] },
  { id: 'almirante-brown', name: 'Almirante Brown', short: 'Almirante', crest: 'almirante-brown', aliases: ['Almirante Brown'] },
  { id: 'argentino-merlo', name: 'Argentino de Merlo', crest: 'argentino-merlo', aliases: ['Argentino de Merlo'] },
  { id: 'argentino-quilmes', name: 'Argentino de Quilmes', crest: 'argentino-quilmes', aliases: ['Argentino de Quilmes'] },
  { id: 'argentinos-juniors', name: 'Argentinos Juniors', short: 'Argentinos', crest: 'argentinos-juniors', aliases: ['Argentinos Juniors', 'Arg. Juniors'] },
  { id: 'arsenal', name: 'Arsenal de Sarandí', short: 'Arsenal', crest: null, aliases: ['Arsenal de Sarandí', 'Arsenal FC'] },
  { id: 'atlanta', name: 'Atlanta', crest: 'atlanta', aliases: ['Atlanta'] },
  { id: 'atletico-concepcion', name: 'Atlético Concepción', crest: null, aliases: ['Atlético Concepción', 'Atl. Concepción (Tuc.)'] },
  { id: 'atletico-rafaela', name: 'Atlético Rafaela', short: 'Rafaela', crest: 'atletico-rafaela', aliases: ['Atlético Rafaela', 'Atlético Rafael'] },
  { id: 'atletico-tucuman', name: 'Atlético Tucumán', crest: 'atletico-tucuman', aliases: ['Atlético Tucumán', 'Atlético (Tucumán)', 'Atlético Tucumá'] },
  { id: 'atletico-uruguay', name: 'Atlético Uruguay', crest: null, aliases: ['Atlético Uruguay (Concepción del Uruguay)'] },
  { id: 'banfield', name: 'Banfield', crest: 'banfield', aliases: ['Banfield'] },
  { id: 'barracas-central', name: 'Barracas Central', short: 'Barracas', crest: 'barracas-central', aliases: ['Barracas Central'] },
  { id: 'belgrano', name: 'Belgrano de Córdoba', short: 'Belgrano', crest: 'belgrano', aliases: ['Belgrano de Córdoba', 'Belgrano', 'Belgrano (Cba.)', 'Belgrano (Córdoba)'] },
  { id: 'belgrano-san-francisco', name: 'Belgrano de San Francisco', crest: null, aliases: ['Belgrano de San Francisco'] },
  { id: 'ben-hur', name: 'Ben Hur de Rafaela', short: 'Ben Hur', crest: null, aliases: ['Ben Hur de Rafaela', 'Ben Hur'] },
  { id: 'boca-juniors', name: 'Boca Juniors', short: 'Boca', crest: 'boca-juniors', aliases: ['Boca Juniors'] },
  { id: 'boca-unidos', name: 'Boca Unidos', crest: null, aliases: ['Boca Unidos'] },
  { id: 'brown-adrogue', name: 'Brown de Adrogué', crest: 'brown-adrogue', aliases: ['Brown de Adrogué'] },
  { id: 'brown-madryn', name: 'Guillermo Brown', crest: null, aliases: ['Guillermo Brown'] },
  { id: 'cai', name: 'CAI de Comodoro Rivadavia', short: 'CAI', crest: null, aliases: ['C.A.I. de Comodoro Rivadavia', 'C.A.I.'] },
  { id: 'central-cordoba-rosario', name: 'Central Córdoba de Rosario', short: 'CC Rosario', crest: null, aliases: ['Central Córdoba Rosario'] },
  { id: 'central-cordoba-sde', name: 'Central Córdoba (SdE)', short: 'Central Córdoba', crest: 'central-cordoba-sde', aliases: ['Central Córdoba SdE', 'Central Córdoba (SdE)'] },
  { id: 'central-norte', name: 'Central Norte de Salta', short: 'Central Norte', crest: 'central-norte-salta', aliases: ['Central Norte (Salta)'] },
  { id: 'cerro-cora', name: 'Cerro Corá', crest: null, intl: true, aliases: ['Cerro Corá'] },
  { id: 'chacarita', name: 'Chacarita Juniors', short: 'Chacarita', crest: 'chacarita-juniors', aliases: ['Chacarita Juniors', 'Chacarita'] },
  { id: 'chaco-for-ever', name: 'Chaco For Ever', crest: 'chaco-for-ever', aliases: ['Chaco For Ever'] },
  { id: 'cipolletti', name: 'Cipolletti', crest: null, aliases: ['Cipolletti (Río Negro)'] },
  { id: 'ciudad-bolivar', name: 'Ciudad de Bolívar', crest: 'ciudad-bolivar', aliases: ['Ciudad de Bolívar'] },
  { id: 'colegiales', name: 'Colegiales', crest: 'colegiales', aliases: ['Colegiales'] },
  { id: 'colon', name: 'Colón de Santa Fe', short: 'Colón', crest: 'colon', aliases: ['Colón de Santa Fe', 'Colón', 'Colón (Santa Fe)', 'Colón (Sta. Fe)'] },
  { id: 'comunicaciones', name: 'Comunicaciones', crest: 'comunicaciones', aliases: ['Comunicaciones'] },
  { id: 'crucero-del-norte', name: 'Crucero del Norte', crest: null, aliases: ['Crucero del Norte', 'Crucero del Nor'] },
  { id: 'defensa-y-justicia', name: 'Defensa y Justicia', short: 'Defensa', crest: 'defensa-y-justicia', aliases: ['Defensa y Justicia', 'CSyD DyJ'] },
  { id: 'defensores-de-belgrano', name: 'Defensores de Belgrano', short: 'Defensores', crest: 'defensores-de-belgrano', aliases: ['Defensores de Belgrano', 'Defensores de B'] },
  { id: 'defensores-unidos', name: 'Defensores Unidos de Zárate', short: 'Defensores Unidos', crest: null, aliases: ['Defensores Unidos de Zárate'] },
  { id: 'deportivo-armenio', name: 'Deportivo Armenio', short: 'Armenio', crest: 'deportivo-armenio', aliases: ['Deportivo Armenio'] },
  { id: 'deportivo-espanol', name: 'Deportivo Español', short: 'Español', crest: null, aliases: ['Deportivo Español', 'Español'] },
  { id: 'deportivo-italiano', name: 'Deportivo Italiano', crest: 'sportivo-italiano', aliases: ['Deportivo Italiano', 'Sportivo Italiano'] },
  { id: 'deportivo-madryn', name: 'Deportivo Madryn', short: 'Madryn', crest: 'deportivo-madryn', aliases: ['Deportivo Madryn'] },
  { id: 'deportivo-maipu', name: 'Deportivo Maipú', short: 'Maipú', crest: 'deportivo-maipu', aliases: ['Dep. Maipú (Mza.)', 'Deportivo Maipú'] },
  { id: 'deportivo-merlo', name: 'Deportivo Merlo', crest: 'deportivo-merlo', aliases: ['Deportivo Merlo'] },
  { id: 'deportivo-riestra', name: 'Deportivo Riestra', short: 'Riestra', crest: 'riestra', aliases: ['Deportivo Riestra'] },
  { id: 'desamparados', name: 'Desamparados de San Juan', short: 'Desamparados', crest: null, aliases: ['Desamparados de San Juan', 'Sp. Desamparados'] },
  { id: 'dock-sud', name: 'Sportivo Dock Sud', short: 'Dock Sud', crest: 'dock-sud', aliases: ['Dock Sud', 'Sportivo Dock Sud'] },
  { id: 'douglas-haig', name: 'Douglas Haig', crest: null, aliases: ['Douglas Haig'] },
  { id: 'el-porvenir', name: 'El Porvenir', crest: null, aliases: ['El Porvenir de Gerli', 'El Porvenir'] },
  { id: 'estacion-quequen', name: 'Estación Quequén', crest: null, aliases: ['Estación Quequén (Nec.)'] },
  { id: 'estudiantes-ba', name: 'Estudiantes de Caseros', short: 'Estudiantes (BA)', crest: 'estudiantes-caseros', aliases: ['Estudiantes (Buenos Aires)'] },
  { id: 'estudiantes-lp', name: 'Estudiantes de La Plata', short: 'Estudiantes', crest: 'estudiantes-lp', aliases: ['Estudiantes', 'Estudiantes (La Plata)', 'Estudiantes de La Plata', 'Estudiantes (LP)'] },
  { id: 'estudiantes-rc', name: 'Estudiantes de Río Cuarto', short: 'Estudiantes (RC)', crest: 'estudiantes-rc', aliases: ['Estudiantes de Río Cuarto', 'Estudiantes (Río IV)'] },
  { id: 'estudiantes-sl', name: 'Estudiantes de San Luis', short: 'Estudiantes (SL)', crest: null, aliases: ['Estudiantes de San Luis'] },
  { id: 'excursionistas', name: 'Excursionistas', crest: 'excursionistas', aliases: ['Excursionistas'] },
  { id: 'fenix', name: 'Fénix', crest: 'fenix', aliases: ['Fénix'] },
  { id: 'ferro', name: 'Ferro Carril Oeste', short: 'Ferro', crest: 'ferro-carril-oeste', aliases: ['Ferro Carril Oeste', 'Ferro CO'] },
  { id: 'ferro-general-pico', name: 'Ferro de General Pico', short: 'Ferro (GP)', crest: null, aliases: ['F.C. Oeste (Gral. Pico)'] },
  { id: 'flandria', name: 'Flandria', crest: 'flandria', aliases: ['Flandria'] },
  { id: 'gimnasia-cdu', name: 'Gimnasia de Concepción del Uruguay', short: 'Gimnasia (CdU)', crest: null, aliases: ['Gimnasia y Esgrima (CdU)', 'GECU'] },
  { id: 'gimnasia-jujuy', name: 'Gimnasia de Jujuy', short: 'Gimnasia (J)', crest: 'gimnasia-jujuy', aliases: ['Gimnasia de Jujuy', 'GyE Jujuy', 'Gimnasia y Esgrima (Jujuy)', 'Gimnasia (Jujuy)'] },
  { id: 'gimnasia-lp', name: 'Gimnasia de La Plata', short: 'Gimnasia', crest: 'gimnasia-lp', aliases: ['Gimnasia de La Plata', 'GyE La Plata', 'Gimnasia y Esgrima (La Plata)', 'Gimnasia (LP)', 'Gimnasia y Esgrima La Plata', 'Gimnasia y Esgrima LP'] },
  { id: 'gimnasia-mendoza', name: 'Gimnasia de Mendoza', short: 'Gimnasia (M)', crest: 'gimnasia-mendoza', aliases: ['Gimnasia y Esgrima (Mendoza)'] },
  { id: 'gimnasia-y-tiro', name: 'Gimnasia y Tiro de Salta', short: 'Gimnasia y Tiro', crest: 'gimnasia-y-tiro-salta', aliases: ['Gimnasia y Tiro (Salta)', 'Gimnasia y Tiro de Salta', 'GyT Salta'] },
  { id: 'godoy-cruz', name: 'Godoy Cruz', crest: 'godoy-cruz', aliases: ['Godoy Cruz'] },
  { id: 'guarani-antonio-franco', name: 'Guaraní Antonio Franco', short: 'Guaraní AF', crest: null, aliases: ['Guaraní A.F. (Mis.)', 'Guaraní A. Franco (Mis.)'] },
  { id: 'guemes', name: 'Güemes de Santiago del Estero', short: 'Güemes', crest: 'guemes', aliases: ['Güemes'] },
  { id: 'huracan-comodoro', name: 'Huracán de Comodoro Rivadavia', short: 'Huracán (CR)', crest: null, aliases: ['Huracán (Comodoro Rivadavia)'] },
  { id: 'huracan-corrientes', name: 'Huracán de Corrientes', short: 'Huracán (Ctes.)', crest: null, aliases: ['Huracán de Corrientes'] },
  { id: 'huracan-tres-arroyos', name: 'Huracán de Tres Arroyos', short: 'Huracán (TA)', crest: null, aliases: ['Huracán de Tres Arroyos', 'HdTA'] },
  { id: 'independiente', name: 'Independiente', crest: 'independiente', aliases: ['Independiente', 'Independiente (Avellaneda)'] },
  { id: 'independiente-rivadavia', name: 'Independiente Rivadavia', short: 'Ind. Rivadavia', crest: 'independiente-rivadavia', aliases: ['Independiente Rivadavia', 'Ind. Rivadavia (Mendoza)', 'CSIR'] },
  { id: 'instituto', name: 'Instituto de Córdoba', short: 'Instituto', crest: 'instituto', aliases: ['Instituto de Córdoba', 'Instituto (Córdoba)', 'Instituto Córdo'] },
  { id: 'juventud-antoniana', name: 'Juventud Antoniana', crest: null, aliases: ['Juventud Antoniana', 'CJA'] },
  { id: 'kimberley', name: 'Kimberley de Mar del Plata', short: 'Kimberley', crest: null, aliases: ['Kimberley (Mar del Plata)', 'Kimberley (MdP)'] },
  { id: 'laferrere', name: 'Deportivo Laferrere', short: 'Laferrere', crest: 'laferrere', aliases: ['Deportivo Laferrere', 'Laferrere'] },
  { id: 'lanus', name: 'Lanús', crest: 'lanus', aliases: ['Lanús'] },
  { id: 'liniers', name: 'Liniers', crest: 'liniers', aliases: ['Liniers'] },
  { id: 'los-andes', name: 'Los Andes', crest: 'los-andes', aliases: ['Los Andes', 'CA Los Andes'] },
  { id: 'mandiyu', name: 'Deportivo Mandiyú', short: 'Mandiyú', crest: null, aliases: ['Mandiyú', 'Deportivo Mandiyú', 'Dep. Mandiyú (Ctes.)'] },
  { id: 'mariano-moreno', name: 'Mariano Moreno de Junín', short: 'Mariano Moreno', crest: null, aliases: ['Mariano Moreno (Junín)'] },
  { id: 'midland', name: 'Midland', crest: 'midland', aliases: ['Midland'] },
  { id: 'mitre', name: 'Mitre de Santiago del Estero', short: 'Mitre', crest: 'mitre', aliases: ['Mitre', 'Mitre (SdE)'] },
  { id: 'moron', name: 'Deportivo Morón', short: 'Morón', crest: 'moron', aliases: ['Deportivo Morón', 'Morón'] },
  { id: 'newells', name: "Newell's Old Boys", short: "Newell's", crest: 'newells', aliases: ["Newell's Old Boys", "Newell's OB"] },
  { id: 'nueva-chicago', name: 'Nueva Chicago', short: 'Chicago', crest: 'nueva-chicago', aliases: ['Nueva Chicago', 'Nueva Ch.'] },
  { id: 'olimpo', name: 'Olimpo de Bahía Blanca', short: 'Olimpo', crest: null, aliases: ['Olimpo de Bahía Blanca', 'Olimpo', 'Olimpo (Bahía Blanca)'] },
  { id: 'patronato', name: 'Patronato de Paraná', short: 'Patronato', crest: 'patronato', aliases: ['Patronato de Paraná', 'Patronato', 'Patronato (Paraná)'] },
  { id: 'platense', name: 'Platense', crest: 'platense', aliases: ['Platense'] },
  { id: 'quilmes', name: 'Quilmes', crest: 'quilmes', aliases: ['Quilmes'] },
  { id: 'racing-club', name: 'Racing Club', short: 'Racing', crest: 'racing-club', aliases: ['Racing Club', 'Racing'] },
  { id: 'racing-cordoba', name: 'Racing de Córdoba', short: 'Racing (C)', crest: 'racing-cordoba', aliases: ['Racing (Córdoba)', 'Racing de Córdoba'] },
  { id: 'ramon-santamarina', name: 'Ramón Santamarina', short: 'Santamarina', crest: null, aliases: ['Ramón Santamarina'] },
  { id: 'real-pilar', name: 'Real Pilar', crest: 'real-pilar', aliases: ['Real Pilar'] },
  { id: 'renato-cesarini', name: 'Renato Cesarini', crest: null, aliases: ['Renato Cesarini'] },
  { id: 'river-plate', name: 'River Plate', short: 'River', crest: 'river-plate', aliases: ['River Plate'] },
  { id: 'rosario-central', name: 'Rosario Central', short: 'Central', crest: 'rosario-central', aliases: ['Rosario Central'] },
  { id: 'sacachispas', name: 'Sacachispas', crest: 'sacachispas', aliases: ['Sacachispas'] },
  { id: 'san-lorenzo', name: 'San Lorenzo de Almagro', short: 'San Lorenzo', crest: 'san-lorenzo', aliases: ['San Lorenzo', 'San Lorenzo de Almagro', 'CASL', 'Club Atlético San Lorenzo de Almagro'] },
  { id: 'san-lorenzo-mdp', name: 'San Lorenzo de Mar del Plata', short: 'San Lorenzo (MdP)', crest: null, aliases: ['San Lorenzo (Mar del Plata)', 'San Lorenzo (MdP)'] },
  { id: 'san-martin-burzaco', name: 'San Martín de Burzaco', short: 'SM Burzaco', crest: 'san-martin-burzaco', aliases: ['San Martín de Burzaco'] },
  { id: 'san-martin-formosa', name: 'San Martín de Formosa', short: 'SM Formosa', crest: null, aliases: ['San Martín de Formosa'] },
  { id: 'san-martin-mendoza', name: 'San Martín de Mendoza', short: 'SM Mendoza', crest: null, aliases: ['San Martín (Mendoza)', 'San Martín de Mendoza'] },
  // "CA San Martín" y "San Martín" a secas conviven en la misma tabla con "CASMT"
  // (Tucumán), y coinciden con las temporadas de San Juan en Nacional y en Primera.
  { id: 'san-martin-sj', name: 'San Martín de San Juan', short: 'SM San Juan', crest: 'san-martin-sj', aliases: ['San Martín de San Juan', 'CA San Martín', 'San Martín'] },
  { id: 'san-martin-tucuman', name: 'San Martín de Tucumán', short: 'SM Tucumán', crest: 'san-martin-tucuman', aliases: ['San Martín de Tucumán', 'San Martín (Tucumán)', 'CASMT'] },
  { id: 'san-miguel', name: 'San Miguel', crest: 'san-miguel', aliases: ['San Miguel'] },
  { id: 'san-telmo', name: 'San Telmo', crest: 'san-telmo', aliases: ['San Telmo'] },
  { id: 'sarmiento-junin', name: 'Sarmiento de Junín', short: 'Sarmiento', crest: 'sarmiento-junin', aliases: ['Sarmiento de Junín', 'Sarmiento (Junín)', 'Sarmiento'] },
  { id: 'sportivo-patria', name: 'Sportivo Patria', crest: null, aliases: ['Sportivo Patria'] },
  // "C. A. T." aparece sólo en Nacional 2007 + Primera 2007/08 y 2008/09, justo las
  // temporadas en que Tigre asciende y juega en Primera, y sin ninguna fila "Tigre".
  { id: 'tigre', name: 'Tigre', crest: 'tigre', aliases: ['Tigre', 'C. A. T.'] },
  { id: 'talleres-cordoba', name: 'Talleres de Córdoba', short: 'Talleres', crest: 'talleres-cordoba', aliases: ['Talleres de Córdoba', 'Talleres (Córdoba)', 'Talleres'] },
  { id: 'talleres-re', name: 'Talleres de Remedios de Escalada', short: 'Talleres (RE)', crest: null, aliases: ['Talleres (RE)', 'Talleres (RdE)'] },
  { id: 'temperley', name: 'Temperley', crest: 'temperley', aliases: ['Temperley'] },
  { id: 'tiro-federal', name: 'Tiro Federal de Rosario', short: 'Tiro Federal', crest: null, aliases: ['Tiro Federal de Rosario', 'Tiro'] },
  { id: 'tristan-suarez', name: 'Tristán Suárez', crest: 'tristan-suarez', aliases: ['Tristán Suárez'] },
  { id: 'uai-urquiza', name: 'UAI Urquiza', crest: 'uai-urquiza', aliases: ['UAI Urquiza'] },
  { id: 'union-san-juan', name: 'Unión de San Juan', short: 'Unión (SJ)', crest: null, aliases: ['Unión (San Juan)'] },
  { id: 'union-santa-fe', name: 'Unión de Santa Fe', short: 'Unión', crest: 'union-santa-fe', aliases: ['Unión de Santa Fe', 'Unión (Santa Fe)', 'Unión', 'Unión (Sta. Fe)'] },
  { id: 'velez', name: 'Vélez Sarsfield', short: 'Vélez', crest: 'velez-sarsfield', aliases: ['Vélez Sarsfield', 'Vélez Sársfield'] },
  { id: 'victoriano-arenas', name: 'Victoriano Arenas', crest: null, aliases: ['Victoriano Arenas'] },
  { id: 'villa-dalmine', name: 'Villa Dálmine', crest: 'villa-dalmine', aliases: ['Villa Dálmine'] },
  { id: 'villa-mitre', name: 'Villa Mitre de Bahía Blanca', short: 'Villa Mitre', crest: null, aliases: ['Villa Mitre de Bahía Blanca', 'Villa Mitre'] },
  { id: 'villa-san-carlos', name: 'Villa San Carlos', crest: 'villa-san-carlos', aliases: ['Villa San Carlos', 'Villa San Carlo'] },
  { id: 'yupanqui', name: 'Yupanqui', crest: null, aliases: ['CSD Yupanqui'] },

  // ---------- exterior ----------
  { id: 'alianza-lima', name: 'Alianza Lima', crest: null, intl: true, aliases: ['Alianza Lima'] },
  { id: 'america-cali', name: 'América de Cali', crest: null, intl: true, aliases: ['América de Cali'] },
  { id: 'atletico-nacional', name: 'Atlético Nacional', crest: null, intl: true, aliases: ['Atlético Nacional'] },
  { id: 'boston-river', name: 'Boston River', crest: null, intl: true, aliases: ['Boston River'] },
  { id: 'caracas', name: 'Caracas FC', crest: null, intl: true, aliases: ['Caracas FC'] },
  { id: 'cd-lara', name: 'Deportivo Lara', crest: null, intl: true, aliases: ['CD Lara'] },
  { id: 'colo-colo', name: 'Colo-Colo', crest: null, intl: true, aliases: ['Colo-Colo'] },
  { id: 'corinthians', name: 'Corinthians', crest: null, intl: true, aliases: ['Corinthians SP'] },
  { id: 'cruzeiro', name: 'Cruzeiro', crest: null, intl: true, aliases: ['Cruzeiro'] },
  { id: 'danubio', name: 'Danubio', crest: null, intl: true, aliases: ['Danubio'] },
  { id: 'defensor-sporting', name: 'Defensor Sporting', crest: null, intl: true, aliases: ['Defensor Sporting'] },
  { id: 'deportivo-anzoategui', name: 'Deportivo Anzoátegui', crest: null, intl: true, aliases: ['Deportivo Anzoátegui'] },
  { id: 'emelec', name: 'Emelec', crest: null, intl: true, aliases: ['Emelec'] },
  { id: 'guarani-py', name: 'Club Guaraní', crest: null, intl: true, aliases: ['Club Guaraní'] },
  { id: 'independiente-santa-fe', name: 'Independiente Santa Fe', short: 'Santa Fe', crest: null, intl: true, aliases: ['Santa Fe'] },
  { id: 'libertad', name: 'Libertad', crest: null, intl: true, aliases: ['Libertad'] },
  { id: 'mineros', name: 'Mineros de Guayana', crest: null, intl: true, aliases: ['Mineros de Guayana'] },
  { id: 'once-caldas', name: 'Once Caldas', crest: null, intl: true, aliases: ['Once Caldas'] },
  { id: 'penarol', name: 'Peñarol', crest: null, intl: true, aliases: ['Peñarol'] },
  { id: 'sport-recife', name: 'Sport Recife', crest: null, intl: true, aliases: ['Sport Recife - PE'] },
  { id: 'sporting-cristal', name: 'Sporting Cristal', crest: null, intl: true, aliases: ['Sporting Cristal'] },
  { id: 'union-espanola', name: 'Unión Española', crest: null, intl: true, aliases: ['Unión Española'] },
  { id: 'universitario-sucre', name: 'Universitario de Sucre', crest: null, intl: true, aliases: ['Universitario de Sucre'] },
];

/* ------------------------------------------------------------------ */

/** Clave de comparación: sin acentos, sin puntuación, en minúsculas. */
export function normalizeName(raw) {
  return String(raw || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const BY_ALIAS = new Map();
const BY_ID = new Map();

for (const club of CLUBS) {
  BY_ID.set(club.id, club);
  BY_ALIAS.set(normalizeName(club.name), club);
  for (const alias of club.aliases) BY_ALIAS.set(normalizeName(alias), club);
}

const derived = new Map();

/** Palabras que no aportan identidad y estorban al comparar nombres nuevos. */
const NOISE = new Set(['club', 'atletico', 'atl', 'deportivo', 'dep', 'de', 'del', 'la', 'las', 'el', 'los', 'y', 'ca', 'cd', 'csd', 'ac', 'fc']);

/** Monograma de hasta 3 letras para clubes sin escudo. */
export function monogram(name) {
  const words = normalizeName(name).split(' ').filter((w) => w && !NOISE.has(w));
  if (!words.length) return '?';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase();
}

/**
 * Devuelve el club canónico para un nombre de la base.
 * Si no está registrado, arma uno al vuelo (sin escudo) para que la app
 * siga funcionando y el rival igual tenga su propia página.
 */
export function resolveClub(rawName) {
  const key = normalizeName(rawName);
  const known = BY_ALIAS.get(key);
  if (known) return known;

  if (derived.has(key)) return derived.get(key);
  const fallback = {
    id: key.replace(/ /g, '-') || 'sin-datos',
    name: String(rawName || 'Rival sin identificar'),
    crest: null,
    unregistered: true,
  };
  derived.set(key, fallback);
  BY_ALIAS.set(key, fallback);
  return fallback;
}

export const clubById = (id) => BY_ID.get(id) || derived.get(String(id).replace(/-/g, ' ')) || null;

/** Ruta del escudo, o null si el club no tiene archivo propio. */
export const crestUrl = (club) => (club && club.crest ? `${CREST_DIR}/${club.crest}.png` : null);

/** Nombre corto listo para espacios reducidos. */
export const clubShort = (club) => (club && (club.short || club.name)) || '';

export const allClubs = () => CLUBS.slice();
