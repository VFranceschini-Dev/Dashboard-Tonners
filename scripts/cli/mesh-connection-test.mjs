#!/usr/bin/env node
/*
 * mesh-connection-test.mjs
 * ---------------------------------------------------------------
 * Prueba la conexión de la aplicación web con MeshCentral
 * (https://mesh.donnet.com.ar) a través de su API REST, usando las
 * MISMAS credenciales/modos que usa el frontend:
 *
 *   Modo 1 — Usuario/contraseña (login real de MeshCentral):
 *     Se autentica con POST /api/login (usuario administrador), obtiene
 *     la cookie de sesión y consulta /api/meshdevices.
 *     Equivalente funcional para pruebas locales del servicio proxy
 *     (functions/mesh-proxy), que hace exactamente esto del lado servidor.
 *
 *   Modo 2 — ServerSecret / API key (header X-Mesh-Token):
 *     Es el modo que usa directamente el frontend cuando se configura
 *     VITE_MESH_API_KEY o VITE_MESH_PROXY_URL (ver src/config.ts y
 *     src/services/meshCentral.ts).
 *
 * Uso:
 *   node scripts/cli/mesh-connection-test.mjs --user admin@midominio --pass 'CONTRASEÑA' --pc NOMBRE_PC
 *   node scripts/cli/mesh-connection-test.mjs --token CLAVE_SERVERSECRET --pc NOMBRE_PC
 *
 * Parámetros:
 *   --url    URL base MeshCentral        (def: $MESH_URL o https://mesh.donnet.com.ar)
 *   --user   Usuario administrador MeshCentral   (o $MESH_USER)
 *   --pass   Contraseña del usuario              (o $MESH_PASS)
 *   --token  ServerSecret / API key              (o $MESH_TOKEN)
 *   --pc     Nombre (o id parcial) de la PC monitorizada a buscar
 *   --insecure  Ignorar errores de certificado TLS (proxies/CA interna)
 *   --json      Imprimir resultado en JSON
 *
 * Códigos de salida:
 *   0 OK (conectado) | 1 error de red/servidor | 2 uso incorrecto
 *   3 autenticación fallida | 4 PC no encontrada | 5 PC desconectada
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import https from 'node:https';

// ---------- carga de .env (si existe en la raíz del repo) ----------
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').splitlines()) {
    const m = line.match(/^\s*(VITE_[A-Z_]+|[A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith('#') && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

// ---------- parseo de argumentos ----------
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    if (key === 'json' || key === 'insecure') { out[key] = true; continue; }
    out[key] = argv[++i];
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const BASE = (args.url || process.env.MESH_URL ||
  process.env.VITE_MESH_CENTRAL_URL || 'https://mesh.donnet.com.ar').replace(/\/+$/, '');
const USER = args.user || process.env.MESH_USER || '';
const PASS = args.pass || process.env.MESH_PASS || '';
const TOKEN = args.token || process.env.MESH_TOKEN || process.env.VITE_MESH_API_KEY || '';
// PC: se pasa siempre con --pc (también acepta $MESH_PC)
const PC = args.pc || process.env.MESH_PC || '';

if (!USER && !TOKEN) {
  console.error('Uso:');
  console.error("  node scripts/cli/mesh-connection-test.mjs --user ADMIN --pass 'CLAVE' --pc NOMBRE_PC");
  console.error('  node scripts/cli/mesh-connection-test.mjs --token SERVER_SECRET --pc NOMBRE_PC');
  console.error('\nOpciones: --url (def: https://mesh.donnet.com.ar) --insecure --json');
  process.exit(2);
}
if (!PC) {
  console.error('⚠️  Falta --pc <nombre>. Se listará igualmente el inventario de dispositivos.');
}

const steps = [];
let failed = false;
function step(name, ok, detail = '') {
  steps.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed = true;
  return ok;
}

// ---------- request HTTP/HTTPS con soporte --insecure ----------
function httpGetOrPost(url, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((res, rej) => {
    const u = new URL(url);
    const isTls = u.protocol === 'https:';
    const lib = isTls ? https : http;
    const req = lib.request({
      hostname: u.hostname, port: u.port || (isTls ? 443 : 80), path: u.pathname + u.search,
      method, headers, rejectUnauthorized: !args.insecure, timeout: 15000,
    }, r => {
      let data = '';
      r.on('data', c => (data += c));
      r.on('end', () => res({ status: r.statusCode, headers: r.headers, body: data }));
    });
    req.on('error', rej);
    req.on('timeout', () => req.destroy(new Error('Timeout de 15s superado')));
    if (body) req.write(body);
    req.end();
  });
}

async function apiFetch(path, opts) {
  try {
    const r = await httpGetOrPost(`${BASE}${path}`, opts);
    return r;
  } catch (e) {
    step(`Conexión TLS/HTTP a ${BASE}`, false, e.message + (e.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' || /certificate/i.test(e.message) ? '. Probá con --insecure' : ''));
    process.exit(1);
  }
}

console.log(`\n🔗 Probando MeshCentral: ${BASE}`);
console.log(`   Modo: ${USER ? 'usuario/contraseña (login)' : 'ServerSecret / API key'}\n`);

// ============================================================
// PASO 1 — Autenticación
// ============================================================
let cookie = null;
if (USER) {
  const r = await apiFetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USER, password: PASS }),
  });
  if (step('Login /api/login', r.status === 200, `HTTP ${r.status}`)) {
    const sc = r.headers['set-cookie'];
    cookie = Array.isArray(sc) ? sc.map(c => c.split(';')[0]).join('; ') : (sc || '');
    if (!cookie) step('Cookie de sesión recibida', false, 'MeshCentral no devolvió cookie (¿2FA activo?)');
    else step('Cookie de sesión recibida', true, cookie.slice(0, 40) + '…');
  } else {
    let msg = '';
    try { msg = JSON.parse(r.body)?.error ?? ''; } catch { msg = r.body?.slice(0, 120) ?? ''; }
    console.error(`   Respuesta: HTTP ${r.status} ${msg}`);
    console.error('   Verificá usuario/contraseña. Si usás 2FA, generá un token o usá --token SERVER_SECRET.');
    process.exit(3);
  }
} else {
  step('ServerSecret configurado', true, `header X-Mesh-Token (${TOKEN.slice(0, 4)}…)`);
}

// ============================================================
// PASO 2 — Consulta de dispositivos (/api/meshdevices)
// ============================================================
function authHeaders(extra = {}) {
  const h = { 'Content-Type': 'application/json', ...extra };
  if (cookie) h['Cookie'] = cookie;
  if (TOKEN) h['X-Mesh-Token'] = TOKEN;
  return h;
}

const rDevices = await apiFetch('/api/meshdevices', { headers: authHeaders() });
if (rDevices.status === 401 || rDevices.status === 403) {
  step('GET /api/meshdevices', false, `HTTP ${rDevices.status} — credenciales rechazadas`);
  process.exit(3);
}
if (rDevices.status !== 200) {
  step('GET /api/meshdevices', false, `HTTP ${rDevices.status}`);
  if ((rDevices.body || '').includes('<!DOCTYPE') || (rDevices.body || '').includes('<html')) {
    console.error('   ⚠️ El servidor devolvió HTML en vez de JSON: la API REST de MeshCentral');
    console.error('      está DESHABILITADA (o el token es inválido). Para habilitarla, editá');
    console.error('      config.json de MeshCentral y definí una "ServerSecret" en la cuenta');
    console.error('      administradora, p. ej.:');
    console.error('         "users": { "admin@dominio": { ..., "serverSecret": "CLAVE_LARGA_ALEATORIA" } }');
    console.error('      o a nivel dominio: "domains":{"*":{"AccountTypes":{"admin":{"ServerSecret":"..."}}}}');
    console.error('      Luego reiniciá MeshCentral. Sin ServerSecret la app web tampoco podrá conectarse.');
  } else {
    console.error(`   Respuesta: ${(rDevices.body || '').slice(0, 150)}`);
  }
  process.exit(1);
}
let payload;
try { payload = JSON.parse(rDevices.body); } catch {
  step('GET /api/meshdevices', false, 'Respuesta no es JSON (HTTP ' + rDevices.status + ').');
  console.error('   La API REST de MeshCentral está DESHABILITADA en el servidor.');
  console.error('   Para habilitarla, editá config.json de MeshCentral y agregá en "Settings":');
  console.error('     "Log2Text": true,            // si querés logs');
  console.error('     "PasswordSaltRounds": ...,   // (existente)');
  console.error('     y en "domains":{"*":{ ... }} :');
  console.error('       "AccountTypes": { "admin": { "ServerSecret": "TU_CLAVE_LARGA_ALEATORIA" } }');
  console.error('   ⚠️ Nota: MeshCentral solo expone /api/* si en config.json hay una clave\n' +
              '      "ServerSecret" definida para la cuenta o el dominio. Sin eso, la API\n' +
              '      devuelve 404 y la app web tampoco podrá conectarse.');
  console.error('   Verificá también que la URL base sea correcta (--url).');
  process.exit(1);
}
const devices = Object.values(payload.devices || payload || {});
step('GET /api/meshdevices', true, `${devices.length} dispositivo(s) visibles`);

// ============================================================
// PASO 3 — Búsqueda de la PC y detalle técnico
// ============================================================
const q = (PC || '').toLowerCase();
const norm = s => (s || '').toLowerCase();
const pc = q ? (devices.find(d => norm(d.name) === q || norm(d.hostname) === q || norm(d._id).includes(q))
  ?? devices.find(d => norm(d.name).includes(q) || norm(d.hostname).includes(q))) : null;

if (q && !pc) {
  step(`PC "${PC}" encontrada`, false, 'No hay coincidencias. Primeras 10: ' +
    devices.slice(0, 10).map(d => d.name).filter(Boolean).join(', '));
  process.exit(4);
}
if (pc) step(`PC "${pc.name}" encontrada`, true);

const sys = pc?.system || {};
const net = (pc.netinfo || []).find(n => n.ip4 && !n.ip4.startsWith('127.')) || pc?.netinfo?.[0] || {};
const online = pc?.conn === 'connected';
const lastSeen = pc?.lastconnect || pc?.lastseen;
const issues = [];
if (pc) {
  if (!online) issues.push('Equipo SIN CONEXIÓN al servidor Mesh');
  if (sys.disk != null && sys.disk < 10240) issues.push(`Espacio en disco bajo: ${Math.round(sys.disk / 1024)} GB libres`);
  if (sys.memory != null && sys.memory < 2048) issues.push('RAM muy baja (<2 GB)');
  if (pc.power === 1) issues.push('Funcionando con batería');
}

const result = {
  url: BASE,
  modo_autenticacion: USER ? 'usuario/contraseña' : 'server_secret',
  total_dispositivos: devices.length,
  pc: pc ? {
    nombre: pc.name, hostname: pc.hostname ?? '',
    id_mesh: (pc._id || '').replace(/^device:/, '').slice(-10),
    conectado: online,
    ultima_conexion: lastSeen ? new Date(lastSeen).toISOString() : 'nunca',
    ip: net.ip4 || '', mac: net.mac || '',
    sistema_operativo: sys.os || sys.platform || '',
    cpu: sys.cpu ? `${sys.cpu} (${sys.cores ?? '?'} núcleos)` : '',
    ram: sys.memory ? `${Math.round(sys.memory / 1024)} GB` : '',
    disco_libre_gb: sys.disk != null ? Math.round(sys.disk / 1024) : null,
    serial: sys.serial || '', version_agente: pc.agent?.build || '',
    grupo: pc.group || pc.mgrp || '', energia: ['AC', 'Batería', 'Batería baja', 'Sin batería', 'APM'][pc.power] ?? 'N/A',
    problemas: issues,
  } : undefined,
};

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else if (pc) {
  const p = result.pc;
  console.log('\n────────── DETALLE DEL EQUIPO ──────────');
  console.log(`  Nombre        : ${p.nombre}  (id: ${p.id_mesh})`);
  console.log(`  Estado        : ${p.conectado ? '🟢 CONECTADO' : '🔴 DESCONECTADO'}`);
  console.log(`  Última conex. : ${p.ultima_conexion}`);
  console.log(`  Red           : IP ${p.ip || 'N/A'} | MAC ${p.mac || 'N/A'}`);
  console.log(`  CPU           : ${p.cpu || 'N/A'}`);
  console.log(`  RAM           : ${p.ram || 'N/A'}`);
  console.log(`  Disco libre   : ${p.disco_libre_gb != null ? p.disco_libre_gb + ' GB' : 'N/A'}`);
  console.log(`  Sistema       : ${p.sistema_operativo || 'N/A'}`);
  console.log(`  Agente Mesh   : ${p.version_agente || 'N/A'} | Energía: ${p.energia}`);
  console.log(`  Serial        : ${p.serial || 'N/A'} | Grupo: ${p.grupo || 'N/A'}`);
  console.log(`  Problemas     : ${issues.length ? '\n                - ' + issues.join('\n                - ') : '✅ ninguno'}`);
} else if (!q) {
  console.log('\n📋 Inventario (primeros 20):');
  for (const d of devices.slice(0, 20)) {
    console.log(`   ${d.conn === 'connected' ? '🟢' : '🔴'} ${d.name ?? d._id}`);
  }
}

console.log(`\n${failed ? '❌ Prueba FALLÓ' : '✅ Prueba de conexión EXITOSA'}`);
process.exitCode = failed ? 1 : (pc && !online ? 5 : 0);
