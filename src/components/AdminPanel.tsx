import { useState, type ChangeEvent } from 'react';
import { useApp } from '../context/AppContext';
import { meshCentralService, type MeshConfig, type MeshNode } from '../services/meshCentral';
import { importCSV, downloadCSVTemplate } from '../utils/csvImporter';
import { importExcel, downloadExcelTemplate } from '../utils/excelImporter';
import type { Equipment } from '../types';
import {
  Server, Upload, Download, Wifi, WifiOff, RefreshCw,
  CheckCircle, AlertCircle, FileSpreadsheet, FileText,
  Users, Building2, Monitor, Save, Trash2
} from 'lucide-react';

type ImportType = 'equipment' | 'collaborator' | 'supplier';

const EQUIPMENT_TYPES: Equipment['type'][] = ['desktop', 'laptop', 'server', 'monitor', 'peripheral', 'other'];
const EQUIPMENT_STATUS: Equipment['status'][] = ['assigned', 'available', 'maintenance', 'retired'];

const IMPORT_CONFIG: Record<
  ImportType,
  { label: string; headers: string[]; templateFile: string }
> = {
  equipment: {
    label: 'Equipamientos',
    headers: ['name', 'type', 'brand', 'model', 'serialNumber', 'assetTag', 'category', 'status', 'purchaseDate', 'warrantyEnd', 'notes'],
    templateFile: 'plantilla_equipamientos.csv',
  },
  collaborator: {
    label: 'Colaboradores',
    headers: ['name', 'lastName', 'dni', 'email', 'phone', 'department', 'position', 'joinDate', 'notes'],
    templateFile: 'plantilla_colaboradores.csv',
  },
  supplier: {
    label: 'Proveedores',
    headers: ['name', 'cuit', 'contact', 'email', 'phone', 'address', 'category', 'notes'],
    templateFile: 'plantilla_proveedores.csv',
  },
};

export default function AdminPanel() {
  const { addEquipment, addCollaborator, addSupplier } = useApp();
  const [activeTab, setActiveTab] = useState<'mesh' | 'import'>('mesh');

  // Mesh Config
  const [meshConfig, setMeshConfig] = useState<MeshConfig>(() => {
    const saved = meshCentralService.getConfig();
    return saved || {
      serverUrl: 'https://mesh.donnet.com.ar',
      username: '',
      password: '',
      autoSync: false,
      syncInterval: 5,
    };
  });
  const [meshConnected, setMeshConnected] = useState(meshCentralService.isConnected());
  const [meshNodes, setMeshNodes] = useState<MeshNode[]>([]);
  const [meshTesting, setMeshTesting] = useState(false);
  const [meshMessage, setMeshMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Import
  const [importType, setImportType] = useState<ImportType>('equipment');
  const [fileFormat, setFileFormat] = useState<'csv' | 'excel'>('csv');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; imported: number; errors: string[] } | null>(null);

  // Test Mesh Connection
  const handleTestMesh = async () => {
    setMeshTesting(true);
    setMeshMessage(null);

    meshCentralService.setConfig({ ...meshConfig, savedPassword: meshConfig.password });
    const connected = await meshCentralService.connect();

    if (connected) {
      setMeshConnected(true);
      setMeshMessage({ type: 'success', text: 'Conexión exitosa con MeshCentral' });
      const nodes = await meshCentralService.getNodes();
      setMeshNodes(nodes);
    } else {
      setMeshConnected(false);
      setMeshMessage({ type: 'error', text: 'No se pudo conectar. Verifique la configuración.' });
    }

    setMeshTesting(false);
  };

  const handleSaveConfig = () => {
    meshCentralService.setConfig({ ...meshConfig, savedPassword: meshConfig.password });
    setMeshMessage({ type: 'success', text: 'Configuración guardada' });
  };

  const handleDisconnect = () => {
    meshCentralService.disconnect();
    setMeshConnected(false);
    setMeshNodes([]);
    setMeshMessage(null);
  };

  // ---- Importación ----
  const buildMapping = (): Record<string, string> => {
    const map: Record<string, string> = {};
    IMPORT_CONFIG[importType].headers.forEach((h) => {
      map[h] = h;
    });
    return map;
  };

  const validateRow = (row: Record<string, unknown>): string | null => {
    if (!String(row.name ?? '').trim()) return 'Falta el campo "name"';
    if (importType === 'equipment') {
      const type = String(row.type ?? '');
      const status = String(row.status ?? '');
      if (type && !EQUIPMENT_TYPES.includes(type as Equipment['type'])) return `Tipo inválido: ${type}`;
      if (status && !EQUIPMENT_STATUS.includes(status as Equipment['status'])) return `Estado inválido: ${status}`;
    }
    return null;
  };

  const persistRows = (rows: Record<string, unknown>[]) => {
    rows.forEach((row) => {
      if (importType === 'equipment') {
        addEquipment({
          name: String(row.name ?? ''),
          type: (EQUIPMENT_TYPES.includes(String(row.type) as Equipment['type']) ? row.type : 'other') as Equipment['type'],
          brand: String(row.brand ?? ''),
          model: String(row.model ?? ''),
          serialNumber: String(row.serialNumber ?? ''),
          assetTag: String(row.assetTag ?? ''),
          category: String(row.category ?? ''),
          status: (EQUIPMENT_STATUS.includes(String(row.status) as Equipment['status']) ? row.status : 'available') as Equipment['status'],
          purchaseDate: String(row.purchaseDate ?? ''),
          warrantyEnd: String(row.warrantyEnd ?? ''),
          notes: String(row.notes ?? ''),
        });
      } else if (importType === 'collaborator') {
        addCollaborator({
          name: String(row.name ?? ''),
          lastName: String(row.lastName ?? ''),
          dni: String(row.dni ?? ''),
          email: String(row.email ?? ''),
          phone: String(row.phone ?? ''),
          department: String(row.department ?? ''),
          position: String(row.position ?? ''),
          active: true,
          equipmentCount: 0,
          joinDate: String(row.joinDate ?? ''),
          notes: String(row.notes ?? ''),
        });
      } else {
        addSupplier({
          name: String(row.name ?? ''),
          cuit: String(row.cuit ?? ''),
          contact: String(row.contact ?? ''),
          email: String(row.email ?? ''),
          phone: String(row.phone ?? ''),
          address: String(row.address ?? ''),
          category: String(row.category ?? ''),
          active: true,
          notes: String(row.notes ?? ''),
        });
      }
    });
  };

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const result =
        fileFormat === 'csv'
          ? await importCSV<Record<string, unknown>>(file, buildMapping(), validateRow)
          : await importExcel<Record<string, unknown>>(file, buildMapping(), validateRow);

      persistRows(result.data);
      setImportResult({
        success: result.errors.length === 0,
        imported: result.importedRows,
        errors: result.errors,
      });
    } catch (err) {
      setImportResult({ success: false, imported: 0, errors: [`Error al importar: ${err}`] });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const cfg = IMPORT_CONFIG[importType];
    if (fileFormat === 'csv') {
      downloadCSVTemplate(cfg.templateFile, cfg.headers);
    } else {
      downloadExcelTemplate(cfg.templateFile.replace('.csv', '.xlsx'), cfg.headers);
    }
  };

  const tabClass = (tab: 'mesh' | 'import') =>
    `flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
      activeTab === tab
        ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-b-transparent'
        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
    }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Monitor size={28} className="text-blue-600" />
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700 flex gap-1">
        <button className={tabClass('mesh')} onClick={() => setActiveTab('mesh')}>
          <Server size={16} /> MeshCentral
        </button>
        <button className={tabClass('import')} onClick={() => setActiveTab('import')}>
          <Upload size={16} /> Importar datos
        </button>
      </div>

      {activeTab === 'mesh' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Conexión MeshCentral</h2>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                meshConnected ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {meshConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
              {meshConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-600 dark:text-gray-300">URL del servidor</span>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2"
                value={meshConfig.serverUrl}
                onChange={(e) => setMeshConfig({ ...meshConfig, serverUrl: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600 dark:text-gray-300">Usuario</span>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2"
                value={meshConfig.username}
                onChange={(e) => setMeshConfig({ ...meshConfig, username: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600 dark:text-gray-300">Contraseña</span>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2"
                value={meshConfig.password}
                onChange={(e) => setMeshConfig({ ...meshConfig, password: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600 dark:text-gray-300">Intervalo de sincronización (min)</span>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2"
                value={meshConfig.syncInterval}
                onChange={(e) => setMeshConfig({ ...meshConfig, syncInterval: Number(e.target.value) || 5 })}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={meshConfig.autoSync}
              onChange={(e) => setMeshConfig({ ...meshConfig, autoSync: e.target.checked })}
            />
            Sincronización automática
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveConfig}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600"
            >
              <Save size={16} /> Guardar configuración
            </button>
            <button
              onClick={handleTestMesh}
              disabled={meshTesting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {meshTesting ? <RefreshCw size={16} className="animate-spin" /> : <Wifi size={16} />}
              Probar conexión
            </button>
            {meshConnected && (
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
              >
                <Trash2 size={16} /> Desconectar
              </button>
            )}
          </div>

          {meshMessage && (
            <div
              className={`flex items-center gap-2 text-sm rounded-lg p-3 ${
                meshMessage.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              }`}
            >
              {meshMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {meshMessage.text}
            </div>
          )}

          {meshNodes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Nodos ({meshNodes.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200 dark:border-slate-700">
                      <th className="py-2 pr-4">Nombre</th>
                      <th className="py-2 pr-4">IP</th>
                      <th className="py-2 pr-4">Sistema</th>
                      <th className="py-2 pr-4">Versión agente</th>
                      <th className="py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meshNodes.map((node) => (
                      <tr key={node.id} className="border-b border-gray-100 dark:border-slate-700/50">
                        <td className="py-2 pr-4">{node.name}</td>
                        <td className="py-2 pr-4">{node.ip || '-'}</td>
                        <td className="py-2 pr-4">{node.os || '-'}</td>
                        <td className="py-2 pr-4">{node.agentVersion || '-'}</td>
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
          )}
        </div>
      )}

      {activeTab === 'import' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Importación masiva de datos</h2>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(IMPORT_CONFIG) as ImportType[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setImportType(t);
                  setImportResult(null);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                  importType === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {t === 'equipment' && <Monitor size={15} />}
                {t === 'collaborator' && <Users size={15} />}
                {t === 'supplier' && <Building2 size={15} />}
                {IMPORT_CONFIG[t].label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-300">Formato:</span>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="format"
                checked={fileFormat === 'csv'}
                onChange={() => setFileFormat('csv')}
              />
              <FileText size={15} /> CSV
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="format"
                checked={fileFormat === 'excel'}
                onChange={() => setFileFormat('excel')}
              />
              <FileSpreadsheet size={15} /> Excel
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-sm"
            >
              <Download size={16} /> Descargar plantilla
            </button>

            <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm cursor-pointer">
              <Upload size={16} />
              {importing ? 'Importando…' : 'Seleccionar archivo'}
              <input
                type="file"
                accept={fileFormat === 'csv' ? '.csv' : '.xlsx,.xls'}
                className="hidden"
                disabled={importing}
                onChange={handleFileSelected}
              />
            </label>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Encabezados esperados: {IMPORT_CONFIG[importType].headers.join(', ')}
          </p>

          {importResult && (
            <div
              className={`rounded-lg p-4 text-sm space-y-2 ${
                importResult.success
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {importResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {importResult.imported} registro(s) importado(s)
                {importResult.errors.length > 0 && ` — ${importResult.errors.length} error(es)`}
              </div>
              {importResult.errors.length > 0 && (
                <ul className="list-disc pl-5 max-h-40 overflow-y-auto">
                  {importResult.errors.map((err, i) => (
                    <li key={`${i}-${err.slice(0, 40)}`}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
