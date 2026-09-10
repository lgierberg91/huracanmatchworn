/**
 * Estado del archivo: carga, índices derivados, estadísticas y motor de filtros.
 * Es la única fuente de verdad; las vistas sólo leen de acá.
 */

import { fetchAllMatches } from './api.js';
import { enrich, CLASICO_ID } from './model.js';
import { normalizeName } from './clubs.js';
import { FAMILIES } from './competitions.js';
import { BRANDS } from './brands.js';
import { CACHE_KEY, CACHE_TTL_MS, FIRST_YEAR } from '../config.js';
import { favorites } from '../lib/storage.js';

export const state = {
  status: 'idle', // idle | loading | ready | error
  matches: [],
  error: null,
  loaded: 0,
};

const listeners = new Set();
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
const emit = () => listeners.forEach((fn) => fn(state));

/* ---------------- índices ---------------- */

let byId = new Map();
let byYear = new Map();
let byClub = new Map();
let stats = null;

function buildIndexes() {
  byId = new Map();
  byYear = new Map();
  byClub = new Map();

  for (const match of state.matches) {
    byId.set(match.id, match);

    if (!byYear.has(match.year)) byYear.set(match.year, []);
    byYear.get(match.year).push(match);

    const id = match.club.id;
    if (!byClub.has(id)) byClub.set(id, { club: match.club, matches: [] });
    byClub.get(id).matches.push(match);
  }
  stats = null;
}

/* ---------------- carga ---------------- */

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.at || Date.now() - parsed.at > CACHE_TTL_MS) return null;
    return parsed.rows;
  } catch {
    return null;
  }
}

function writeCache(rows) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), rows }));
  } catch {
    /* cuota llena: no es crítico */
  }
}

let loadPromise = null;

export function load() {
  if (loadPromise) return loadPromise;

  const cached = readCache();
  if (cached) {
    state.matches = cached.map(enrich);
    state.loaded = state.matches.length;
    state.status = 'ready';
    buildIndexes();
    loadPromise = Promise.resolve(state);
    emit();
    return loadPromise;
  }

  state.status = 'loading';
  emit();

  loadPromise = fetchAllMatches((chunk, total) => {
    // pinta la primera tanda apenas llega, sin esperar el archivo completo
    state.matches.push(...chunk.map(enrich));
    state.loaded = total;
    buildIndexes();
    if (state.status === 'loading') emit();
  })
    .then((rows) => {
      state.status = 'ready';
      buildIndexes();
      writeCache(rows);
      emit();
      return state;
    })
    .catch((error) => {
      state.status = 'error';
      state.error = error;
      emit();
      throw error;
    });

  return loadPromise;
}

/** Refresca un partido en memoria después de un aporte, sin volver a bajar todo. */
export function patchMatch(id, changes) {
  const current = byId.get(id);
  if (!current) return null;
  const updated = enrich({ ...current, ...changes });
  const index = state.matches.findIndex((m) => m.id === id);
  if (index >= 0) state.matches[index] = updated;
  buildIndexes();
  try { sessionStorage.removeItem(CACHE_KEY); } catch { /* noop */ }
  return updated;
}

/* ---------------- accesores ---------------- */

export const getMatch = (id) => byId.get(id) || null;
export const matchesOfYear = (year) => (byYear.get(Number(year)) || []).slice();
export const clubEntry = (id) => byClub.get(id) || null;
export const allYears = () => [...byYear.keys()].sort((a, b) => a - b);

/** Rivales ordenados por cantidad de partidos, con su balance. */
export function clubRanking() {
  return [...byClub.values()]
    .map((entry) => ({ ...entry, ...record(entry.matches) }))
    .sort((a, b) => b.matches.length - a.matches.length);
}

/** Balance PG/E/PP y goles de un conjunto de partidos. */
export function record(matches) {
  let w = 0, d = 0, l = 0, gf = 0, ga = 0, played = 0;
  for (const m of matches) {
    if (!m.played) continue;
    played++;
    gf += m.gf; ga += m.ga;
    if (m.result === 'W') w++;
    else if (m.result === 'D') d++;
    else if (m.result === 'L') l++;
  }
  return { w, d, l, gf, ga, played, total: matches.length };
}

/* ---------------- estadísticas globales ---------------- */

export function globalStats() {
  if (stats) return stats;

  const matches = state.matches;
  const base = record(matches);
  const years = allYears();
  const ranking = clubRanking();

  const familyCounts = new Map();
  for (const m of matches) {
    familyCounts.set(m.family.id, (familyCounts.get(m.family.id) || 0) + 1);
  }

  const yearCounts = years.map((y) => ({ year: y, matches: byYear.get(y) }));
  const bestYear = yearCounts
    .map(({ year, matches: list }) => ({ year, ...record(list) }))
    .filter((y) => y.played >= 10)
    .sort((a, b) => b.w / b.played - a.w / a.played)[0] || null;

  const decadeCounts = new Map();
  for (const m of matches) decadeCounts.set(m.decade, (decadeCounts.get(m.decade) || 0) + 1);
  const topDecade = [...decadeCounts.entries()].sort((a, b) => b[1] - a[1])[0] || null;

  const biggestWin = matches
    .filter((m) => m.played && m.result === 'W')
    .sort((a, b) => b.diff - a.diff || b.gf - a.gf)[0] || null;

  const clasico = byClub.get(CLASICO_ID);

  stats = {
    total: matches.length,
    played: base.played,
    pending: matches.length - base.played,
    w: base.w, d: base.d, l: base.l,
    gf: base.gf, ga: base.ga,
    winRate: base.played ? base.w / base.played : 0,
    seasons: years.length,
    firstYear: years[0] || FIRST_YEAR,
    lastYear: years[years.length - 1] || FIRST_YEAR,
    rivals: byClub.size,
    competitions: familyCounts.size,
    familyCounts,
    ranking,
    topRival: ranking[0] || null,
    topDecade: topDecade ? { decade: topDecade[0], count: topDecade[1] } : null,
    bestYear,
    biggestWin,
    clasico: clasico ? { ...clasico, ...record(clasico.matches) } : null,
    withKit: matches.filter((m) => m.hasKit).length,
    withPhoto: matches.filter((m) => m.kitPhoto).length,
    withStory: matches.filter((m) => m.hasStory).length,
    withVideo: matches.filter((m) => m.hasVideo).length,
    home: matches.filter((m) => m.venue === 'H').length,
    away: matches.filter((m) => m.venue === 'A').length,
    neutral: matches.filter((m) => m.venue === 'N').length,
  };
  return stats;
}

/* ---------------- selecciones para la home ---------------- */

/** Partidos jugados un día como hoy, del más reciente al más viejo. */
export function onThisDay(reference = new Date()) {
  const mm = String(reference.getMonth() + 1).padStart(2, '0');
  const dd = String(reference.getDate()).padStart(2, '0');
  const suffix = `-${mm}-${dd}`;
  return state.matches
    .filter((m) => m.date.endsWith(suffix) && m.played)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Piezas destacadas: primero lo que tiene material, después el peso deportivo. */
export function featured(limit = 8) {
  return state.matches
    .filter((m) => m.highlight > 0)
    .sort((a, b) => b.highlight - a.highlight || b.date.localeCompare(a.date))
    .slice(0, limit);
}

/**
 * La pieza del día: estable durante toda la jornada y distinta cada día.
 * Se elige entre las mejores 150 para que siempre sea algo que valga la pena mirar.
 */
export function pieceOfTheDay(reference = new Date()) {
  // Se dejan afuera las goleadas en contra: la vidriera del día no es para eso.
  const candidates = state.matches
    .filter((m) => m.played && m.highlight > 0 && m.diff > -3)
    .sort((a, b) => b.highlight - a.highlight);

  // Y se prefiere lo que tiene imagen propia (foto de la camiseta o escudo del
  // rival): el hero es lo primero que se ve y un monograma solo queda pobre.
  const withArt = candidates.filter((m) => m.kitPhoto || m.club.crest);
  const pool = (withArt.length >= 40 ? withArt : candidates).slice(0, 150);
  if (!pool.length) return state.matches[0] || null;

  const seed = Number(
    `${reference.getFullYear()}${String(reference.getMonth() + 1).padStart(2, '0')}${String(reference.getDate()).padStart(2, '0')}`
  );
  return pool[seed % pool.length];
}

/** Últimos partidos jugados (el archivo llega hasta el fixture futuro). */
export function latestPlayed(limit = 6) {
  const today = new Date().toISOString().slice(0, 10);
  return state.matches
    .filter((m) => m.played && m.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function nextFixtures(limit = 4) {
  const today = new Date().toISOString().slice(0, 10);
  return state.matches
    .filter((m) => !m.played && m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

/* ---------------- filtros ---------------- */

export const emptyQuery = () => ({
  q: '',
  decades: [],
  clubs: [],
  families: [],
  venues: [],
  results: [],
  years: [],
  brands: [],
  onlyKit: false,
  onlyMissing: false,
  onlyFav: false,
  sort: 'newest',
});

const SORTERS = {
  // Primero lo jugado, de lo más nuevo a lo más viejo; el fixture que viene, al final.
  newest: (a, b) => {
    if (a.played !== b.played) return a.played ? -1 : 1;
    return a.played ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
  },
  oldest: (a, b) => a.date.localeCompare(b.date),
  highlight: (a, b) => b.highlight - a.highlight || b.date.localeCompare(a.date),
  rival: (a, b) => a.club.name.localeCompare(b.club.name, 'es') || a.date.localeCompare(b.date),
  goles: (a, b) => (b.gf ?? -1) - (a.gf ?? -1) || b.date.localeCompare(a.date),
};

export function runQuery(query) {
  const q = normalizeName(query.q || '');
  const terms = q ? q.split(' ').filter(Boolean) : [];
  const decades = new Set(query.decades || []);
  const clubs = new Set(query.clubs || []);
  const families = new Set(query.families || []);
  const venues = new Set(query.venues || []);
  const results = new Set(query.results || []);
  const years = new Set(query.years || []);
  const brands = new Set(query.brands || []);
  const favs = query.onlyFav ? favorites() : null;

  const out = state.matches.filter((m) => {
    if (decades.size && !decades.has(m.decade)) return false;
    if (clubs.size && !clubs.has(m.club.id)) return false;
    if (families.size && !families.has(m.family.id)) return false;
    if (venues.size && !venues.has(m.venue)) return false;
    if (results.size && !results.has(m.result || 'P')) return false;
    if (years.size && !years.has(m.year)) return false;
    if (brands.size && !brands.has(m.kitBrand)) return false;
    if (query.onlyKit && !m.hasKit) return false;
    if (query.onlyMissing && m.hasKit) return false;
    if (favs && !favs.has(m.id)) return false;
    if (terms.length && !terms.every((t) => m.searchKey.includes(t))) return false;
    return true;
  });

  return out.sort(SORTERS[query.sort] || SORTERS.newest);
}

/** Búsqueda rápida para el overlay: partidos + rivales + años. */
export function quickSearch(text, limit = 8) {
  const q = normalizeName(text);
  if (!q) return { matches: [], clubs: [], years: [] };
  const terms = q.split(' ').filter(Boolean);
  const hit = (key) => terms.every((t) => key.includes(t));

  const clubs = clubRanking()
    .filter((entry) => hit(normalizeName(entry.club.name)))
    .slice(0, 4);

  const years = allYears()
    .filter((y) => String(y).includes(q.replace(/\D/g, '')) && /\d/.test(q))
    .slice(0, 3);

  const matches = state.matches
    .filter((m) => hit(m.searchKey))
    .sort((a, b) => b.highlight - a.highlight || b.date.localeCompare(a.date))
    .slice(0, limit);

  return { matches, clubs, years };
}

/** Opciones de filtro con su cantidad, para no ofrecer combinaciones vacías. */
export function facetCounts() {
  const decades = new Map();
  const families = new Map();
  const years = new Map();
  const brands = new Map();
  for (const m of state.matches) {
    decades.set(m.decade, (decades.get(m.decade) || 0) + 1);
    families.set(m.family.id, (families.get(m.family.id) || 0) + 1);
    years.set(m.year, (years.get(m.year) || 0) + 1);
    if (m.kitBrand) brands.set(m.kitBrand, (brands.get(m.kitBrand) || 0) + 1);
  }
  return {
    decades: [...decades.entries()].sort((a, b) => b[0] - a[0]),
    families: FAMILIES.filter((f) => families.has(f.id)).map((f) => ({ ...f, count: families.get(f.id) })),
    years: [...years.entries()].sort((a, b) => b[0] - a[0]),
    brands: BRANDS.filter((b) => brands.has(b.id)).map((b) => ({ ...b, count: brands.get(b.id) })),
  };
}

