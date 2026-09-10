/**
 * Enriquecimiento de cada partido.
 *
 * La base guarda datos crudos; acá se derivan todos los campos que la interfaz
 * necesita (club canónico, familia de torneo, ronda traducida, índice de búsqueda,
 * puntaje de destacado). Se hace una sola vez al cargar.
 */

import { resolveClub, normalizeName } from './clubs.js';
import { competitionFamily, editionLabel, phaseLabel, localizeRound, isKnockout } from './competitions.js';

/** El clásico de Huracán. Se usa para destacar y para la sección de rivalidades. */
export const CLASICO_ID = 'san-lorenzo';

/** Rivales de peso histórico, sólo para ordenar destacados. */
const BIG_RIVALS = new Set(['boca-juniors', 'river-plate', 'racing-club', 'independiente', 'san-lorenzo']);

/**
 * Campos opcionales que todavía no existen en la tabla `matches`.
 * Si algún día se agregan (ver supabase/extensiones.sql), la interfaz los toma sola,
 * porque el fetch pide `select=*`.
 */
const optional = (row, key) => (row && row[key] != null && row[key] !== '' ? row[key] : null);

export function enrich(row) {
  const club = resolveClub(row.opponent);
  const family = competitionFamily(row.competition);
  const roundLabel = localizeRound(row.round);
  const played = row.gf != null && row.ga != null;
  const diff = played ? row.gf - row.ga : null;

  const kitPhoto = optional(row, 'kit_photo_path');
  const kitDescription = optional(row, 'kit_description');
  const player = optional(row, 'player');
  const kitType = optional(row, 'kit_type');

  const match = {
    ...row,
    club,
    family,
    edition: editionLabel(row.competition),
    phase: phaseLabel(row.competition),
    roundLabel,
    knockout: isKnockout(row.round),
    decade: Math.floor(row.year / 10) * 10,
    played,
    diff,
    player,
    kitType,
    kitPhoto,
    kitDescription,
    hasKit: Boolean(kitPhoto || kitDescription),
    hasStory: Boolean(optional(row, 'story_text')),
    hasVideo: Boolean(optional(row, 'youtube_url')),
    scorersList: parseScorers(row.scorers),
  };

  const { score, reason } = rateHighlight(match);
  match.highlight = score;
  match.highlightReason = reason;
  match.searchKey = buildSearchKey(match);

  return match;
}

/** Los goleadores llegan como texto libre; se parten por coma o punto y coma. */
function parseScorers(raw) {
  if (!raw) return [];
  return String(raw)
    .split(/[;,]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildSearchKey(match) {
  return normalizeName(
    [
      match.opponent,
      match.club.name,
      match.club.short || '',
      match.competition,
      match.roundLabel,
      match.family.label,
      match.player || '',
      match.kitDescription || '',
      String(match.year),
      match.date,
    ].join(' ')
  );
}

/**
 * Puntaje de "pieza destacada".
 * Prioriza lo que realmente tiene material cargado y, después, el peso deportivo.
 * Devuelve además el motivo principal, que se muestra al usuario.
 */
function rateHighlight(match) {
  const reasons = [];
  let score = 0;

  if (match.featured === true) { score += 60; reasons.push([60, 'Pieza destacada']); }
  if (match.kitPhoto) { score += 32; reasons.push([32, 'Con foto de la camiseta']); }
  if (match.kitDescription) { score += 18; reasons.push([18, 'Camiseta identificada']); }
  if (match.hasStory) { score += 14; reasons.push([14, 'Con historia']); }
  if (match.hasVideo) { score += 10; reasons.push([10, 'Con video']); }

  if (/^final/i.test(match.roundLabel)) { score += 30; reasons.push([30, 'Final']); }
  else if (match.knockout) { score += 18; reasons.push([18, 'Partido de definición']); }

  if (match.family.tier === 'internacional') {
    score += 16;
    reasons.push([16, match.family.label]);
  }

  if (match.club.id === CLASICO_ID) { score += 14; reasons.push([14, 'Clásico']); }
  else if (BIG_RIVALS.has(match.club.id)) { score += 6; reasons.push([6, 'Rival grande']); }

  if (match.diff != null) {
    if (match.diff >= 6) { score += 22; reasons.push([22, 'Goleada histórica']); }
    else if (match.diff >= 4) { score += 14; reasons.push([14, 'Goleada']); }
  }

  reasons.sort((a, b) => b[0] - a[0]);
  return { score, reason: reasons.length ? reasons[0][1] : '' };
}

/**
 * Color de acento de una pieza según el resultado.
 * Devuelve nombres de variables CSS, no valores: respeta el tema claro/oscuro.
 */
export function accentVars(match) {
  const key = match.result === 'W' ? 'win' : match.result === 'D' ? 'draw' : match.result === 'L' ? 'loss' : null;
  if (!key) return '--card-accent: var(--line-2);';
  return `--card-accent: var(--${key}); --card-wash: color-mix(in srgb, var(--${key}) 13%, transparent);`;
}
