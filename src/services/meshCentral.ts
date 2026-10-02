import { MESH_CENTRAL_URL, MESH_API_KEY, MESH_PROXY_URL } from '../config';

// ============================================================
// Servicio MeshCentral — implementación real sobre la API REST
// de MeshCentral (/api/meshdevices).
//
// Autenticación soportada:
//  1. Proxy backend (recomendado): se define VITE_MESH_PROXY_URL y
//     la API key queda del lado del servidor.
//  2. ServerSecret: header "X-Mesh-Token" con la API key
//     (VITE_MESH_API_KEY). ⚠️ Solo para entornos controlados/internos.
// ============================================================

export type MeshConnState = 'connected' | 'disconnected' | 'unknown';

export interface MeshNode {
  id: string;
  name: string;
  hostname: string;
  ip: string;
  os: string;
  status: MeshConnState;
  lastSeen: string;
  group?: string;
  agentVersion?: string;
  cpu?: string;
  ram?: string;
  /** Campos extraídos del detalle del agente */
  serialNumber?: string;
  diskSpace?: number; // MB libres según reporte del agente
  power?: string; // currentPowerState de MeshCentral
  meshIdentifier?: string; // id corto usado por MeshCentral / CIRA
}

export interface MeshGroup {
  id: string;
  name: string;
  nodeCount: number;
  connectedCount: number;
}

/** Errores tipados para que la UI pueda distinguir causas */
export class MeshAuthError extends Error {
  constructor() {
    super('No autenticado contra MeshCentral: falta configurar la API key o el proxy.');
    this.name = 'MeshAuthError';
  }
}

export class MeshUnavailableError extends Error {
  constructor(detail: string) {
    super(`MeshCentral no disponible: ${detail}`);
    this.name = 'MeshUnavailableError';
  }
}

interface RawMeshDevice {
  _id?: string;
  id?: string;
  name?: string;
  hostname?: string;
  conn?: string; // 'connected' | 'disconnected'
  lastconnect?: number; // epoch ms
  lastseen?: number;
  system?: {
    name?: string;
    os?: string;
    platform?: string;
    serial?: string;
    cpu?: string;
    cores?: number;
    memory?: number; // MB
    disk?: number; // MB
  };
  netinfo?: Array<{ ip4?: string; ip6?: string; mac?: string; name?: string }>;
  agent?: { ver?: number; build?: string };
  power?: number; // 0 AC, 1 batería, etc.
  mgrp?: string;
  group?: string;
}

class MeshCentralService {
  private apiKey: string | null = null;
  private baseUrl: string;
  private proxyUrl: string;

  constructor() {
    this.baseUrl = MESH_CENTRAL_URL.replace(/\/+$/, '');
    this.proxyUrl = MESH_PROXY_URL.replace(/\/+$/, '');
    this.apiKey = MESH_API_KEY || localStorage.getItem('mesh_api_key');
  }

  setApiKey(key: string) {
    this.apiKey = key;
    try {
      localStorage.setItem('mesh_api_key', key);
    } catch {
      // storage no disponible (modo privado): la clave sólo vive en memoria
    }
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  isConfigured(): boolean {
    return !!(this.proxyUrl || (this.baseUrl && this.apiKey));
  }

  getMeshCentralUrl(): string {
    return this.baseUrl;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) h['X-Mesh-Token'] = this.apiKey;
    return h;
  }

  private endpoint(path: string): string {
    // Si hay proxy configurado, todas las llamadas pasan por él
    // (el proxy inyecta la credencial del lado del servidor).
    const base = this.proxyUrl || this.baseUrl;
    return `${base}/api/${path}`;
  }

  private async request<T>(path: string): Promise<T> {
    if (!this.isConfigured()) throw new MeshAuthError();

    let res: Response;
    try {
      res = await fetch(this.endpoint(path), {
        headers: this.headers(),
        credentials: 'omit',
        signal: AbortSignal.timeout(15000),
      });
    } catch (err) {
      throw new MeshUnavailableError(
        err instanceof Error ? err.message : String(err)
      );
    }

    if (res.status === 401 || res.status === 403) {
      throw new MeshAuthError();
    }
    if (!res.ok) {
      throw new MeshUnavailableError(`HTTP ${res.status} en /api/${path}`);
    }
    return (await res.json()) as T;
  }

  private mapDevice(d: RawMeshDevice): MeshNode {
    const id = (d._id ?? d.id ?? '').replace(/^device:/, '');
    const lastSeenMs = d.lastconnect ?? d.lastseen;
    const ip =
      d.netinfo?.find(n => n.ip4 && !n.ip4.startsWith('127.'))?.ip4 ??
      d.netinfo?.[0]?.ip4 ??
      '';
    return {
      id,
      meshIdentifier: id.slice(-10), // MeshCentral usa los últimos caracteres como "node id"
      name: d.name ?? d.system?.name ?? id,
      hostname: d.hostname ?? d.system?.name ?? '',
      ip,
      os: d.system?.os ?? d.system?.platform ?? '',
      status:
        d.conn === 'connected'
          ? 'connected'
          : d.conn === 'disconnected'
            ? 'disconnected'
            : 'unknown',
      lastSeen: lastSeenMs ? new Date(lastSeenMs).toISOString() : '',
      group: d.group ?? d.mgrp,
      agentVersion:
        d.agent?.build ?? (d.agent?.ver != null ? `agent v${d.agent.ver}` : undefined),
      cpu: d.system?.cpu ? `${d.system.cpu} (${d.system.cores ?? '?'} núcleos)` : undefined,
      ram: d.system?.memory ? `${Math.round(d.system.memory / 1024)} GB` : undefined,
      serialNumber: d.system?.serial,
      diskSpace: d.system?.disk,
      power:
        d.power != null
          ? ['AC', 'Batería', 'Batería baja', 'Sin batería', 'APM'][d.power] ?? String(d.power)
          : undefined,
    };
  }

  /** Lista todos los dispositivos visibles para la cuenta/API key */
  async getNodes(): Promise<MeshNode[]> {
    const data = await this.request<{ devices?: Record<string, RawMeshDevice> }>(
      'meshdevices'
    );
    const devices = data.devices ?? {};
    return Object.values(devices).map(d => this.mapDevice(d));
  }

  /** Grupos de nodos con conteo de conectados */
  async getGroups(): Promise<MeshGroup[]> {
    const nodes = await this.getNodes();
    const byGroup = new Map<string, MeshGroup>();
    for (const n of nodes) {
      const gid = n.group ?? 'default';
      const g =
        byGroup.get(gid) ?? { id: gid, name: gid, nodeCount: 0, connectedCount: 0 };
      g.nodeCount++;
      if (n.status === 'connected') g.connectedCount++;
      byGroup.set(gid, g);
    }
    return [...byGroup.values()];
  }

  /** Detalle de un nodo por id, nombre, hostname o identificador Mesh */
  async getNodeDetails(nodeId: string): Promise<MeshNode | null> {
    const nodes = await this.getNodes();
    const q = nodeId.toLowerCase().trim();
    return (
      nodes.find(
        n => n.id.toLowerCase() === q || n.meshIdentifier?.toLowerCase() === q
      ) ??
      nodes.find(
        n => n.name.toLowerCase() === q || n.hostname.toLowerCase() === q
      ) ??
      null
    );
  }
}

export const meshCentralService = new MeshCentralService();
