const MESH_CENTRAL_URL = 'https://mesh.donnet.com.ar';

export interface MeshNode {
  id: string;
  name: string;
  hostname: string;
  ip: string;
  os: string;
  status: 'connected' | 'disconnected';
  lastSeen: string;
  group?: string;
  agentVersion?: string;
  cpu?: string;
  ram?: string;
}

export interface MeshGroup {
  id: string;
  name: string;
  nodeCount: number;
  connectedCount: number;
}

class MeshCentralService {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('mesh_api_key', key);
  }

  getApiKey(): string | null {
    return this.apiKey || localStorage.getItem('mesh_api_key');
  }

  async getNodes(): Promise<MeshNode[]> {
    console.log('Conectando con Mesh Central:', MESH_CENTRAL_URL);
    return [];
  }

  async getGroups(): Promise<MeshGroup[]> {
    return [];
  }

  async getNodeDetails(nodeId: string): Promise<MeshNode | null> {
    return null;
  }

  getMeshCentralUrl(): string {
    return MESH_CENTRAL_URL;
  }
}

export const meshCentralService = new MeshCentralService();