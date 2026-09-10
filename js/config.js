/**
 * Configuración global. Único lugar con credenciales y constantes de entorno.
 */

export const SUPABASE_URL = 'https://mivrowudnkxgnppeweqe.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pdnJvd3Vkbmt4Z25wcGV3ZXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MTM2MjgsImV4cCI6MjEwNDQ4OTYyOH0.cF--JR5gfP5ah9isjQYUYUSOvC84UDqSudbzzXR16Ug';

/** Bucket de Storage donde viven las fotos aportadas. */
export const PHOTO_BUCKET = 'match-photos';

/** Edge Function que administra el roster de historiadores (login requerido). */
export const ADMIN_FN_URL = `${SUPABASE_URL}/functions/v1/admin-users`;

/** Carpeta de escudos. Para sumar uno nuevo: dejar el PNG acá y registrarlo en js/data/clubs.js */
export const CREST_DIR = 'assets/clubs';
export const HURACAN_CREST = `${CREST_DIR}/huracan.png`;

/** Carpeta del "vestidor" del hero (fotos pre-generadas con IA). Ver js/data/dressup.js. */
export const HERO_DIR = 'assets/hero';

export const FIRST_YEAR = 1973;

/** Tamaño máximo aceptado en el aporte de fotos. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Cuántas piezas se pintan por tanda en la colección (scroll infinito). */
export const PAGE_SIZE = 48;

/**
 * Campos extra del formulario de aporte (jugador y tipo de camiseta).
 * Poner en true DESPUÉS de correr supabase/extensiones.sql y de extender la
 * función submit_kit_info; si no, la RPC rechaza los parámetros nuevos.
 */
export const EXTENDED_CONTRIB = false;

/** Clave de caché de sesión para no re-descargar el archivo en cada navegación. */
export const CACHE_KEY = 'hmw:matches:v1';
export const CACHE_TTL_MS = 15 * 60 * 1000;
