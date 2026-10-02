#!/usr/bin/env node
/*
 * mesh-status.mjs
 * ---------------------------------------------------------------
 * Consulta rápida del estado de un equipo monitorizado en
 * MeshCentral (https://mesh.donnet.com.ar) por línea de comandos.
 *
 * Acepta como parámetro el NOMBRE de la PC o un fragmento del
 * ID de Mesh, y muestra:
 *   - si está conectada o no (+ última conexión)
 *   - problemas detectados (disco bajo, RAM baja, batería, etc.)
 *   - detalles técnicos (CPU, RAM, disco, IP/MAC, SO, agente, serial)
 *
 * Credenciales — mismos modos que mesh-connection-test.mjs y la app web:
 *   --user ADMIN --pass 'CLAVE'   login MeshCentral (POST /api/login + cookie)
 *   --token SERVER_SECRET         API key / ServerSecret (header X-Mesh-Token)
 *   También se leen .env y las variables MESH_URL / MESH_USER / MESH_PASS /
 *   MESH_TOKEN / VITE_MESH_CENTRAL_URL / VITE_MESH_API_KEY.
 *
 * Uso:
 *   node scripts/cli/mesh-status.mjs PC-CONTABLES-01 --user admin --pass 'CLAVE'
 *   node scripts/cli/mesh-status.mjs abcd1234 --token SECRET [--json] [--insecure]
 *   npm run mesh:pc -- PC-01 --token SECRET
 *
 * Códigos de salida:
 *   0 conectado | 1 error red/API | 2 uso incorrecto | 3 auth fallida
 *   4 PC no encontrada | 5 PC existe pero está desconectada
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
const flags = {};
const positional = [];
{
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { positional.push(a); continue; }
    const key = a.slice(2);
    if (key === 'json' || key === 'insecure') { flags[key] = true; continue; }
    flags[key] = argv[++i];
  }
}

const QUERY = positional[0] || flags.pc || process.env.MESH_PC || '';
const BASE = (flags.url || process.env.MESH_URL ||
  process.env.VITE_MESH_CENTRAL_URL || 'https://mesh.donnet.com.ar').replace(/\/+$/, '');
const USER = flags.user || process.env.MESH_USER || '';
const PASS = flags.pass || process.env.MESH_PASS || '';
const TOKEN = flags.token || process.env.MESH_TOKEN || process.env.VITE_MESH_API_KEY || '';

if (!QUERY) {
  console.error('Uso: mesh-status.mjs <nombre-pc-o-id-mesh> [--user ADMIN --pass CLAVE | --token SECRET] [--url URL] [--json] [--insecure]');
  process.exit(2);
}
if (!USER && !TOKEN) {
  console.error('Faltan credenciales: pasá --user/--pass (administrador) o --token (ServerSecret).');
  console.error('Corré "npm run mesh:test -- --help" para más detalles sobre la configuración de la API.');
  process.exit(2);
}

// ---------- request HTTP/HTTPS con soporte --insecure ----------
function httpRequest(url, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((res, rej) => {
    const u = new URL(url);
    const isTls = u.protocol === 'https:';
    const lib = isTls ? https : http;
    const req = lib.request({
      hostname: u.hostname, port: u.port || (isTls ? 443 : 80), path: u.pathname + u.search,
      method, headers, rejectUnauthorized: !flags.insecure, timeout: 15000,
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

async function apiFetch(path, opts = {}) {
  try {
    return await httpRequest(`${BASE}${path}`, opts);
  } catch (e) {
    console.error(`❌ No se pudo conectar con ${BASE}: ${e.message}` +
      (/certificate/i.test(e.message) ? ' (probá con --insecure)' : ''));
    process.exit(1);
  }
}

// ---------- PASO 1: autenticación ----------
let cookie = null;
const authHeaders = (extra = {}) => {
  const h = { 'Content-Type': 'application/json', ...extra };
  if (cookie) h['Cookie'] = cookie;
  if (TOKEN) h['X-Mesh-Token'] = TOKEN;
  return h;
};

if (USER) {
  const r = await apiFetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USER, password: PASS }),
  });
  if (r.status !== 200) {
    console.error(`❌ Login fallido (HTTP ${r.status}). Verificá usuario/contraseña.`);
    process.exit(3);
  }
  const sc = r.headers['set-cookie'];
  cookie = Array.isArray(sc) ? sc.map(c => c.split(';')[0]).join('; ') : (sc || '');
  if (!cookie) { console.error('❌ MeshCentral no devolvió cookie de sesión (¿2FA activo?). Usá --token.'); process.exit(3); }
}

// ---------- PASO 2: obtener dispositivos ----------
const rDevices = await apiFetch('/api/meshdevices', { headers: authHeaders() });
if (rDevices.status === 401 || rDevices.status === 403) {
  console.error(`❌ Credenciales rechazadas por la API (HTTP ${rDevices.status}).`);
  process.exit(3);
}
let payload;
try { payload = JSON.parse(rDevices.body); } catch {
  console.error(`❌ La API devolvió una respuesta no-JSON (HTTP ${rDevices.status}).`);
  if ((rDevices.body || '').includes('<html') || (rDevices.body || '').includes('<!DOCTYPE')) {
    console.error('   La API REST de MeshCentral está DESHABILITADA en el servidor:');
    console.error('   definí una "serverSecret" en la cuenta admin (o ServerSecret de dominio)');
    console.error('   en config.json de MeshCentral y reiniciá el servicio.');
  }
  process.exit(1);
}
const devices = Object.values(payload.devices || payload || {});

// ---------- PASO 3: buscar la PC ----------
const q = QUERY.toLowerCase();
const norm = s => (s || '').toLowerCase();
const pc = devices.find(d => norm(d.name) === q || norm(d.hostname) === q || norm(d._id).includes(q))
  ?? devices.find(d => norm(d.name).includes(q) || norm(d.hostname).includes(q));

if (!pc) {
  const sugerencias = devices.map(d => d.name).filter(n => n && (n.toLowerCase().includes(q.slice(0, 4)) || q.includes(n.toLowerCase().slice(0, 4)))).slice(0, 5);
  console.error(`❌ No encontrado: "${QUERY}" (${devices.length} dispositivos visibles).`);
  if (sugerencias.length) console.error('   ¿Quizás querías decir: ' + sugerencias.join(', ') + '?');
  process.exit(4);
}

// ---------- PASO 4: estado, problemas y detalles ----------
const sys = pc.system || {};
const net = (pc.netinfo || []).find(n => n.ip4 && !n.ip4.startsWith('127.')) || pc.netinfo?.[0] || {};
const online = pc.conn === 'connected';
const lastSeen = pc.lastconnect || pc.lastseen ? new Date(pc.lastconnect || pc.lastseen) : null;
const issues = [];
if (!online) issues.push('Equipo SIN CONEXIÓN al servidor Mesh');
else if (lastSeen && Date.now() - lastSeen.getTime() > 10 * 60000) issues.push('Conexión inestable (sin heartbeat reciente)');
if (sys.disk != null && sys.disk < 10240) issues.push(`⚠️ Espacio en disco bajo: ${Math.round(sys.disk / 1024)} GB libres`);
if (sys.memory != null && sys.memory < 2048) issues.push('⚠️ RAM muy baja (<2 GB)');
if (pc.power === 1) issues.push('Funcionando con batería');
else if (pc.power === 2) issues.push('🔋 Batería BAJA');

const out = {
  nombre: pc.name,
  hostname: pc.hostname ?? '',
  id_mesh: (pc._id || '').replace(/^device:/, '').slice(-10),
  conectado: online,
  ultima_conexion: lastSeen ? lastSeen.toISOString() : 'nunca',
  ip: net.ip4 || '', mac: net.mac || '',
  sistema_operativo: sys.os || sys.platform || '',
  cpu: sys.cpu ? `${sys.cpu} (${sys.cores ?? '?'} núcleos)` : '',
  ram: sys.memory ? `${Math.round(sys.memory / 1024)} GB` : '',
  disco_libre: sys.disk != null ? `${Math.round(sys.disk / 1024)} GB` : '',
  serial: sys.serial || '',
  version_agente: pc.agent?.build || '',
  energia: ['AC', 'Batería', 'Batería baja', 'Sin batería', 'APM'][pc.power] ?? 'N/A',
  grupo: pc.group || pc.mgrp || '',
  problemas: issues,
};

if (flags.json) {
  console.log(JSON.stringify(out, null, 2));
} else {
  console.log(`\n🖥  ${out.nombre} (${out.id_mesh})  [${BASE}]`);
  console.log(`   Estado        : ${out.conectado ? '🟢 CONECTADO' : '🔴 DESCONECTADO'} | Última conexión: ${out.ultima_conexion}`);
  console.log(`   Red           : IP ${out.ip || 'N/A'} | MAC ${out.mac || 'N/A'}`);
  console.log(`   Hardware      : ${out.cpu || '?'} | RAM ${out.ram || '?'} | Disco libre ${out.disco_libre || '?'}`);
  console.log(`   Sistema       : ${out.sistema_operativo || 'N/A'} | Agente ${out.version_agente || '?'} | Energía: ${out.energia}`);
  console.log(`   Serial/Grupo  : ${out.serial || 'N/A'} | ${out.grupo || 'N/A'}`);
  console.log(`   Problemas     : ${issues.length ? '\n                   - ' + issues.join('\n                   - ') : '✅ Ninguno detectado'}`);
}
process.exitCode = online ? 0 : 5;
