/**
 * Normalización de competencias y rondas.
 *
 * En la base cada torneo viene con su año pegado ("Metropolitano 1977",
 * "Primera División 1993/1994 Clausura"), lo que da 133 valores distintos:
 * imposible de usar como filtro. Acá se agrupan en familias estables.
 *
 * Las rondas llegan mezcladas en inglés y español ("Matchday 12", "Fecha 3",
 * "Quarter-finals"); se traducen a una única forma.
 */

/** Familias, en orden de aparición histórica. `tier` agrupa para los filtros gruesos. */
export const FAMILIES = [
  { id: 'metropolitano', label: 'Metropolitano', short: 'Metro', tier: 'liga' },
  { id: 'nacional', label: 'Torneo Nacional', short: 'Nacional', tier: 'liga' },
  { id: 'primera', label: 'Primera División', short: 'Primera', tier: 'liga' },
  { id: 'copa-liga', label: 'Copa de la Liga', short: 'Copa Liga', tier: 'liga' },
  { id: 'bnacional', label: 'Primera B Nacional', short: 'B Nacional', tier: 'ascenso' },
  { id: 'primera-nacional', label: 'Primera Nacional', short: 'Nacional B', tier: 'ascenso' },
  { id: 'promocion', label: 'Promoción y reducidos', short: 'Promoción', tier: 'ascenso' },
  { id: 'copa-argentina', label: 'Copa Argentina', short: 'Copa Arg.', tier: 'copa' },
  { id: 'libertadores', label: 'Copa Libertadores', short: 'Libertadores', tier: 'internacional' },
  { id: 'sudamericana', label: 'Copa Sudamericana', short: 'Sudamericana', tier: 'internacional' },
  { id: 'conmebol', label: 'Copa Conmebol', short: 'Conmebol', tier: 'internacional' },
  { id: 'amistoso', label: 'Amistosos', short: 'Amistoso', tier: 'otro' },
  { id: 'otro', label: 'Otras competencias', short: 'Otras', tier: 'otro' },
];

const FAMILY_BY_ID = new Map(FAMILIES.map((f) => [f.id, f]));
export const familyById = (id) => FAMILY_BY_ID.get(id) || FAMILY_BY_ID.get('otro');

/** Reglas en orden: la primera que matchea gana. */
const RULES = [
  [/reducido|promoci[oó]n|relegation|prom\. rd/i, 'promocion'],
  [/copa argentina/i, 'copa-argentina'],
  [/libertadores/i, 'libertadores'],
  [/sudamericana/i, 'sudamericana'],
  [/conmebol/i, 'conmebol'],
  [/copa de la liga/i, 'copa-liga'],
  [/primera b nacional/i, 'bnacional'],
  [/primera nacional/i, 'primera-nacional'],
  [/metropolitano/i, 'metropolitano'],
  [/^nacional\b/i, 'nacional'],
  [/primera divisi[oó]n/i, 'primera'],
  [/friendl|amistoso/i, 'amistoso'],
];

const familyCache = new Map();

/** "Primera División 1993/1994 Clausura" -> familia `primera` */
export function competitionFamily(competition) {
  const raw = String(competition || '');
  if (familyCache.has(raw)) return familyCache.get(raw);

  let id = 'otro';
  for (const [re, familyId] of RULES) {
    if (re.test(raw)) { id = familyId; break; }
  }
  const family = familyById(id);
  familyCache.set(raw, family);
  return family;
}

/**
 * Etiqueta corta de la edición: saca el nombre del torneo y deja el año/fase.
 * "Primera División 1993/1994 Clausura" -> "1993/1994 Clausura"
 */
export function editionLabel(competition) {
  const raw = String(competition || '');
  const match = raw.match(/(\d{4}(?:\/\d{2,4})?.*)$/);
  return match ? match[1].trim() : raw;
}

/** Fase con nombre propio dentro de la competencia, si la hay. */
export function phaseLabel(competition) {
  const raw = String(competition || '');
  const found = raw.match(/(Apertura|Clausura|Playoffs?|Fase Campe[oó]n|Reducido\/Promoci[oó]n)/i);
  return found ? found[1] : '';
}

/* ---------------- rondas ---------------- */

const ROUND_MAP = [
  [/^matchday\s*(\d+)/i, (m) => `Fecha ${m[1]}`],
  [/^round\s*of\s*(\d+)\s*first leg/i, (m) => `${roundOf(m[1])} · ida`],
  [/^round\s*of\s*(\d+)\s*return match/i, (m) => `${roundOf(m[1])} · vuelta`],
  [/^round\s*of\s*(\d+)/i, (m) => roundOf(m[1])],
  [/^round\s*(\d+)/i, (m) => `Fecha ${m[1]}`],
  [/^(\d+)\.\s*(?:round|rd)\s*first leg/i, (m) => `${m[1]}ª ronda · ida`],
  [/^(\d+)\.\s*(?:round|rd)\s*return match/i, (m) => `${m[1]}ª ronda · vuelta`],
  [/^decider\s*(\d+)\.\s*(?:round|rd)/i, (m) => `Desempate ${m[1]}ª ronda`],
  [/^(\d+)\.\s*(?:round|rd)/i, (m) => `${m[1]}ª ronda`],
  [/^quarter-?finals?/i, () => 'Cuartos de final'],
  [/^semi-?finals?\s*first leg/i, () => 'Semifinal · ida'],
  [/^semi-?finals?\s*return match/i, () => 'Semifinal · vuelta'],
  [/^semi-?finals?/i, () => 'Semifinal'],
  [/^final\s*first leg/i, () => 'Final · ida'],
  [/^final\s*return match/i, () => 'Final · vuelta'],
  [/^final tournament\s*-\s*round\s*(\d+)/i, (m) => `Fase final · fecha ${m[1]}`],
  [/^championship group\s*-\s*round\s*(\d+)/i, (m) => `Grupo campeonato · fecha ${m[1]}`],
  [/^group\s*([A-Z])\s*-\s*round\s*(\d+)/i, (m) => `Grupo ${m[1]} · fecha ${m[2]}`],
  [/^group\s*([A-Z\d]+)$/i, (m) => `Grupo ${m[1]}`],
  [/^grp\.?\s*([A-Z\d]+)$/i, (m) => `Grupo ${m[1]}`],
  [/^inter-?group match/i, () => 'Cruce entre grupos'],
  [/^decider zone\s*([A-Z])/i, (m) => `Desempate zona ${m[1]}`],
  [/^relegation round/i, () => 'Promoción'],
  [/^prom\.\s*rd\s*first leg/i, () => 'Promoción · ida'],
  [/^prom\.\s*rd\s*return match/i, () => 'Promoción · vuelta'],
  [/^week$/i, () => 'Amistoso'],
];

function roundOf(n) {
  const map = { 2: 'Final', 4: 'Semifinal', 8: 'Cuartos de final', 16: 'Octavos de final', 32: '16avos de final' };
  return map[Number(n)] || `Ronda de ${n}`;
}

const roundCache = new Map();

/** Traduce la ronda al castellano conservando los detalles ya escritos en español. */
export function localizeRound(round) {
  const raw = String(round || '').trim();
  if (!raw) return '';
  if (roundCache.has(raw)) return roundCache.get(raw);

  let out = raw;
  for (const [re, fn] of ROUND_MAP) {
    const m = raw.match(re);
    if (m) {
      // conserva aclaraciones entre paréntesis: "Round 5 (Grupo B)"
      const extra = raw.match(/\(([^)]+)\)\s*$/);
      out = fn(m) + (extra ? ` (${extra[1]})` : '');
      break;
    }
  }
  roundCache.set(raw, out);
  return out;
}

/** ¿Es un partido de definición? Sirve para destacar piezas. */
export function isKnockout(round) {
  return /final|semi|cuartos|octavos|16avos|promoci[oó]n|playoff|desempate|reducido/i.test(
    `${localizeRound(round)}`
  );
}
