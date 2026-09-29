import React, { useState } from 'react';

const mockToners = [
  { id: 1, marca: 'HP', modelo: 'CF217A', codigo: 'TN-HP-001', color: 'Negro', stockActual: 12, stockMinimo: 5, stockMaximo: 30, precioUnitario: 4500 },
  { id: 2, marca: 'HP', modelo: 'CF219A', codigo: 'TN-HP-002', color: 'Negro', stockActual: 3, stockMinimo: 5, stockMaximo: 25, precioUnitario: 3800 },
  { id: 3, marca: 'Brother', modelo: 'TN-2420', codigo: 'TN-BR-001', color: 'Negro', stockActual: 8, stockMinimo: 4, stockMaximo: 20, precioUnitario: 5200 },
];

const mockImpresoras = [
  { id: 1, marca: 'HP', modelo: 'LaserJet Pro M102w', numeroSerie: 'HP-2023-001', area: 'Administración', estado: 'disponible', tonerCompatible: 'CF217A' },
  { id: 2, marca: 'Brother', modelo: 'HL-L2350DW', numeroSerie: 'BR-2023-002', area: 'Contabilidad', estado: 'en_servicio', tonerCompatible: 'TN-2420' },
];

const mockPCs = [
  { id: 1, nombre: 'PC-ADMIN-01', usuario: 'Juan Pérez', area: 'Administración', estado: 'online', ultimaConexion: new Date().toISOString(), ip: '192.168.1.101', sistemaOperativo: 'Windows 11', encendidaDesde: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  { id: 2, nombre: 'PC-CONT-01', usuario: 'María García', area: 'Contabilidad', estado: 'online', ultimaConexion: new Date().toISOString(), ip: '192.168.1.102', sistemaOperativo: 'Windows 10', encendidaDesde: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString() },
  { id: 3, nombre: 'PC-RRHH-01', usuario: 'Ana Martínez', area: 'Recursos Humanos', estado: 'offline', ultimaConexion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), ip: '192.168.1.103', sistemaOperativo: 'Windows 11', encendidaDesde: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  { id: 4, nombre: 'PC-VENTAS-01', usuario: 'Carlos López', area: 'Ventas', estado: 'online', ultimaConexion: new Date().toISOString(), ip: '192.168.1.104', sistemaOperativo: 'Windows 10', encendidaDesde: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
];

const App: React.FC = () => {
  const [paginaActual, setPaginaActual] = useState('dashboard');

  const tonersBajoStock = mockToners.filter(t => t.stockActual <= t.stockMinimo);
  const impresorasDisponibles = mockImpresoras.filter(i => i.estado === 'disponible').length;
  const pcsOnline = mockPCs.filter(pc => pc.estado === 'online').length;
  const pcsOffline = mockPCs.filter(pc => pc.estado === 'offline').length;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Sistema de Gestión de Toners</h1>
          <p className="text-blue-100 text-sm">Donnet S.A.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-64">
            <nav className="bg-white rounded-lg shadow p-4 space-y-2">
              <button onClick={() => setPaginaActual('dashboard')} className={`w-full text-left px-4 py-3 rounded-lg font-medium ${paginaActual === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>📊 Dashboard</button>
              <button onClick={() => setPaginaActual('monitoreo')} className={`w-full text-left px-4 py-3 rounded-lg font-medium ${paginaActual === 'monitoreo' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>🖥️ Monitoreo PCs</button>
              <button onClick={() => setPaginaActual('toners')} className={`w-full text-left px-4 py-3 rounded-lg font-medium ${paginaActual === 'toners' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>🖨️ Toners</button>
              <button onClick={() => setPaginaActual('impresoras')} className={`w-full text-left px-4 py-3 rounded-lg font-medium ${paginaActual === 'impresoras' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>🖨️ Impresoras</button>
            </nav>
          </aside>

          <main className="flex-1">
            {paginaActual === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Total Toners</p>
                    <p className="text-3xl font-bold text-blue-600">{mockToners.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Impresoras</p>
                    <p className="text-3xl font-bold text-green-600">{impresorasDisponibles}/{mockImpresoras.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">PCs Online</p>
                    <p className="text-3xl font-bold text-green-600">{pcsOnline}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Bajo Stock</p>
                    <p className="text-3xl font-bold text-red-600">{tonersBajoStock.length}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Toners</h3>
                  <div className="space-y-2">
                    {mockToners.map(t => (
                      <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{t.marca} {t.modelo}</p>
                          <p className="text-sm text-gray-500">{t.codigo}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${t.stockActual <= t.stockMinimo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {t.stockActual} uds.
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {paginaActual === 'monitoreo' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Monitoreo de PCs</h2>
                  <a href="https://mesh.donnet.com.ar" target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">🔗 MeshCentral</a>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Online</p>
                    <p className="text-2xl font-bold text-green-600">{pcsOnline}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Offline</p>
                    <p className="text-2xl font-bold text-gray-600">{pcsOffline}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Total</p>
                    <p className="text-2xl font-bold text-gray-800">{mockPCs.length}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Estado de Equipos</h3>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Nombre</th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Usuario</th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Área</th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Estado</th>
                        <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockPCs.map(pc => (
                        <tr key={pc.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{pc.nombre}</td>
                          <td className="px-4 py-3">{pc.usuario}</td>
                          <td className="px-4 py-3">{pc.area}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${pc.estado === 'online' ? 'bg-green-100 text-green-700' : pc.estado === 'offline' ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'}`}>
                              {pc.estado === 'online' ? '● Online' : pc.estado === 'offline' ? '○ Offline' : '⚠ Error'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-sm">{pc.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {paginaActual === 'toners' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Toners</h2>
                <div className="space-y-2">
                  {mockToners.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{t.marca} {t.modelo}</p>
                        <p className="text-sm text-gray-500">{t.codigo} | {t.color}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{t.stockActual}</p>
                        <p className="text-xs text-gray-500">unidades</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {paginaActual === 'impresoras' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Impresoras</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockImpresoras.map(imp => (
                    <div key={imp.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-lg">{imp.marca} {imp.modelo}</p>
                          <p className="text-sm text-gray-500">S/N: {imp.numeroSerie}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${imp.estado === 'disponible' ? 'bg-green-100 text-green-700' : imp.estado === 'en_servicio' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {imp.estado === 'disponible' ? 'Disponible' : imp.estado === 'en_servicio' ? 'En Servicio' : 'Fuera de Servicio'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><span className="font-medium">Área:</span> {imp.area}</p>
                        <p><span className="font-medium">Toner:</span> {imp.tonerCompatible}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;