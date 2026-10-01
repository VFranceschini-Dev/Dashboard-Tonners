import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MESH_URL = process.env.MESH_URL || 'wss://mesh.donnet.com.ar/meshcontrol.ashx';
const MESH_USER = process.env.MESH_USER || 'vfranceschini@donnet.com.ar';
const MESH_PASS = process.env.MESH_PASS || 'Vf040926*';

let cachedDevices = [];
let lastFetch = 0;
const CACHE_DURATION = 30000;

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
        const ws = new WebSocket(MESH_URL);
        let authenticated = false;
        let devicesReceived = false;
        let rawData = '';

        const timeout = setTimeout(() => {
            ws.close();
            reject(new Error('Timeout conectando a MeshCentral'));
        }, 15000);

        ws.on('open', () => {
            console.log('Conectado a MeshCentral');
            ws.send(JSON.stringify({
                action: 'login',
                username: MESH_USER,
                password: MESH_PASS
            }));
        });

        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                
                if (msg.action === 'login' || msg.result === 'ok' || msg.authenticated) {
                    authenticated = true;
                    console.log('Autenticado en MeshCentral');
                    ws.send(JSON.stringify({
                        action: 'meshNodes',
                        meshid: '*'
                    }));
                }
                
                if (msg.nodes || msg.machines || msg.result) {
                    devicesReceived = true;
                    rawData = data.toString();
                }
            } catch (e) {
                rawData = data.toString();
            }
        });

        ws.on('close', () => {
            clearTimeout(timeout);
            if (devicesReceived && rawData) {
                try {
                    const parsed = JSON.parse(rawData);
                    const nodes = parsed.nodes || parsed.machines || parsed.result || [];
                    resolve(nodes);
                } catch (e) {
                    reject(new Error('Error parseando respuesta'));
                }
            } else {
                reject(new Error('No se recibieron dispositivos'));
            }
        });

        ws.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}

async function getDevices() {
    const now = Date.now();
    if (cachedDevices.length > 0 && (now - lastFetch) < CACHE_DURATION) {
        return cachedDevices;
    }

    try {
        console.log('Consultando MeshCentral...');
        const rawNodes = await fetchDevicesFromMesh();
        
        const dispositivos = Array.isArray(rawNodes) ? rawNodes : Object.values(rawNodes);
        
        cachedDevices = dispositivos.map(node => {
            const connected = node.conn === 1 || node.connected === true;
            const name = node.name || node.rname || 'Sin nombre';
            
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
            data: dispositivos,
            source: 'MeshCentral Real',
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
            data: alertas,
            source: 'MeshCentral Real',
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
        cached_devices: cachedDevices.length,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`MeshCentral: ${MESH_URL}`);
    console.log(`Usuario: ${MESH_USER}`);
    console.log(`Conectando a MeshCentral real...`);
    
    getDevices().then(devices => {
        console.log(`Se cargaron ${devices.length} dispositivos desde MeshCentral`);
    }).catch(err => {
        console.log(`No se pudo conectar a MeshCentral: ${err.message}`);
        console.log(`Los datos se obtendran cuando se soliciten`);
    });
});