/**
 * Sesión del grupo cerrado de historiadores.
 * El archivo se sigue leyendo sin cuenta; sólo aportar datos requiere login.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const state = {
  status: 'loading', // loading | out | in
  session: null,
  profile: null,
};

const listeners = new Set();
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
const emit = () => listeners.forEach((fn) => fn(state));

async function loadProfile(session) {
  if (!session) return null;
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=user_id,email,display_name,role&user_id=eq.${session.user.id}`,
      { headers: authHeaders() }
    );
    if (!response.ok) return null;
    const rows = await response.json();
    return rows[0] || null;
  } catch {
    return null;
  }
}

async function applySession(session) {
  state.session = session;
  state.profile = await loadProfile(session);
  state.status = session ? 'in' : 'out';
  emit();
}

let initPromise = null;

/** Se llama una vez al arrancar la app; después, onAuthStateChange se ocupa del resto. */
export function initAuth() {
  if (initPromise) return initPromise;
  initPromise = sb.auth.getSession()
    .then(({ data }) => applySession(data.session))
    .then(() => {
      sb.auth.onAuthStateChange((_event, session) => applySession(session));
    });
  return initPromise;
}

export async function signIn(email, password) {
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export function signOut() {
  return sb.auth.signOut();
}

export const isMember = () => Boolean(state.profile);
export const isAdmin = () => Boolean(state.profile) && state.profile.role === 'admin';

/** Cabeceras para escrituras: token del historiador logueado, o anon (que la RLS rechaza). */
export function authHeaders(extra) {
  const token = (state.session && state.session.access_token) || SUPABASE_ANON_KEY;
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    ...(extra || {}),
  };
}
