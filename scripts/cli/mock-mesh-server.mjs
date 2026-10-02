#!/usr/bin/env node
/*
 * mock-mesh-server.mjs
 * ---------------------------------------------------------------
 * API simulada de MeshCentral para probar LOCALMENTE los scripts CLI
 * (mesh-connection-test.mjs / mesh-status.mjs) sin tocar mesh.donnet.com.ar.
 *
 * Endpoints implementados (formato real de la API REST de MeshCentral):
 *   POST /api/login        -> valida user/pass y setea cookie de sesión
 *   GET  /api/meshdevices  -> requiere cookie o header X-Mesh-Token;
 *                              devuelve { devices: { id: {...} } }
 *
 * Credenciales de prueba:
 *   usuario : admin@local      contraseña : secret123
 *   token   : TESTSECRET
 *
 * Uso:
 *   node scripts/cli/mock-mesh-server.mjs [--port 4580]
 *
 * Luego, en otra terminal:
 *   node scripts/cli/mesh-connection-test.mjs PC-CONTABLES-01 \
 *       --url http://localhost:4580 --user admin@local --pass secret123
 */
import http from 'node:http';

const args = process.argv.slice(2);
const PORT = Number(args[args.indexOf('--port') + 1] || process.env.PORT || 4580);
const USER = 'admin@local', PASS = 'secret123', TOKEN = 'TESTSECRET';

// ---- datos ficticios (mismos campos que expone MeshCentral) ----
const now = Date.now();
const DEVICES = {
  'device://mesh/aaa111bbb222': {
    _id: 'device://mesh/aaa111bbb222', name: 'PC-CONTABLES-01', hostname: 'pc-contables-01',
    conn: 'connected', lastconnect: now - 60_000, group: 'Contabilidad', power: 0,
    agent: { build: 150 }, netinfo: [{ ip4: '10.0.1.21', mac: '00:1A:2B:3C:4D:01' }],
    system: { os: 'Windows 11 Pro', cpu: 'Intel Core i5-12400', cores: 12, memory: 16384, disk: 245760, serial: 'SN-C01-998877' },
  },
  'device://mesh/ccc333ddd444': {
    _id: 'device://mesh/ccc333ddd444', name: 'LAP-FINANZAS-07', hostname: 'lap-finanzas-07',
    conn: 'disconnected', lastconnect: now - 3 * 86_400_000, group: 'Finanzas', power: 1,
    agent: { build: 148 }, netinfo: [{ ip4: '10.0.2.57', mac: '00:1A:2B:3C:4D:07' }],
    system: { os: 'Windows 10 Pro', cpu: 'Intel Core i7-8650U', cores: 8, memory: 8192, disk: 8192, serial: 'SN-F07-112233' },
  },
  'device://mesh/eee555fff666': {
    _id: 'device://mesh/eee555fff666', name: 'PC-SOPORTE-03', hostname: 'pc-soporte-03',
    conn: 'connected', lastconnect: now - 5_000, group: 'Soporte', power: 0,
    agent: { build: 150 }, netinfo: [{ ip4: '10.0.3.13', mac: '00:1A:2B:3C:4D:03' }],
    system: { os: 'Ubuntu 22.04 LTS', cpu: 'AMD Ryzen 5 5600G', cores: 12, memory: 32768, disk: 512000, serial: 'SN-S03-445566' },
  },
};

function json(res, code, obj, headers = {}) {
  res.writeHead(code, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  console.log(`${new Date().toISOString()} ${req.method} ${url.pathname}`);

  if (req.method === 'POST' && url.pathname === '/api/login') {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      let creds = {};
      try { creds = JSON.parse(body); } catch {}
      if (creds.username === USER && creds.password === PASS) {
        json(res, 200, { result: 'ok' }, {
          'Set-Cookie': `meshsession=${encodeURIComponent(JSON.stringify({ user: USER }))}; HttpOnly; Path=/`,
        });
      } else {
        json(res, 401, { error: 'Credenciales inválidas' });
      }
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/meshdevices') {
    // autenticación: cookie de sesión O header X-Mesh-Token (ServerSecret)
    const cookie = (req.headers.cookie || '').includes('meshsession=');
    const token = req.headers['x-mesh-token'] === TOKEN;
    if (!cookie && !token) return json(res, 401, { error: 'No autenticado' });
    return json(res, 200, { devices: DEVICES });
  }

  json(res, 404, { error: 'Endpoint inexistente en el mock' });
});

server.listen(PORT, () => {
  console.log(`🧪 Mock MeshCentral API escuchando en http://localhost:${PORT}`);
  console.log(`   Usuario: ${USER}  |  Contraseña: ${PASS}  |  Token: ${TOKEN}`);
  console.log(`   Dispositivos: ${Object.values(DEVICES).map(d => d.name).join(', ')}`);
  console.log(`\nProbar con:\n   node scripts/cli/mesh-connection-test.mjs PC-CONTABLES-01 --url http://localhost:${PORT} --user ${USER} --pass ${PASS}\n`);
});
