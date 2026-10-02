// ============================================================
// Hash de contraseña para el login local (WebCrypto, SHA-256 + salt).
// ⚠️ Nota de seguridad: una SPA sin backend NO puede tener autenticación
// real. Este módulo evita exponer contraseñas en claro en el bundle,
// pero la validación sigue siendo client-side. Para producción, mover
// la autenticación a un proveedor real (Supabase Auth, OIDC, etc.).
// ============================================================

const SALT = 'donnet-toner-v3';

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(SALT + password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Comparación en tiempo constante (evita timing attacks básicos) */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
