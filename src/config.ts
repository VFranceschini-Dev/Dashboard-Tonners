// Configuración central de la aplicación.
// Los valores se cargan desde variables de entorno de Vite (archivo .env).
// NUNCA hardcodear credenciales ni URLs reales aquí.

/** URL del servidor MeshCentral (ej: https://mesh.midominio.com) */
export const MESH_CENTRAL_URL: string =
  (import.meta.env.VITE_MESH_CENTRAL_URL as string | undefined) ?? '';

/**
 * Clave de API de MeshCentral para el modo "ServerSecret".
 * ⚠️ ADVERTENCIA: exponer la API key en una app frontend la hace visible
 * para cualquier usuario. Lo correcto en producción es desplegar la
 * función `functions/mesh-proxy` (Supabase Edge Function / proxy propio)
 * y usar VITE_MESH_PROXY_URL en su lugar, dejando esta variable vacía.
 */
export const MESH_API_KEY: string =
  (import.meta.env.VITE_MESH_API_KEY as string | undefined) ?? '';

/** Proxy backend recomendado: la API key queda del lado del servidor */
export const MESH_PROXY_URL: string =
  (import.meta.env.VITE_MESH_PROXY_URL as string | undefined) ?? '';
