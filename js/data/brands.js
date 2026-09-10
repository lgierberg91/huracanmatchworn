/**
 * Marca de la camiseta, para el filtro "Marca" de la colección.
 *
 * No hay un campo de marca en la base: se infiere buscando el nombre de la
 * marca dentro del texto libre de `kit_description` ("Topper 2013 titular"
 * -> Topper). Los partidos sin descripción, o cuya descripción no menciona
 * ninguna marca conocida, quedan sin marca y no entran en este filtro.
 */

export const BRANDS = [
  { id: 'adidas', label: 'Adidas' },
  { id: 'nike', label: 'Nike' },
  { id: 'puma', label: 'Puma' },
  { id: 'topper', label: 'Topper' },
  { id: 'kappa', label: 'Kappa' },
  { id: 'umbro', label: 'Umbro' },
  { id: 'rukava', label: 'Rukava' },
  { id: 'lotto', label: 'Lotto' },
  { id: 'le-coq-sportif', label: 'Le Coq Sportif' },
  { id: 'olympikus', label: 'Olympikus' },
  { id: 'penalty', label: 'Penalty' },
];

const RULES = BRANDS.map((b) => [new RegExp(b.label.replace(/\s+/g, '\\s*'), 'i'), b.id]);
const BRAND_BY_ID = new Map(BRANDS.map((b) => [b.id, b]));
export const brandById = (id) => BRAND_BY_ID.get(id) || null;

const cache = new Map();

/** Texto libre de la camiseta -> id de marca reconocida, o null. */
export function brandFromKit(text) {
  const raw = String(text || '');
  if (!raw) return null;
  if (cache.has(raw)) return cache.get(raw);
  let id = null;
  for (const [re, brandId] of RULES) {
    if (re.test(raw)) { id = brandId; break; }
  }
  cache.set(raw, id);
  return id;
}
