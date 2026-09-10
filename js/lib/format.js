/**
 * Formateo de fechas, números y etiquetas de resultado.
 */

export const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const parts = (iso) => String(iso || '').split('-').map(Number);

/** 12 de octubre de 1975 */
export function dateLong(iso) {
  const [y, m, d] = parts(iso);
  if (!y) return '';
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
}

/** 12 oct 1975 */
export function dateMedium(iso) {
  const [y, m, d] = parts(iso);
  if (!y) return '';
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

/** 12.10.75 */
export function dateShort(iso) {
  const [y, m, d] = parts(iso);
  if (!y) return '';
  return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${String(y).slice(2)}`;
}

/** 12 oct */
export function dayMonth(iso) {
  const [, m, d] = parts(iso);
  if (!m) return '';
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}

export const num = (value) => Number(value || 0).toLocaleString('es-AR');

export function plural(count, one, many) {
  return `${num(count)} ${count === 1 ? one : many}`;
}

/** Diferencia en años completos entre una fecha y hoy. */
export function yearsAgo(iso) {
  const [y, m, d] = parts(iso);
  const then = new Date(y, m - 1, d);
  const now = new Date();
  let diff = now.getFullYear() - then.getFullYear();
  const beforeAnniversary =
    now.getMonth() < then.getMonth() ||
    (now.getMonth() === then.getMonth() && now.getDate() < then.getDate());
  if (beforeAnniversary) diff -= 1;
  return diff;
}

export const RESULT_LABEL = { W: 'PG', D: 'E', L: 'PP' };
export const RESULT_LONG = { W: 'Victoria', D: 'Empate', L: 'Derrota' };
export const RESULT_CLASS = { W: 'w', D: 'd', L: 'l' };

export const resultLabel = (r) => RESULT_LABEL[r] || '—';
export const resultLong = (r) => RESULT_LONG[r] || 'A jugarse';
export const resultClass = (r) => RESULT_CLASS[r] || 'x';

export const VENUE_LONG = { H: 'Huracán de local', A: 'Huracán de visitante', N: 'Cancha neutral' };
export const VENUE_SHORT = { H: 'Local', A: 'Visitante', N: 'Neutral' };

export const venueLong = (v) => VENUE_LONG[v] || 'Sin dato';
export const venueShort = (v) => VENUE_SHORT[v] || '—';

/** Ordinal de década: 1970 -> "años 70" */
export const decadeLabel = (decade) => `Años ${String(decade).slice(2)}`;
