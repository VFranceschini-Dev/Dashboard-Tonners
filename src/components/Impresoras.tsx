import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Impresora } from '../types';
import { Printer, Search, CheckCircle, XCircle, Clock, Plus, X } from 'lucide-react';

const mapRowToImpresora = (row: any): Impresora => ({
  id: row.id,
  marca: row.marca,
  modelo: row.modelo,
  numeroSerie: row.numero_serie,
  area: row.area,
  estado: row.estado,
  tonerCompatible: row.toner_compatible,
  ultimaFechaServicio: row.ultima_fecha_servicio,
  proximoServicio: row.proximo_servicio,
});

const emptyForm = {
  marca: '',
  modelo: '',
  numeroSerie: '',
  area: '',
  estado: 'disponible',
  tonerCompatible: '',
  ultimaFechaServicio: '',
  proximoServicio: '',
};

const Impresoras: React.FC = () => {
  const [impresoras, setImpresoras] = useState<Impresora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const cargarImpresoras = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('impresoras').select('*').order('id', { ascending: true });
    if (error) setError('No se pudieron cargar las impresoras: ' + error.message);
    else setImpresoras((data || []).map(mapRowToImpresora));
    setLoading(false);
  };

  useEffect(() => { cargarImpresoras(); }, []);

  const areas = [...new Set(impresoras.map(i => i.area))];

  const filteredImpresoras = impresoras.filter(i => {
    const matchSearch = i.modelo.toLowerCase().includes(search.toLowerCase()) ||
      i.marca.toLowerCase().includes(search.toLowerCase()) ||
      i.numeroSerie.toLowerCase().includes(search.toLowerCase());
    const matchEstado = !filterEstado || i.estado === filterEstado;
    const matchArea = !filterArea || i.area === filterArea;
    return matchSearch && matchEstado && matchArea;
  });

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

  const handleFormChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const nueva = {
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      numero_serie: form.numeroSerie.trim(),
      area: form.area.trim(),
      estado: form.estado,
      toner_compatible: form.tonerCompatible.trim(),
      ultima_fecha_servicio: form.ultimaFechaServicio || null,
      proximo_servicio: form.proximoServicio || null,
    };
    const { error } = await supabase.from('impresoras').insert(nueva);
    if (error) {
      setError('No se pudo guardar la impresora: ' + error.message);
      setSaving(false);
      return;
    }
    setForm(emptyForm);
    setShowModal(false);
    setSaving(false);
    await cargarImpresoras();
  };

  return (
    <div className="space-y-4">
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
        <div className="flex gap-2 flex-wrap">
          <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="en_servicio">En Servicio</option>
            <option value="fuera_servicio">Fuera de Servicio</option>
          </select>
          <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Todas las áreas</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Agregar Impresora
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}

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

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando impresoras...</div>
      ) : (
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
                    imp.proximoServicio && new Date(imp.proximoServicio) < new Date() ? 'text-red-600' : 'text-gray-700'
                  }`}>{imp.proximoServicio}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredImpresoras.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Printer className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No se encontraron impresoras con los filtros aplicados</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Agregar Impresora</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAgregar} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Marca</label>
                  <input required value={form.marca} onChange={e => handleFormChange('marca', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Modelo</label>
                  <input required value={form.modelo} onChange={e => handleFormChange('modelo', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">N° de Serie</label>
                  <input required value={form.numeroSerie} onChange={e => handleFormChange('numeroSerie', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Área</label>
                  <input required value={form.area} onChange={e => handleFormChange('area', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                  <select value={form.estado} onChange={e => handleFormChange('estado', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="disponible">Disponible</option>
                    <option value="en_servicio">En Servicio</option>
                    <option value="fuera_servicio">Fuera de Servicio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Toner compatible</label>
                  <input required value={form.tonerCompatible} onChange={e => handleFormChange('tonerCompatible', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Código de toner" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Último servicio</label>
                  <input type="date" value={form.ultimaFechaServicio} onChange={e => handleFormChange('ultimaFechaServicio', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Próximo servicio</label>
                  <input type="date" value={form.proximoServicio} onChange={e => handleFormChange('proximoServicio', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar Impresora'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Impresoras;