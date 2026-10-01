import { useState, useEffect } from 'react';
import { MonitoredPC, Alert } from '../types';
import { Monitor, Wifi, WifiOff, AlertTriangle, Check, Clock, Settings, Play, Pause, RefreshCw, Power, HardDrive, Activity } from 'lucide-react';
import meshCentralService, { MeshConnectionState, MeshAlert, MeshNode } from '../services/meshcentral';

interface Props {
  pcs: MonitoredPC[];
  alerts: Alert[];
  setAlerts: (a: Alert[]) => void;
}

export default function MonitoringPage({ pcs, alerts, setAlerts }: Props) {
  const [connState, setConnState] = useState<MeshConnectionState>(meshCentralService.getState());
  const [meshAlerts, setMeshAlerts] = useState<MeshAlert[]>([]);
  const [meshNodes, setMeshNodes] = useState<MeshNode[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState(meshCentralService.getConfig());
  const [useSimulation, setUseSimulation] = useState(true);

  useEffect(function() {
    var unsubState = meshCentralService.onStateChange(function(state) {
      setConnState(state);
    });
    var unsubAlerts = meshCentralService.onAlerts(function(newAlerts) {
      setMeshAlerts(newAlerts);
    });
    var unsubNodes = meshCentralService.onNodes(function(nodes) {
      setMeshNodes(nodes);
    });

    meshCentralService.simulateConnection();

    return function() {
      unsubState();
      unsubAlerts();
      unsubNodes();
    };
  }, []);

  function handleConnect() {
    if (useSimulation) {
      meshCentralService.simulateConnection();
    } else {
      meshCentralService.configure(config);
      meshCentralService.connect();
    }
  }

  function handleDisconnect() {
    meshCentralService.disconnect();
  }

  function handleSaveConfig() {
    meshCentralService.configure(config);
    setShowConfig(false);
  }

  function handleRefresh() {
    meshCentralService.requestNodes();
  }

  function syncMeshAlerts() {
    var newAlerts: Alert[] = meshAlerts.map(function(ma) {
      return {
        id: 'mesh-' + ma.nodeId,
        type: 'pc_off_hours' as const,
        message: ma.message,
        severity: ma.severity,
        date: new Date(ma.timestamp).toISOString().split('T')[0],
        resolved: false,
        entityId: ma.nodeId
      };
    });
    
    var existingIds = new Set(alerts.map(function(a) { return a.id; }));
    var uniqueNew = newAlerts.filter(function(a) { return !existingIds.has(a.id); });
    
    if (uniqueNew.length > 0) {
      setAlerts([...alerts, ...uniqueNew]);
    }
  }

  var online = pcs.filter(function(p) { return p.status === 'online'; });
  var offline = pcs.filter(function(p) { return p.status === 'offline'; });
  var offHours = pcs.filter(function(p) { return p.status === 'off_hours'; });
  var pcAlerts = alerts.filter(function(a) { return a.type === 'pc_off_hours' && !a.resolved; });

  function resolvePCAlert(entityId: string) {
    setAlerts(alerts.map(function(a) { return a.entityId === entityId && a.type === 'pc_off_hours' ? Object.assign({}, a, { resolved: true }) : a; }));
  }

  function getStatusIcon(s: string) {
    return s === 'online' ? <Wifi className="w-4 h-4 text-emerald-400" /> : s === 'off_hours' ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <WifiOff className="w-4 h-4 text-slate-500" />;
  }

  function getStatusColor(s: string) {
    return s === 'online' ? 'border-emerald-500/30 bg-emerald-500/5' : s === 'off_hours' ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10 bg-white/5';
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Monitoreo MeshCentral</h1>
          <p className="text-slate-400 text-sm mt-1">Integracion con mesh.donnet.com.ar via WebSocket</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={"flex items-center gap-2 px-3 py-1.5 rounded-xl border " + (connState.connected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20')}>
            <div className={"w-2 h-2 rounded-full " + (connState.connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400')} />
            <span className={"text-sm " + (connState.connected ? 'text-emerald-400' : 'text-red-400')}>
              {connState.connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>

      {/* Controles de conexion */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + (connState.connected ? 'bg-emerald-500/20' : 'bg-slate-500/20')}>
              <Wifi className={"w-5 h-5 " + (connState.connected ? 'text-emerald-400' : 'text-slate-400')} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {connState.connected ? 'Conexion activa con MeshCentral' : 'Sin conexion'}
              </p>
              <p className="text-xs text-slate-400">
                {connState.connected
                  ? connState.nodeCount + ' nodos | ' + connState.alertCount + ' alertas'
                  : connState.error || 'Presione Conectar para iniciar'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-2 text-xs text-slate-400">
              <input type="checkbox" checked={useSimulation} onChange={function(e) { setUseSimulation(e.target.checked); }} className="rounded border-white/20 bg-white/5" />
              Modo Demo
            </label>
            {!connState.connected ? (
              <button onClick={handleConnect} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/30 border border-emerald-500/30">
                <Play className="w-4 h-4" /> Conectar
              </button>
            ) : (
              <>
                <button onClick={handleRefresh} className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm hover:bg-blue-500/30">
                  <RefreshCw className="w-4 h-4" /> Actualizar
                </button>
                <button onClick={syncMeshAlerts} className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 text-amber-400 rounded-xl text-sm hover:bg-amber-500/30">
                  <AlertTriangle className="w-4 h-4" /> Sincronizar Alertas
                </button>
                <button onClick={handleDisconnect} className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30">
                  <Pause className="w-4 h-4" /> Desconectar
                </button>
              </>
            )}
            <button onClick={function() { setShowConfig(!showConfig); }} className="flex items-center gap-2 px-3 py-2 bg-white/5 text-slate-400 rounded-xl text-sm hover:bg-white/10 border border-white/10">
              <Settings className="w-4 h-4" /> Config
            </button>
          </div>
        </div>

        {/* Config panel */}
        {showConfig && (
          <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 animate-slide-in">
            <h3 className="text-sm font-semibold text-white mb-3">Configuracion MeshCentral</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">URL del Servidor (WebSocket)</label>
                <input type="text" value={config.serverUrl} onChange={function(e) { setConfig(Object.assign({}, config, { serverUrl: e.target.value })); }} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Usuario</label>
                <input type="text" value={config.username} onChange={function(e) { setConfig(Object.assign({}, config, { username: e.target.value })); }} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Horario Inicio</label>
                <input type="time" value={config.workHoursStart} onChange={function(e) { setConfig(Object.assign({}, config, { workHoursStart: e.target.value })); }} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Horario Fin</label>
                <input type="time" value={config.workHoursEnd} onChange={function(e) { setConfig(Object.assign({}, config, { workHoursEnd: e.target.value })); }} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleSaveConfig} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30">Guardar</button>
              <button onClick={function() { setShowConfig(false); }} className="px-4 py-2 bg-white/10 text-slate-400 rounded-lg text-sm hover:bg-white/20">Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {/* Estadisticas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><Monitor className="w-5 h-5 text-blue-400" /></div>
          <div><p className="text-xl font-bold text-white">{meshNodes.length || pcs.length}</p><p className="text-xs text-slate-400">Total PCs</p></div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Wifi className="w-5 h-5 text-emerald-400" /></div>
          <div><p className="text-xl font-bold text-emerald-400">{online.length}</p><p className="text-xs text-slate-400">En horario</p></div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center"><WifiOff className="w-5 h-5 text-slate-400" /></div>
          <div><p className="text-xl font-bold text-slate-400">{offline.length}</p><p className="text-xs text-slate-400">Apagadas</p></div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4 border-amber-500/30">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
          <div><p className="text-xl font-bold text-amber-400">{meshAlerts.length || offHours.length}</p><p className="text-xs text-slate-400">Fuera de horario</p></div>
        </div>
      </div>

      {/* Alertas de MeshCentral */}
      {meshAlerts.length > 0 && (
        <div className="glass-card p-6 border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Alertas MeshCentral ({meshAlerts.length})</h2>
                <p className="text-sm text-slate-400">Detectadas via WebSocket en tiempo real</p>
              </div>
            </div>
            <button onClick={syncMeshAlerts} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/30">
              Sincronizar con alertas locales
            </button>
          </div>
          <div className="space-y-3">
            {meshAlerts.map(function(alert) {
              return (
                <div key={alert.nodeId} className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className={"w-5 h-5 mt-0.5 " + (alert.severity === 'high' ? 'text-red-400' : 'text-amber-400')} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                      <span>IP: {alert.nodeIp}</span>
                      <span>Depto: {alert.department}</span>
                      <span className={"px-2 py-0.5 rounded-full " + (alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400')}>
                        {alert.severity === 'high' ? 'Critica' : alert.severity === 'medium' ? 'Advertencia' : 'Info'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alertas locales */}
      {pcAlerts.length > 0 && (
        <div className="glass-card p-6 border-amber-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
            <div><h2 className="text-lg font-semibold text-white">Alertas Locales: PCs Fuera de Horario</h2><p className="text-sm text-slate-400">Horario laboral: {config.workHoursStart} - {config.workHoursEnd}</p></div>
          </div>
          <div className="space-y-3">
            {pcAlerts.map(function(alert) {
              return (
                <div key={alert.id} className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div className="flex-1"><p className="text-sm font-medium text-white">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500"><Clock className="w-3 h-3" /><span>{alert.date}</span></div></div>
                  <button onClick={function() { resolvePCAlert(alert.entityId || ''); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/30"><Check className="w-3 h-3" />OK</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nodos de MeshCentral */}
      {meshNodes.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Nodos MeshCentral en Tiempo Real</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {meshNodes.map(function(node) {
              var isOnline = node.powerState === 1;
              var hasAgent = node.agent && node.agent.caps > 0;
              return (
                <div key={node._id} className={"p-4 rounded-xl border " + (isOnline && hasAgent ? 'border-emerald-500/30 bg-emerald-500/5' : !hasAgent ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/5')}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className={"w-8 h-8 " + (isOnline ? 'text-emerald-400' : 'text-slate-500')} />
                      <div><h3 className="text-sm font-semibold text-white">{node.name || node.rname}</h3><p className="text-xs text-slate-400">{node.ip || node.host}</p></div>
                    </div>
                    {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-slate-400">💻 {node.os || (node.agent && node.agent.computer && node.agent.computer.os) || 'N/A'}</p>
                    <p className="text-xs text-slate-400">🏢 {meshCentralService.getDepartmentFromNode(node)}</p>
                    {!hasAgent && <p className="text-xs text-red-400">⚠️ Agente sin respuesta</p>}
                  </div>
                  <div className="mt-3">
                    <span className={"text-xs px-2 py-0.5 rounded-full " + (isOnline && hasAgent ? 'bg-emerald-500/20 text-emerald-400' : !hasAgent ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400')}>
                      {isOnline && hasAgent ? '● Online' : !hasAgent ? '● Agente caido' : '● Offline'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PCs locales (fallback) */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Estado de PCs (Datos Locales)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pcs.map(function(pc) {
            return (
              <div key={pc.id} className={"p-4 rounded-xl border " + getStatusColor(pc.status)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor className={"w-8 h-8 " + (pc.status === 'online' ? 'text-emerald-400' : pc.status === 'off_hours' ? 'text-amber-400' : 'text-slate-500')} />
                    <div><h3 className="text-sm font-semibold text-white">{pc.hostname}</h3><p className="text-xs text-slate-400">{pc.ip}</p></div>
                  </div>
                  {getStatusIcon(pc.status)}
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-slate-400">👤 {pc.user}</p>
                  <p className="text-xs text-slate-400">🏢 {pc.department}</p>
                  <p className="text-xs text-slate-400">💻 {pc.os}</p>
                  <p className="text-xs text-slate-400">🕐 Ultima actividad: {pc.lastSeen}</p>
                </div>
                <div className="mt-3">
                  <span className={"text-xs px-2 py-0.5 rounded-full " + (pc.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : pc.status === 'off_hours' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400')}>
                    {pc.status === 'online' ? '● En linea' : pc.status === 'off_hours' ? '● Fuera de horario' : '● Apagada'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}