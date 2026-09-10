/**
 * Preferencias locales: tema, favoritos y nombre del colaborador.
 * Todo tolera localStorage bloqueado (modo privado, iframes).
 */

const read = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : raw;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* sin persistencia: la sesión sigue funcionando igual */
  }
};

/* ---------- tema ---------- */
const THEME_KEY = 'hmw:theme';

export const getTheme = () => read(THEME_KEY, 'auto');

export function applyTheme(theme) {
  const value = theme === 'light' || theme === 'dark' ? theme : 'auto';
  if (value === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', value);
  write(THEME_KEY, value);
  return value;
}

/** auto -> dark -> light -> auto */
export function cycleTheme() {
  const order = ['auto', 'dark', 'light'];
  const next = order[(order.indexOf(getTheme()) + 1) % order.length];
  return applyTheme(next);
}

/** Qué está viendo realmente el usuario ahora mismo. */
export function effectiveTheme() {
  const stored = getTheme();
  if (stored !== 'auto') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/* ---------- favoritos ---------- */
const FAV_KEY = 'hmw:favorites';

let favCache = null;

export function favorites() {
  if (favCache) return favCache;
  try {
    favCache = new Set(JSON.parse(read(FAV_KEY, '[]')));
  } catch {
    favCache = new Set();
  }
  return favCache;
}

export const isFavorite = (id) => favorites().has(id);

export function toggleFavorite(id) {
  const set = favorites();
  if (set.has(id)) set.delete(id);
  else set.add(id);
  write(FAV_KEY, JSON.stringify([...set]));
  return set.has(id);
}

/* ---------- colaborador ---------- */
/* Se mantiene la clave histórica para no perder el nombre ya guardado. */
const NAME_KEY = 'ropero_name';

export const contributorName = () => read(NAME_KEY, '') || '';
export const saveContributorName = (name) => { if (name) write(NAME_KEY, name); };
