import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Monitor, Clock, AlertTriangle, User, MapPin, RefreshCw, Loader2 } from 'lucide-react';

interface PCMonitoreo {
  id: number;
  nombre_pc: string;
  area: string;
  usuario: string;
  estado: 'encendida' | 'apagada';
  ultima_conexion: string;
  ip_address?: string;
}

const SeguimientoPCs: React.FC = () => {
  const [pcsFueraHorario, setPcsFueraHorario] = useState<PCMonitoreo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [horarioComercial, setHorarioComercial] = useState({ inicio: 9, fin: 18 });

  useEffect(() => {
    cargarPCsFueraHorario();
    const interval = setInterval(cargarPCsFueraHorario, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const cargarPCsFueraHorario = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('monitoreo_pcs')
        .select('*')
        .eq('estado', 'encendida')
        .order('ultima_conexion', { ascending: false });

      if (error) {
        setError('Error al cargar el monitoreo de PCs: ' + error.message);
        setLoading(false);
        return;
      }

      const ahora = new Date();
      const horaActual = ahora.getHours();
      const diaSemana = ahora.getDay();
      const esFinDeSemana = diaSemana === 0 || diaSemana === 6;
      const fueraDeHorario = horaActual < horarioComercial.inicio || horaActual >= horarioComercial.fin;

      const pcsFiltradas = (data || []).filter((pc: any) => {
        const ultimaConexion = new Date(pc.ultima_conexion);
        const horaConexion = ultimaConexion.getHours();
        const diaConexion = ultimaConexion.getDay();
        const fueFinDeSemana = diaConexion === 0 || diaConexion === 6;
        const fueFueraDeHorario = horaConexion < horarioComercial.inicio || horaConexion >= horarioComercial.fin;

        return (fueraDeHorario || esFinDeSemana) || (fueFueraDeHorario || fueFinDeSemana);
      }).map((pc: any) => ({
        id: pc.id,
        nombre_pc: pc.nombre_pc,
        area: pc.area,
        usuario: pc.usuario,
        estado: pc.estado,
        ultima_conexion: pc.ultima_conexion,
        ip_address: pc.ip_address,
      }));

      setPcsFueraHorario(pcsFiltradas);
    } catch (err) {
      setError('Error inesperado al cargar los datos');
      console.error(err);
    }

    setLoading(false);
  };

  const formatTiempo = (fecha: string) => {
    const ahora = new Date();
    const conexion = new Date(fecha);
    const diffMs = ahora.getTime() - conexion.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h ${diffMins % 60}min`;
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Monitor className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">PCs Encendidas Fuera de Horario</h2>
            <p className="text-sm text-gray-500">Monitoreo de equipos activos fuera del horario comercial</p>
          </div>
        </div>
        <button
          onClick={cargarPCsFueraHorario}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-800 mb-1">Atención: Equipos Activos Fuera de Horario</h3>
            <p className="text-sm text-orange-700">
              Las siguientes PCs se encuentran encendidas fuera del horario comercial (Lunes a Viernes de {horarioComercial.inicio}:00 a {horarioComercial.fin}:00 hs).
              Verificar si es necesario apagar estos equipos para ahorrar energía.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Monitor className="w-4 h-4 text-orange-500" />
            <p className="text-xs text-gray-500">PCs Encendidas</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{pcsFueraHorario.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-gray-500">Áreas Afectadas</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{[...new Set(pcsFueraHorario.map(pc => pc.area))].length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-purple-500" />
            <p className="text-xs text-gray-500">Usuarios</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{[...new Set(pcsFueraHorario.map(pc => pc.usuario))].length}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <h3 className="font-semibold text-gray-800">Listado de PCs</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            <span className="ml-3 text-gray-600">Cargando PCs...</span>
          </div>
        ) : pcsFueraHorario.length === 0 ? (
          <div className="text-center py-12">
            <Monitor className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No hay PCs encendidas fuera de horario</p>
            <p className="text-sm text-gray-400 mt-1">Todos los equipos están apagados o dentro del horario comercial</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pcsFueraHorario.map((pc) => (
              <div key={pc.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Monitor className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{pc.nombre_pc}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {pc.usuario}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {pc.area}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-orange-600 font-medium text-sm">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          Encendida
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatTiempo(pc.ultima_conexion)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Última conexión: {formatFecha(pc.ultima_conexion)}
                      {pc.ip_address && <span className="ml-2">• IP: {pc.ip_address}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600">
          <strong>Horario comercial:</strong> Lunes a Viernes de {horarioComercial.inicio}:00 a {horarioComercial.fin}:00 hs
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Actualización automática cada 5 minutos
        </p>
      </div>
    </div>
  );
};

export default SeguimientoPCs;