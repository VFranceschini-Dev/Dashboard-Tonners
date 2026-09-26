import React, { useState } from 'react';
import { toners as initialToners } from '../data/mockData';
import { Toner } from '../types';
import { Package, Search, AlertTriangle, Filter, Plus } from 'lucide-react';

const Toners: React.FC = () => {
  const [toners] = useState<Toner[]>(initialToners);
  const [search, setSearch] = useState('');
  const [filterMarca, setFilterMarca] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [showAlerts, setShowAlerts] = useState(false);

  const marcas = [...new Set(toners.map(t => t.marca))];
  const colores = [...new Set(toners.map(t => t.color))];

  const filteredToners = toners.filter(t => {
    const matchSearch = t.codigo.toLowerCase().includes(search.toLowerCase()) ||
      t.modelo.toLowerCase().includes(search.toLowerCase()) ||
      t.marca.toLowerCase().includes(search.toLowerCase());
    const matchMarca = !filterMarca || t.marca === filterMarca;
    const matchColor = !filterColor || t.color === filterColor;
    const matchAlert = !showAlerts || t.stockActual <= t.stockMinimo;
    return matchSearch && matchMarca && matchColor && matchAlert;
  });

  const getStockStatus = (toner: Toner) => {
    if (toner.stockActual === 0) return { label: 'Sin Stock', color: 'bg-red-100 text-red-700' };
    if (toner.stockActual <= toner.stockMinimo) return { label: 'Bajo Stock', color: 'bg-orange-100 text-orange-700' };
    if (toner.stockActual >= toner.stockMaximo * 0.8) return { label: 'Stock Alto', color: 'bg-blue-100 text-blue-700' };
    return { label: 'Normal', color: 'bg-green-100 text-green-700' };
  };

  const getStockBarColor = (toner: Toner) => {
    const percentage = (toner.stockActual / toner.stockMaximo) * 100;
    if (percentage <= 20) return 'bg-red-500';
    if (percentage <= 40) return 'bg-orange-500';
    if (percentage <= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código, modelo o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterMarca}
            onChange={(e) => setFilterMarca(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Todas las marcas</option>
            {marcas.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Todos los colores</option>
            {colores.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showAlerts ? 'bg-red-50 border-red-300 text-red-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Alertas
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Total Modelos</p>
          <p className="text-xl font-bold text-gray-800">{toners.length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Unidades Totales</p>
          <p className="text-xl font-bold text-gray-800">{toners.reduce((a, t) => a + t.stockActual, 0)}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Bajo Stock</p>
          <p className="text-xl font-bold text-orange-600">{toners.filter(t => t.stockActual <= t.stockMinimo).length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Valor Total</p>
          <p className="text-xl font-bold text-gray-800">${toners.reduce((a, t) => a + (t.stockActual * t.precioUnitario), 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Marca/Modelo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Color</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Compatible</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredToners.map(toner => {
                const status = getStockStatus(toner);
                return (
                  <tr key={toner.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{toner.codigo}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{toner.marca}</p>
                      <p className="text-xs text-gray-500">{toner.modelo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        toner.color === 'Negro' ? 'bg-gray-100 text-gray-700' :
                        toner.color === 'Cian' ? 'bg-cyan-100 text-cyan-700' :
                        toner.color === 'Magenta' ? 'bg-pink-100 text-pink-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          toner.color === 'Negro' ? 'bg-gray-800' :
                          toner.color === 'Cian' ? 'bg-cyan-500' :
                          toner.color === 'Magenta' ? 'bg-pink-500' :
                          'bg-yellow-500'
                        }`}></span>
                        {toner.color}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{toner.stockActual}</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getStockBarColor(toner)}`}
                            style={{ width: `${Math.min((toner.stockActual / toner.stockMaximo) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">/{toner.stockMaximo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[150px]">
                        {toner.compatibleCon.slice(0, 2).map((c, i) => (
                          <p key={i} className="text-xs text-gray-500 truncate">{c}</p>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">${toner.precioUnitario.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredToners.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No se encontraron toners con los filtros aplicados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toners;
