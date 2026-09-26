import React, { useState } from 'react';
import { serviciosTecnicos as initialServicios } from '../data/mockData';
import { Wrench, Search, Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ServiciosTecnicos: React.FC = () => {
  const [servicios] = useState(initialServicios);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filteredServicios = servicios.filter(s => {
    const matchSearch = s.impresoraModelo.toLowerCase().includes(search.toLowerCase()) ||
      s.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      s.tecnicoAsignado.toLowerCase().includes(search.toLowerCase());
    const matchEstado = !filterEstado || s.estado === filterEstado;
    const matchTipo = !filterTipo || s.tipoServicio === filterTipo;
    return matchSearch && matchEstado && matchTipo;
  });

  const getEstadoIcon = (estado: string) => {
    switch(estado) {
      case 'pendiente': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'en_proceso': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'completado': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelado': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch(estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-700';
      case 'en_proceso': return 'bg-blue-100 text-blue-700';
      case 'completado': return 'bg-green-100 text-green-700';
      case 'cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch(estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En Proceso';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch(tipo) {
      case 'preventivo': return 'bg-purple-100 text-purple-700';
      case 'correctivo': return 'bg-red-100 text-red-700';
      case 'instalacion': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
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
            placeholder="Buscar por impresora, descripción o técnico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Todos los tipos</option>
            <option value="preventivo">Preventivo</option>
            <option value="correctivo">Correctivo</option>
            <option value="instalacion">Instalación</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Servicio
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-600">Pendientes</p>
          <p className="text-xl font-bold text-yellow-800">{servicios.filter(s => s.estado === 'pendiente').length}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-600">En Proceso</p>
          <p className="text-xl font-bold text-blue-800">{servicios.filter(s => s.estado === 'en_proceso').length}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-xs text-green-600">Completados</p>
          <p className="text-xl font-bold text-green-800">{servicios.filter(s => s.estado === 'completado').length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Costo Total</p>
          <p className="text-xl font-bold text-gray-800">${servicios.reduce((a, s) => a + s.costo, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredServicios.map(servicio => (
          <div key={servicio.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getEstadoIcon(servicio.estado)}
                <div>
                  <p className="font-medium text-gray-800">{servicio.impresoraModelo}</p>
                  <p className="text-xs text-gray-500">ID: {servicio.impresoraId}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getEstadoBadge(servicio.estado)}`}>
                  {getEstadoLabel(servicio.estado)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTipoBadge(servicio.tipoServicio)}`}>
                  {servicio.tipoServicio}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">{servicio.descripcion}</p>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Técnico:</span>
                <span className="font-medium text-gray-700">{servicio.tecnicoAsignado}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha solicitud:</span>
                <span className="text-gray-700">{servicio.fechaSolicitud}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha estimada:</span>
                <span className={`font-medium ${
                  new Date(servicio.fechaEstimada) < new Date() && servicio.estado !== 'completado' ? 'text-red-600' : 'text-gray-700'
                }`}>{servicio.fechaEstimada}</span>
              </div>
              {servicio.fechaCompletado && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Completado:</span>
                  <span className="text-green-600 font-medium">{servicio.fechaCompletado}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Costo estimado:</span>
                <span className="font-bold text-gray-800">${servicio.costo.toLocaleString()}</span>
              </div>
            </div>

            {servicio.observaciones && (
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500"><span className="font-medium">Obs:</span> {servicio.observaciones}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredServicios.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Wrench className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No se encontraron servicios técnicos</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nuevo Servicio Técnico</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impresora</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>Seleccionar impresora...</option>
                  <option>HP LaserJet Pro M102w - Administración</option>
                  <option>Brother HL-L2350DW - Contabilidad</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>Preventivo</option>
                    <option>Correctivo</option>
                    <option>Instalación</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>Carlos López</option>
                    <option>Técnico Externo</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Estimada</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo Estimado</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="$0" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Crear Servicio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiciosTecnicos;
