import { useState, useRef, useEffect } from 'react';
import { meshCentralService, type MeshNode } from '../services/meshCentral';
import {
  Server, Wifi, WifiOff, RefreshCw, Search, CheckCircle, AlertCircle,
  Monitor, Cpu, Trash2
} from 'lucide-react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export default function MeshTestConnection() {
  const [serverUrl, setServerUrl] = useState('https://mesh.donnet.com.ar');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pcSearch, setPcSearch] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [nodes, setNodes] = useState<MeshNode[]>([]);
  const [foundPC, setFoundPC] = useState<MeshNode | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // Cargar configuración guardada al montar
  useEffect(() => {
    const saved = meshCentralService.getConfig();
    if (saved) {
      setServerUrl(saved.serverUrl);
      setUsername(saved.username);
      setPassword(saved.password);
    }
  }, []);

  // Auto-scroll del log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    };
    setLogs((prev) => [...prev, entry]);
  };

  const handleConnect = async () => {
    setConnecting(true);
    setStatusMessage(null);
    setFoundPC(null);
    addLog(`Conectando a ${serverUrl}…`);

    meshCentralService.setConfig({
      serverUrl,
      username,
      password,
      savedPassword: password, // se persistirá ofuscada en localStorage
      autoSync: false,
      syncInterval: 5,
    });

    const ok = await meshCentralService.connect();

    if (ok) {
      setConnected(true);
      addLog('Conexión WebSocket establecida', 'success');
      setStatusMessage({ text: 'Conectado al servidor', type: 'success' });

      const list = await meshCentralService.getNodes();
      setNodes(list);
      addLog(`${list.length} nodo(s) recibido(s)`, list.length > 0 ? 'success' : 'warning');
    } else {
      setConnected(false);
      setNodes([]);
      addLog('No se pudo establecer la conexión', 'error');
      setStatusMessage({ text: 'Error de conexión. Verifique URL y credenciales.', type: 'error' });
    }

    setConnecting(false);
  };

  const handleDisconnect = () => {
    meshCentralService.disconnect();
    setConnected(false);
    setNodes([]);
    setFoundPC(null);
    addLog('Desconectado manualmente', 'warning');
    setStatusMessage(null);
  };

  const handleSearch = () => {
    const term = pcSearch.trim().toLowerCase();
    if (!term) {
      setFoundPC(null);
      return;
    }
    const match = nodes.find(
      (n) =>
        n.name.toLowerCase().includes(term) ||
        n.hostname?.toLowerCase().includes(term) ||
        n.ip?.toLowerCase().includes(term)
    );
    setFoundPC(match || null);
    addLog(
      match ? `PC encontrada: ${match.name}` : `Sin resultados para "${pcSearch}"`,
      match ? 'success' : 'warning'
    );
  };

  const logColor: Record<LogEntry['type'], string> = {
    info: 'text-gray-600 dark:text-gray-300',
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Server size={28} className="text-blue-600" />
        <h1 className="text-2xl font-bold">Test de conexión MeshCentral</h1>
      </div>

      {/* Formulario de conexión */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm text-gray-600 dark:text-gray-300">URL del servidor</span>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="https://mesh.donnet.com.ar"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600 dark:text-gray-300">Usuario</span>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600 dark:text-gray-300">Contraseña</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!connected ? (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {connecting ? <RefreshCw size={16} className="animate-spin" /> : <Wifi size={16} />}
              Conectar
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
            >
              <WifiOff size={16} /> Desconectar
            </button>
          )}
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              connected ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {connected ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {connected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        {statusMessage && (
          <div
            className={`rounded-lg p-3 text-sm ${
              statusMessage.type === 'success'
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : statusMessage.type === 'error'
                ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}
      </div>

      {/* Búsqueda de PC */}
      {connected && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-9 pr-3 py-2"
                placeholder="Buscar PC por nombre, hostname o IP…"
                value={pcSearch}
                onChange={(e) => setPcSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Buscar
            </button>
          </div>

          {foundPC && (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
              <div className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-300 mb-2">
                <Monitor size={18} /> {foundPC.name}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><span className="text-gray-500 dark:text-gray-400">Hostname:</span> {foundPC.hostname || '-'}</div>
                <div><span className="text-gray-500 dark:text-gray-400">IP:</span> {foundPC.ip || '-'}</div>
                <div><span className="text-gray-500 dark:text-gray-400">SO:</span> {foundPC.os || '-'}</div>
                <div className="flex items-center gap-1">
                  <Cpu size={14} />
                  {foundPC.status === 'connected' ? 'Conectado' : 'Desconectado'}
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Nodos ({nodes.length})</h3>
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 dark:bg-slate-700">
                  <tr className="text-left border-b border-gray-200 dark:border-slate-600">
                    <th className="py-2 pr-4">Nombre</th>
                    <th className="py-2 pr-4">Hostname</th>
                    <th className="py-2 pr-4">IP</th>
                    <th className="py-2 pr-4">SO</th>
                    <th className="py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {nodes.map((node) => (
                    <tr key={node.id} className="border-b border-gray-100 dark:border-slate-700/50">
                      <td className="py-2 pr-4">{node.name}</td>
                      <td className="py-2 pr-4">{node.hostname || '-'}</td>
                      <td className="py-2 pr-4">{node.ip || '-'}</td>
                      <td className="py-2 pr-4">{node.os || '-'}</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            node.status === 'connected'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300'
                          }`}
                        >
                          {node.status === 'connected' ? 'Conectado' : 'Desconectado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Consola de log */}
      <div className="bg-slate-900 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-100 flex items-center gap-2">
            <Server size={16} /> Consola de eventos
          </h3>
          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200"
          >
            <Trash2 size={14} /> Limpiar
          </button>
        </div>
        <div ref={logRef} className="h-48 overflow-y-auto font-mono text-xs space-y-1">
          {logs.length === 0 ? (
            <p className="text-gray-500">Sin eventos. Presione "Conectar" para iniciar.</p>
          ) : (
            logs.map((log, i) => (
              <p key={`${i}-${log.timestamp}`} className={logColor[log.type]}>
                [{log.timestamp}] {log.message}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}