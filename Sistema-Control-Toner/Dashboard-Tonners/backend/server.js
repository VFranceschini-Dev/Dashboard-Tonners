import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MESH_URL = process.env.MESH_URL || 'wss://mesh.donnet.com.ar';
const MESH_USER = process.env.MESH_USER || 'vfranceschini@donnet.com.ar';
const MESH_PASS = process.env.MESH_PASS || 'Vf040926*';
const MESHCTRL_PATH = path.join(__dirname, 'node_modules', 'meshcentral', 'meshctrl.js');

let cachedDevices = [];
let lastFetch = 0;
const CACHE_DURATION = 30000; // 30 segundos

function getDepartmentFromName(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('admin')) return 'Administracion';
    if (n.includes('cont')) return 'Contabilidad';
    if (n.includes('rrhh')) return 'RRHH';
    if (n.includes('mkt') || n.includes('market')) return 'Marketing';
    if (n.includes('it') || n.includes('soporte')) return 'IT';
    if (n.includes('dir')) return 'Direccion';
    if (n.includes('rec')) return 'Recepcion';
    return 'Sin asignar';
}

function fetchDevicesFromMesh() {
    return new Promise((resolve, reject) => {
        const comando = `node "${MESHCTRL_PATH}" --url "${MESH_URL}" --loginuser "${MESH_USER}" --loginpass "${MESH_PASS}" ListDevices --json`;

        console.log('Ejecutando MeshCtrl.js...');

        exec(comando, { maxBuffer: 1024 * 1024 * 50, timeout: 30000 }, (error, stdout, stderr) => {
            if (error) {
                console.error('Error ejecutando MeshCtrl:', error.message);
                if (stderr) console.error('Stderr:', stderr);
                reject(new Error(`Error ejecutando MeshCtrl: ${error.message}`));
                return;
            }

            if (stderr) {
                console.log('Stderr:', stderr);
            }

            try {
                const rawData = JSON.parse(stdout);
                resolve(rawData);
            } catch (e) {
                console.error('Error parseando JSON:', e.message);
                console.error('Salida raw:', stdout.substring(0, 500));
                reject(new Error('Error parseando respuesta de MeshCtrl'));
            }
        });
    });
}

async function getDevices() {
    const now = Date.now();
    if (cachedDevices.length > 0 && (now - lastFetch) < CACHE_DURATION) {
        return cachedDevices;
    }

    try {
        console.log('Consultando MeshCentral via MeshCtrl.js...');
        const rawData = await fetchDevicesFromMesh();

        const nodes = Array.isArray(rawData) ? rawData : Object.values(rawData);

        cachedDevices = nodes.map(node => {
            const connected = node.conn === 1 || node.connected === true || node.powerState === 1;
            const name = node.name || node.rname || node._id || 'Sin nombre';

            return {
                id: node._id || node.id || Math.random().toString(),
                name: name,
                hostname: name,
                os: node.os || (node.agent && node.agent.computer && node.agent.computer.os) || 'Desconocido',
                ip: node.ip || node.host || 'N/A',
                conn: connected ? 1 : 0,
                connected: connected,
                alert: !connected ? 'Dispositivo fuera de linea' : null,
                type: 'Equipo Mesh',
                lastSeen: node.lastConnect ? new Date(node.lastConnect * 1000).toISOString() : new Date().toISOString(),
                department: getDepartmentFromName(name)
            };
        });

        lastFetch = now;
        console.log(`Se obtuvieron ${cachedDevices.length} dispositivos de MeshCentral`);
        return cachedDevices;
    } catch (error) {
        console.error('Error conectando a MeshCentral:', error.message);
        if (cachedDevices.length > 0) {
            console.log('Usando datos en cache');
            return cachedDevices;
        }
        throw error;
    }
}

app.get('/api/devices', async (req, res) => {
    try {
        const dispositivos = await getDevices();
        res.json({
            success: true,
            total: dispositivos.length,
             dispositivos,
            source: 'MeshCentral Real via MeshCtrl.js',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener dispositivos de MeshCentral',
            error: error.message
        });
    }
});

app.get('/api/alertas', async (req, res) => {
    try {
        const dispositivos = await getDevices();
        const alertas = dispositivos.filter(d => d.alert !== null || d.conn === 0);

        res.json({
            success: true,
            total_red: dispositivos.length,
            incidentes: alertas.length,
             alertas,
            source: 'MeshCentral Real via MeshCtrl.js',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener alertas',
            error: error.message
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Servidor proxy MeshCentral funcionando',
        mesh_url: MESH_URL,
        mesh_user: MESH_USER,
        meshctrl_path: MESHCTRL_PATH,
        cached_devices: cachedDevices.length,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`MeshCentral: ${MESH_URL}`);
    console.log(`Usuario: ${MESH_USER}`);
    console.log(`MeshCtrl.js: ${MESHCTRL_PATH}`);
});
