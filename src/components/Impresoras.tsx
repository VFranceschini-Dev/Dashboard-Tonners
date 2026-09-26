import React, { useState } from 'react';
import { impresoras as initialImpresoras } from '../data/mockData';
import { Printer, Search, CheckCircle, XCircle, Clock } from 'lucide-react';

const Impresoras: React.FC = () => {
  const [impresoras] = useState(initialImpresoras);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterArea, setFilterArea] = useState('');

  const areas = [...new Set(impresoras.map(i => i.area))];

  const filteredImpresoras = impresoras.filter(i => {
    const matchSearch = i.modelo.toLowerCase().includes(search.toLowerCase()) ||
      i.marca.toLowerCase().includes(search.toLowerCase()) ||
      i.numeroSerie.toLowerCase().includes(search.toLowerCase());
    const matchEstado = !filterEstado || i.estado === filterEstado;
    const matchArea = !filterArea || i.area === filterArea;
    return matchSearch && matchEstado && matchArea;
  });

  const getEstadoIcon = (estado: string) => {
    switch(estado) {
      case 'disponible': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'en_servicio': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'fuera_servicio': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch(estado) {
      case 'disponible': return 'bg-green-100 text-green-700';
      case 'en_servicio': return 'bg-orange-100 text-orange-700';
      case 'fuera_servicio': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch(estado) {
      case 'disponible': return 'Disponible';
      case 'en_servicio': return 'En Servicio';
      case 'fuera_servicio': return 'Fuera de Servicio';
      default: return estado;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por modelo, marca o N° serie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="en_servicio">En Servicio</option>
            <option value="fuera_servicio">Fuera de Servicio</option>
          </select>
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Todas las áreas</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Disponibles</span>
          </div>
          <p className="text-2xl font-bold text-green-800">{impresoras.filter(i => i.estado === 'disponible').length}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">En Servicio</span>
          </div>
          <p className="text-2xl font-bold text-orange-800">{impresoras.filter(i => i.estado === 'en_servicio').length}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-700">Fuera de Servicio</span>
          </div>
          <p className="text-2xl font-bold text-red-800">{impresoras.filter(i => i.estado === 'fuera_servicio').length}</p>
        </div>
      </div>

      {/* Grid of printers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredImpresoras.map(imp => (
          <div key={imp.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  imp.estado === 'disponible' ? 'bg-green-100' :
                  imp.estado === 'en_servicio' ? 'bg-orange-100' : 'bg-red-100'
                }`}>
                  <Printer className={`w-5 h-5 ${
                    imp.estado === 'disponible' ? 'text-green-600' :
                    imp.estado === 'en_servicio' ? 'text-orange-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{imp.marca} {imp.modelo}</p>
                  <p className="text-xs text-gray-500">S/N: {imp.numeroSerie}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getEstadoBadge(imp.estado)}`}>
                {getEstadoLabel(imp.estado)}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Área:</span>
                <span className="font-medium text-gray-700">{imp.area}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Toner:</span>
                <span className="font-medium text-gray-700">{imp.tonerCompatible}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Último servicio:</span>
                <span className="text-gray-700">{imp.ultimaFechaServicio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Próximo servicio:</span>
                <span className={`font-medium ${
                  new Date(imp.proximoServicio) < new Date() ? 'text-red-600' : 'text-gray-700'
                }`}>{imp.proximoServicio}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredImpresoras.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Printer className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No se encontraron impresoras con los filtros aplicados</p>
        </div>
      )}
    </div>
  );
};

export default Impresoras;
