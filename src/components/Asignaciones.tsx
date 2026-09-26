import React, { useState } from 'react';
import { asignaciones as initialAsignaciones } from '../data/mockData';
import { ClipboardList, Search, Plus, Calendar } from 'lucide-react';

const Asignaciones: React.FC = () => {
  const [asignaciones] = useState(initialAsignaciones);
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [showModal, setShowModal] = useState(false);

  const areas = [...new Set(asignaciones.map(a => a.area))];

  const filteredAsignaciones = asignaciones.filter(a => {
    const matchSearch = a.tonerNombre.toLowerCase().includes(search.toLowerCase()) ||
      a.area.toLowerCase().includes(search.toLowerCase()) ||
      a.responsableNombre.toLowerCase().includes(search.toLowerCase());
    const matchArea = !filterArea || a.area === filterArea;
    return matchSearch && matchArea;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por toner, área o responsable..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Todas las áreas</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Asignación
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Total Asignaciones</p>
          <p className="text-xl font-bold text-gray-800">{asignaciones.length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Este Mes</p>
          <p className="text-xl font-bold text-blue-600">{asignaciones.filter(a => a.fechaAsignacion >= '2024-03-01').length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Áreas Atendidas</p>
          <p className="text-xl font-bold text-gray-800">{areas.length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Responsable</p>
          <p className="text-xl font-bold text-gray-800">{[...new Set(asignaciones.map(a => a.responsableNombre))].length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Toner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Impresora</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Área</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Responsable</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAsignaciones.map(asig => (
                <tr key={asig.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{asig.fechaAsignacion}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{asig.tonerNombre}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{asig.impresoraModelo}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                      {asig.area}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{asig.responsableNombre}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[150px] truncate">{asig.observaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAsignaciones.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No se encontraron asignaciones</p>
          </div>
        )}
      </div>

      {/* Modal Nueva Asignación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nueva Asignación de Toner</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Toner</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>Seleccionar toner...</option>
                  <option>HP CF217A - Negro</option>
                  <option>Brother TN-2420 - Negro</option>
                  <option>Epson T-664 - Negro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impresora</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>Seleccionar impresora...</option>
                  <option>HP LaserJet Pro M102w - Administración</option>
                  <option>Brother HL-L2350DW - Contabilidad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>Seleccionar área...</option>
                  <option>Administración</option>
                  <option>Contabilidad</option>
                  <option>Ventas</option>
                  <option>Recursos Humanos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3}></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asignaciones;
