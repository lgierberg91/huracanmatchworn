/**
 * Cliente REST de Supabase. Sin SDK: sólo fetch.
 * Todas las escrituras pasan por la función RPC `submit_kit_info`, igual que antes.
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY, PHOTO_BUCKET } from '../config.js';
import { authHeaders } from './auth.js';

const PAGE = 1000;

function headers(extra) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...(extra || {}),
  };
}

async function readError(response) {
  const text = await response.text().catch(() => '');
  return new Error(text || `Supabase respondió ${response.status}`);
}

/**
 * Trae el archivo completo paginando de a 1000.
 * `onPage` recibe cada tanda para poder pintar antes de tener todo.
 */
export async function fetchAllMatches(onPage) {
  const all = [];
  for (let offset = 0; ; offset += PAGE) {
    const url =
      `${SUPABASE_URL}/rest/v1/matches?select=*&order=date.asc&limit=${PAGE}&offset=${offset}`;
    const response = await fetch(url, { headers: headers() });
    if (!response.ok) throw await readError(response);
    const chunk = await response.json();
    all.push(...chunk);
    if (onPage) onPage(chunk, all.length);
    if (chunk.length < PAGE) break;
  }
  return all;
}

export async function fetchPhotos(matchId) {
  const url =
    `${SUPABASE_URL}/rest/v1/match_photos?match_id=eq.${encodeURIComponent(matchId)}` +
    '&select=*&order=created_at.asc';
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) throw await readError(response);
  return response.json();
}

/** Camisetas oficiales del partido (jugador / arquero, frente / dorso). */
export async function fetchKits(matchId) {
  const url =
    `${SUPABASE_URL}/rest/v1/match_kits?match_id=eq.${encodeURIComponent(matchId)}` +
    '&select=*';
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) throw await readError(response);
  return response.json();
}

export const photoUrl = (storagePath) =>
  `${SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${storagePath}`;

/** Sube el frente o el dorso de una camiseta oficial (jugador o arquero) al bucket. */
export async function uploadKitPhoto(matchId, role, side, file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `kits/${matchId}/${role}-${side}-${Date.now()}-${safeName}`;

  const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/${PHOTO_BUCKET}/${path}`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': file.type || 'application/octet-stream' }),
    body: file,
  });
  if (!upload.ok) throw await readError(upload);

  return path;
}

/**
 * Crea o actualiza la fila de camiseta oficial (jugador/arquero) de un partido.
 * Sólo se tocan las columnas presentes en `fields`; el resto queda como estaba.
 */
export async function upsertKit(matchId, role, fields) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/match_kits?on_conflict=match_id,role`, {
    method: 'POST',
    headers: authHeaders({
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    }),
    body: JSON.stringify({ match_id: matchId, role, ...fields }),
  });
  if (!response.ok) throw await readError(response);
  const rows = await response.json();
  return rows[0];
}

/**
 * Aporte de datos de camiseta / historia / video.
 * Sólo se mandan los campos presentes; el resto queda como está en la base.
 */
export async function submitKitInfo(payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_kit_info`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await readError(response);
  return true;
}

/** Sube el archivo al bucket y registra la fila en match_photos. */
export async function uploadPhoto(matchId, file, contributorName) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `${matchId}/${Date.now()}-${safeName}`;

  const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/${PHOTO_BUCKET}/${path}`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': file.type || 'application/octet-stream' }),
    body: file,
  });
  if (!upload.ok) throw await readError(upload);

  const row = await fetch(`${SUPABASE_URL}/rest/v1/match_photos`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify({
      match_id: matchId,
      storage_path: path,
      caption: null,
      contributor_name: contributorName || null,
    }),
  });
  if (!row.ok) throw await readError(row);

  return path;
}
