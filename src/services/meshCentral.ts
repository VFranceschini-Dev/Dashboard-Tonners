/ MeshCentral API Service
// Conecta con el servidor MeshCentral para obtener información de dispositivos

export interface MeshNode {
  id: string;
  name: string;
  icon: number;
  host: string;
  ip: string;
  os: string;
  connected: boolean;
  lastConnect: number;
  lastDisconnect: number;
  uptime: number;
  agentVersion: string;
  meshId: string;
  meshName: string;
  powerState: number;
}

export interface MeshCentralConfig {
  url: string;
  username: string;
  password: string;
}

class MeshCentralService {
  private baseUrl: string;
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private nodes: MeshNode[] = [];
  private listeners: ((nodes: MeshNode[]) => void)[] = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.baseUrl = 'https://mesh.donnet.com.ar';
  }

  // Conectar via WebSocket
  async connect(username: string, password: string): Promise<boolean> {
    try {
      const wsUrl = `${this.baseUrl.replace('https://', 'wss://').replace('http://', 'ws://')}/meshrelay.ashx`;
      
      this.ws = new WebSocket(wsUrl);

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.log('MeshCentral: Timeout de conexión, usando datos locales');
          this.isConnected = false;
          resolve(false);
        }, 5000);

        this.ws!.onopen = () => {
          clearTimeout(timeout);
          console.log('MeshCentral: WebSocket conectado');
          this.isConnected = true;
          
          // Autenticar
          this.ws!.send(JSON.stringify({
            action: 'login',
            username: username,
            password: password
          }));

          // Solicitar lista de nodos
          setTimeout(() => {
            this.ws!.send(JSON.stringify({
              action: 'nodes'
            }));
          }, 1000);

          resolve(true);
        };

        this.ws!.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('MeshCentral: Error parsing message', error);
          }
        };

        this.ws!.onerror = (error) => {
          clearTimeout(timeout);
          console.log('MeshCentral: Error de conexión, usando datos locales');
          this.isConnected = false;
          resolve(false);
        };

        this.ws!.onclose = () => {
          console.log('MeshCentral: WebSocket cerrado');
          this.isConnected = false;
          this.scheduleReconnect(username, password);
        };
      });
    } catch (error) {
      console.error('MeshCentral: Error connecting', error);
      this.isConnected = false;
      return false;
    }
  }

  private handleMessage(data: any) {
    if (data.action === 'nodes' && data.nodes) {
      this.nodes = this.parseNodes(data.nodes);
      this.notifyListeners();
    } else if (data.action === 'nodechange') {
      // Actualizar nodo específico
      const updatedNode = this.parseNode(data.node);
      const index = this.nodes.findIndex(n => n.id === updatedNode.id);
      if (index >= 0) {
        this.nodes[index] = updatedNode;
      } else {
        this.nodes.push(updatedNode);
      }
      this.notifyListeners();
    }
  }

  private parseNodes(nodesData: any): MeshNode[] {
    const nodes: MeshNode[] = [];
    
    for (const meshId in nodesData) {
      const meshNodes = nodesData[meshId];
      for (const nodeId in meshNodes) {
        const node = meshNodes[nodeId];
        nodes.push({
          id: nodeId,
          name: node.name || 'Unknown',
          icon: node.icon || 0,
          host: node.host || '',
          ip: node.ip || '',
          os: node.os || '',
          connected: node.conn === 1,
          lastConnect: node.lastConnect || 0,
          lastDisconnect: node.lastDisconnect || 0,
          uptime: node.uptime || 0,
          agentVersion: node.agentVersion || '',
          meshId: meshId,
          meshName: node.meshName || '',
          powerState: node.pwrState || 0
        });
      }
    }
    
    return nodes;
  }

  private parseNode(nodeData: any): MeshNode {
    return {
      id: nodeData._id || '',
      name: nodeData.name || 'Unknown',
      icon: nodeData.icon || 0,
      host: nodeData.host || '',
      ip: nodeData.ip || '',
      os: nodeData.os || '',
      connected: nodeData.conn === 1,
      lastConnect: nodeData.lastConnect || 0,
      lastDisconnect: nodeData.lastDisconnect || 0,
      uptime: nodeData.uptime || 0,
      agentVersion: nodeData.agentVersion || '',
      meshId: nodeData.meshId || '',
      meshName: nodeData.meshName || '',
      powerState: nodeData.pwrState || 0
    };
  }

  private scheduleReconnect(username: string, password: string) {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      console.log('MeshCentral: Intentando reconectar...');
      this.connect(username, password);
    }, 30000); // Reintentar cada 30 segundos
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.nodes));
  }

  // Suscribirse a cambios de nodos
  subscribe(listener: (nodes: MeshNode[]) => void): () => void {
    this.listeners.push(listener);
    // Enviar estado actual inmediatamente
    if (this.nodes.length > 0) {
      listener(this.nodes);
    }
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Obtener nodos actuales
  getNodes(): MeshNode[] {
    return this.nodes;
  }

  // Verificar si está conectado
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  // Desconectar
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  // Obtener URL del servidor
  getServerUrl(): string {
    return this.baseUrl;
  }

  // Obtener URL para acceder a un nodo específico
  getNodeUrl(nodeId: string): string {
    return `${this.baseUrl}/node?node=${nodeId}`;
  }
}

export const meshCentralService = new MeshCentralService();