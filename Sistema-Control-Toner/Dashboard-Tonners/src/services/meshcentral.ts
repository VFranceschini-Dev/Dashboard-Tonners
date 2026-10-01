// ============================================
// SERVICIO DE COMUNICACION CON MESHCENTRAL
// Protocolo WebSocket nativo (wss://)
// ============================================

export interface MeshConfig {
  serverUrl: string;
  username: string;
  password: string;
  workHoursStart: string;
  workHoursEnd: string;
}

export interface MeshNode {
  _id: string;
  name: string;
  host: string;
  ip: string;
  os: string;
  agent: MeshAgent;
  meshid: string;
  rname: string;
  domain: string;
  lastConnect: number;
  connectTime: number;
  powerState: number;
}

export interface MeshAgent {
  id: string;
  ver: string;
  caps: number;
  computer: MeshComputer;
}

export interface MeshComputer {
  name: string;
  host: string;
  domain: string;
  os: string;
  arch: string;
}

export interface MeshAlert {
  nodeId: string;
  nodeName: string;
  nodeIp: string;
  type: 'off_hours' | 'disconnected' | 'high_cpu' | 'high_memory' | 'offline';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: number;
  department: string;
}

export interface MeshConnectionState {
  connected: boolean;
  authenticated: boolean;
  lastMessage: string;
  nodeCount: number;
  alertCount: number;
  error: string | null;
}

type MessageHandler = (data: any) => void;

class MeshCentralService {
  private ws: WebSocket | null = null;
  private config: MeshConfig;
  private reconnectTimer: any = null;
  private messageHandlers: MessageHandler[] = [];
  private connectionState: MeshConnectionState = {
    connected: false,
    authenticated: false,
    lastMessage: '',
    nodeCount: 0,
    alertCount: 0,
    error: null
  };
  private stateChangeCallbacks: ((state: MeshConnectionState) => void)[] = [];
  private alertCallbacks: ((alerts: MeshAlert[]) => void)[] = [];
  private nodeCallbacks: ((nodes: MeshNode[]) => void)[] = [];

  constructor() {
    this.config = {
      serverUrl: 'wss://mesh.donnet.com.ar/meshcontrol.ashx',
      username: 'admin',
      password: '',
      workHoursStart: '08:00',
      workHoursEnd: '18:00'
    };
  }

  configure(config: Partial<MeshConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): MeshConfig {
    return { ...this.config };
  }

  getState(): MeshConnectionState {
    return { ...this.connectionState };
  }

  onStateChange(callback: (state: MeshConnectionState) => void) {
    this.stateChangeCallbacks.push(callback);
    return () => {
      this.stateChangeCallbacks = this.stateChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  onAlerts(callback: (alerts: MeshAlert[]) => void) {
    this.alertCallbacks.push(callback);
    return () => {
      this.alertCallbacks = this.alertCallbacks.filter(cb => cb !== callback);
    };
  }

  onNodes(callback: (nodes: MeshNode[]) => void) {
    this.nodeCallbacks.push(callback);
    return () => {
      this.nodeCallbacks = this.nodeCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyStateChange() {
    this.stateChangeCallbacks.forEach(cb => cb({ ...this.connectionState }));
  }

  private notifyAlerts(alerts: MeshAlert[]) {
    this.alertCallbacks.forEach(cb => cb(alerts));
  }

  private notifyNodes(nodes: MeshNode[]) {
    this.nodeCallbacks.forEach(cb => cb(nodes));
  }

  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.updateState({ connected: false, error: null, authenticated: false });
        
        this.ws = new WebSocket(this.config.serverUrl);

        this.ws.onopen = () => {
          this.updateState({ connected: true, error: null });
          this.authenticate();
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          this.updateState({ connected: false, error: 'Error de conexion con MeshCentral' });
          resolve(false);
        };

        this.ws.onclose = () => {
          this.updateState({ connected: false, authenticated: false });
          this.scheduleReconnect();
        };

      } catch (e) {
        this.updateState({ connected: false, error: 'No se pudo establecer conexion' });
        resolve(false);
      }
    });
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateState({ connected: false, authenticated: false });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  private updateState(partial: Partial<MeshConnectionState>) {
    this.connectionState = { ...this.connectionState, ...partial };
    this.notifyStateChange();
  }

  private authenticate() {
    if (!this.ws) return;

    const authPayload = {
      action: 'login',
      username: this.config.username,
      password: this.config.password
    };

    this.ws.send(JSON.stringify(authPayload));
    this.updateState({ lastMessage: 'Enviando autenticacion...' });
  }

  private handleMessage(rawData: string) {
    try {
      const data = JSON.parse(rawData);
      this.updateState({ lastMessage: 'Mensaje recibido: ' + (data.action || data.type || 'data') });

      switch (data.action || data.type) {
        case 'login':
        case 'auth':
          this.handleAuthResponse(data);
          break;
        case 'meshNodes':
        case 'nodes':
        case 'meshmachines':
          this.handleNodesResponse(data);
          break;
        case 'nodeChange':
          this.handleNodeChange(data);
          break;
        default:
          this.messageHandlers.forEach(h => h(data));
          break;
      }
    } catch (e) {
      // Mensaje no-JSON, ignorar
    }
  }

  private handleAuthResponse(data: any) {
    if (data.success || data.result === 'ok' || data.authenticated) {
      this.updateState({ authenticated: true });
      this.requestNodes();
    } else {
      this.updateState({ authenticated: false, error: 'Error de autenticacion' });
    }
  }

  private handleNodesResponse(data: any) {
    const nodes: MeshNode[] = data.nodes || data.machines || data.result || [];
    this.updateState({ nodeCount: nodes.length });
    this.notifyNodes(nodes);
    
    const alerts = this.filterAlerts(nodes);
    this.updateState({ alertCount: alerts.length });
    this.notifyAlerts(alerts);
  }

  private handleNodeChange(data: any) {
    if (data.node) {
      const alerts = this.checkNodeAlerts(data.node);
      if (alerts.length > 0) {
        this.notifyAlerts(alerts);
      }
    }
  }

  requestNodes() {
    if (!this.ws || !this.connectionState.authenticated) return;

    const request = {
      action: 'meshNodes',
      meshid: '*'
    };
    this.ws.send(JSON.stringify(request));
    this.updateState({ lastMessage: 'Solicitando lista de nodos...' });
  }

  requestNodeDetails(nodeId: string) {
    if (!this.ws || !this.connectionState.authenticated) return;

    const request = {
      action: 'getNodeDetails',
      nodeid: nodeId
    };
    this.ws.send(JSON.stringify(request));
  }

  private filterAlerts(nodes: MeshNode[]): MeshAlert[] {
    const alerts: MeshAlert[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [startH, startM] = this.config.workHoursStart.split(':').map(Number);
    const [endH, endM] = this.config.workHoursEnd.split(':').map(Number);
    const workStart = startH * 60 + startM;
    const workEnd = endH * 60 + endM;

    const isOffHours = currentTime < workStart || currentTime > workEnd;

    nodes.forEach(node => {
      if (isOffHours && node.powerState === 1) {
        alerts.push({
          nodeId: node._id,
          nodeName: node.name || node.rname || 'Desconocido',
          nodeIp: node.ip || node.host || 'N/A',
          type: 'off_hours',
          severity: 'medium',
          message: 'PC encendida fuera de horario laboral: ' + (node.name || node.rname),
          timestamp: Date.now(),
          department: this.getDepartmentFromNode(node)
        });
      }

      if (node.powerState === 0 && node.lastConnect) {
        const lastSeen = new Date(node.lastConnect * 1000);
        const hoursSinceLastSeen = (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastSeen > 24) {
          alerts.push({
            nodeId: node._id,
            nodeName: node.name || node.rname || 'Desconocido',
            nodeIp: node.ip || node.host || 'N/A',
            type: 'disconnected',
            severity: 'high',
            message: 'PC desconectada hace mas de 24h: ' + (node.name || node.rname),
            timestamp: Date.now(),
            department: this.getDepartmentFromNode(node)
          });
        }
      }

      if (node.agent && node.agent.caps === 0) {
        alerts.push({
          nodeId: node._id,
          nodeName: node.name || node.rname || 'Desconocido',
          nodeIp: node.ip || node.host || 'N/A',
          type: 'offline',
          severity: 'high',
          message: 'Agente MeshCentral sin respuesta: ' + (node.name || node.rname),
          timestamp: Date.now(),
          department: this.getDepartmentFromNode(node)
        });
      }
    });

    return alerts;
  }

  private checkNodeAlerts(node: any): MeshAlert[] {
    return this.filterAlerts([node]);
  }

  getDepartmentFromNode(node: MeshNode): string {
    const name = (node.name || node.rname || '').toLowerCase();
    if (name.includes('admin')) return 'Administracion';
    if (name.includes('cont')) return 'Contabilidad';
    if (name.includes('rrhh') || name.includes('recursos')) return 'RRHH';
    if (name.includes('mkt') || name.includes('market')) return 'Marketing';
    if (name.includes('it') || name.includes('soporte')) return 'IT';
    if (name.includes('dir')) return 'Direccion';
    if (name.includes('rec')) return 'Recepcion';
    return 'Sin asignar';
  }

  simulateConnection() {
    this.updateState({ connected: true, authenticated: true, error: null });
    
    const simulatedNodes: MeshNode[] = [
      { _id: 'node1', name: 'ADMIN-PC01', host: 'admin-pc01', ip: '192.168.1.101', os: 'Windows 11 Pro', agent: { id: 'a1', ver: '1.0', caps: 127, computer: { name: 'ADMIN-PC01', host: 'admin-pc01', domain: 'DONNET', os: 'Windows 11 Pro', arch: 'x64' } }, meshid: 'mesh1', rname: 'ADMIN-PC01', domain: 'DONNET', lastConnect: Math.floor(Date.now() / 1000), connectTime: 3600, powerState: 1 },
      { _id: 'node2', name: 'CONT-PC02', host: 'cont-pc02', ip: '192.168.1.102', os: 'Windows 11 Pro', agent: { id: 'a2', ver: '1.0', caps: 127, computer: { name: 'CONT-PC02', host: 'cont-pc02', domain: 'DONNET', os: 'Windows 11 Pro', arch: 'x64' } }, meshid: 'mesh1', rname: 'CONT-PC02', domain: 'DONNET', lastConnect: Math.floor(Date.now() / 1000), connectTime: 7200, powerState: 1 },
      { _id: 'node3', name: 'RRHH-PC03', host: 'rrhh-pc03', ip: '192.168.1.103', os: 'Windows 10 Pro', agent: { id: 'a3', ver: '1.0', caps: 127, computer: { name: 'RRHH-PC03', host: 'rrhh-pc03', domain: 'DONNET', os: 'Windows 10 Pro', arch: 'x64' } }, meshid: 'mesh1', rname: 'RRHH-PC03', domain: 'DONNET', lastConnect: Math.floor(Date.now() / 1000), connectTime: 1800, powerState: 1 },
      { _id: 'node4', name: 'IT-PC04', host: 'it-pc04', ip: '192.168.1.104', os: 'Windows 11 Pro', agent: { id: 'a4', ver: '1.0', caps: 127, computer: { name: 'IT-PC04', host: 'it-pc04', domain: 'DONNET', os: 'Windows 11 Pro', arch: 'x64' } }, meshid: 'mesh1', rname: 'IT-PC04', domain: 'DONNET', lastConnect: Math.floor(Date.now() / 1000), connectTime: 5400, powerState: 1 },
      { _id: 'node5', name: 'MKT-PC05', host: 'mkt-pc05', ip: '192.168.1.105', os: 'Windows 11 Pro', agent: { id: 'a5', ver: '1.0', caps: 0, computer: { name: 'MKT-PC05', host: 'mkt-pc05', domain: 'DONNET', os: 'Windows 11 Pro', arch: 'x64' } }, meshid: 'mesh1', rname: 'MKT-PC05', domain: 'DONNET', lastConnect: Math.floor(Date.now() / 1000) - 86400, connectTime: 0, powerState: 0 },
      { _id: 'node6', name: 'DIR-PC06', host: 'dir-pc06', ip: '192.168.1.106', os: 'Windows 11 Pro', agent: { id: 'a6', ver: '1.0', caps: 127, computer: { name: 'DIR-PC06', host: 'dir-pc06', domain: 'DONNET', os: 'Windows 11 Pro', arch: 'x64' } }, meshid: 'mesh1', rname: 'DIR-PC06', domain: 'DONNET', lastConnect: Math.floor(Date.now() / 1000), connectTime: 900, powerState: 1 },
      { _id: 'node7', name: 'REC-PC07', host: 'rec-pc07', ip: '192.168.1.107', os: 'Windows 10 Pro', agent: { id: 'a7', ver: '1.0', caps: 127, computer: { name: 'REC-PC07', host: 'rec-pc07', domain: 'DONNET', os: 'Windows 10 Pro', arch: 'x64' } }, meshid: 'mesh1', rname: 'REC-PC07', domain: 'DONNET', lastConnect: Math.floor(Date.now() / 1000) - 172800, connectTime: 0, powerState: 0 },
    ];

    this.updateState({ nodeCount: simulatedNodes.length });
    this.notifyNodes(simulatedNodes);

    const alerts = this.filterAlerts(simulatedNodes);
    this.updateState({ alertCount: alerts.length });
    this.notifyAlerts(alerts);
  }
}

export const meshCentralService = new MeshCentralService();
export default meshCentralService;