import React from 'react';
import { toners, impresoras, serviciosTecnicos, asignaciones, comprobantes } from '../data/mockData';
import { 
  Package, Printer, Wrench, AlertTriangle, CheckCircle, 
  Clock, TrendingDown, ArrowUpRight, Loader2, Monitor, ExternalLink
} from 'lucide-react';


const Dashboard: React.FC = () => {
  const tonersBajoStock = toners.filter(t => t.stockActual <= t.stockMinimo);
  const impresorasDisponibles = impresoras.filter(i => i.estado === 'disponible').length;
  const impresorasEnServicio = impresoras.filter(i => i.estado === 'en_servicio').length;
  const impresorasFueraServicio = impresoras.filter(i => i.estado === 'fuera_servicio').length;
  const serviciosPendientes = serviciosTecnicos.filter(s => s.estado === 'pendiente').length;
  const serviciosEnProceso = serviciosTecnicos.filter(s => s.estado === 'en_proceso').length;
  const comprobantesPendientes = comprobantes.filter(c => c.estado === 'pendiente').length;
  const totalToners = toners.reduce((acc, t) => acc + t.stockActual, 0);
  const valorStock = toners.reduce((acc, t) => acc + (t.stockActual * t.precioUnitario), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stock Total Toners</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalToners}</p>
              <p className="text-xs text-gray-500 mt-1">Valor: ${valorStock.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Impresoras Disponibles</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{impresorasDisponibles}/{impresoras.length}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Operativas
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Printer className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Servicios Pendientes</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{serviciosPendientes + serviciosEnProceso}</p>
              <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {serviciosPendientes} pendientes, {serviciosEnProceso} en proceso
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Alertas de Stock</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{tonersBajoStock.length}</p>
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Bajo mínimo
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Alertas de Stock Mínimo
            </h3>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
              {tonersBajoStock.length} alertas
            </span>
          </div>
          <div className="p-4 space-y-3">
            {tonersBajoStock.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No hay alertas de stock</p>
            ) : (
              tonersBajoStock.map(toner => (
                <div key={toner.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{toner.marca} {toner.modelo}</p>
                    <p className="text-xs text-gray-500">{toner.codigo} - {toner.color}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{toner.stockActual} uds.</p>
                    <p className="text-xs text-gray-500">Mín: {toner.stockMinimo}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Últimas Asignaciones
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {asignaciones.slice(0, 5).map(asig => (
              <div key={asig.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{asig.tonerNombre}</p>
                  <p className="text-xs text-gray-500">{asig.area} - {asig.fechaAsignacion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impresoras Status & Comprobantes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impresoras Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Printer className="w-5 h-5 text-green-500" />
              Estado de Impresoras
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{impresorasDisponibles}</p>
                <p className="text-xs text-gray-600">Disponibles</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{impresorasEnServicio}</p>
                <p className="text-xs text-gray-600">En Servicio</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{impresorasFueraServicio}</p>
                <p className="text-xs text-gray-600">Fuera de Servicio</p>
              </div>
            </div>
            <div className="space-y-2">
              {impresoras.filter(i => i.estado !== 'disponible').map(imp => (
                <div key={imp.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{imp.marca} {imp.modelo}</p>
                    <p className="text-xs text-gray-500">{imp.area}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    imp.estado === 'en_servicio' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {imp.estado === 'en_servicio' ? 'En Servicio' : 'Fuera de Servicio'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comprobantes Pendientes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Comprobantes Pendientes
            </h3>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
              {comprobantesPendientes} pendientes
            </span>
          </div>
          <div className="p-4 space-y-3">
            {comprobantes.filter(c => c.estado === 'pendiente').map(comp => (
              <div key={comp.id} className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-800">{comp.numero}</p>
                  <p className="text-sm font-bold text-gray-800">${comp.monto.toLocaleString()}</p>
                </div>
                <p className="text-xs text-gray-500">{comp.proveedorNombre} - {comp.concepto}</p>
                <p className="text-xs text-gray-400 mt-1">{comp.observaciones}</p>
              </div>
            ))}
            {comprobantesPendientes === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No hay comprobantes pendientes</p>
            )}
          </div>
        </div>
      </div>

      {/* Stock by Brand Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Resumen de Stock por Marca</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...new Set(toners.map(t => t.marca))].map(marca => {
              const marcaToners = toners.filter(t => t.marca === marca);
              const stockTotal = marcaToners.reduce((acc, t) => acc + (t.stock_actual ?? 0), 0);
              const alertas = marcaToners.filter(t => (t.stock_actual ?? 0) <= (t.stock_minimo ?? 0)).length;
              return (
                <div key={marca} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-800">{stockTotal}</p>
                  <p className="text-sm text-gray-600">{marca}</p>
                  {alertas > 0 && (
                    <p className="text-xs text-red-500 mt-1 flex items-center justify-center gap-1">
                      <TrendingDown className="w-3 h-3" /> {alertas} alerta{alertas > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              );
            })}
            {toners.length === 0 && (
              <div className="col-span-full text-center py-4 text-gray-500">
                No hay datos de toners disponibles
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PCs Fuera de Horario - Widget */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Monitor className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">PCs Encendidas Fuera de Horario</h3>
              <p className="text-orange-100 text-sm mt-1">Monitoreo de equipos activos fuera del horario comercial</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.href = '/seguimiento'}
              className="flex items-center gap-2 px-4 py-2 bg-white text-orange-700 rounded-lg text-sm font-semibold hover:bg-orange-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Detalle
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <p className="text-orange-100 text-xs">PCs Activas</p>
            <p className="text-white font-bold text-2xl">0</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <p className="text-orange-100 text-xs">Áreas</p>
            <p className="text-white font-bold text-2xl">0</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <p className="text-orange-100 text-xs">Usuarios</p>
            <p className="text-white font-bold text-2xl">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;