import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Asignacion } from '../types';
import { ClipboardList, Search, Plus, Calendar, X } from 'lucide-react';

const mapRowToAsignacion = (row: any): Asignacion => ({
  id: row.id,
  tonerId: row.toner_id,
  tonerNombre: row.toners ? `${row.toners.marca} ${row.toners.modelo}` : `Toner #${row.toner_id ?? '-'}`,
  impresoraId: row.impresora_id,
  impresoraModelo: row.impresoras ? `${row.impresoras.marca} ${row.impresoras.modelo}` : `Impresora #${row.impresora_id ?? '-'}`,
  area: row.area,
  responsableId: row.responsable_id,
  responsableNombre: row.perfiles_usuarios ? row.perfiles_usuarios.nombre : 'Sin asignar',
  fechaAsignacion: row.fecha_asignacion,
  observaciones: row.observaciones ?? '',
});

const emptyForm = { tonerId: '', impresoraId: '', area: '', responsableId: '', fechaAsignacion: '', observaciones: '' };

const Asignaciones: React.FC = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [tonersOpciones, setTonersOpciones] = useState<{ id: number; nombre: string }[]>([]);
  const [impresorasOpciones, setImpresorasOpciones] = useState<{ id: number; nombre: string; area: string }[]>([]);
  const [responsablesOpciones, setResponsablesOpciones] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const cargarAsignaciones = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('asignaciones')
      .select('*, toners(marca, modelo), impresoras(marca, modelo), perfiles_usuarios(nombre)')
      .order('id', { ascending: true });
    if (error) setError('No se pudieron cargar las asignaciones: ' + error.message);
    else setAsignaciones((data || []).map(mapRowToAsignacion));
    setLoading(false);
  };

  const cargarOpciones = async () => {
    const [{ data: toners }, { data: impresoras }, { data: perfiles }] = await Promise.all([
      supabase.from('toners').select('id, marca, modelo').order('id'),
      supabase.from('impresoras').select('id, marca, modelo, area').order('id'),
      supabase.from('perfiles_usuarios').select('id, nombre').order('nombre'),
    ]);
    setTonersOpciones((toners || []).map((t: any) => ({ id: t.id, nombre: `${t.marca} ${t.modelo}` })));
    setImpresorasOpciones((impresoras || []).map((i: any) => ({ id: i.id, nombre: `${i.marca} ${i.modelo}`, area: i.area })));
    setResponsablesOpciones((perfiles || []).map((p: any) => ({ id: p.id, nombre: p.nombre })));
  };

  useEffect(() => { cargarAsignaciones(); cargarOpciones(); }, []);

  const areas = [...new Set(asignaciones.map(a => a.area))];

  const filteredAsignaciones = asignaciones.filter(a => {
    const matchSearch = a.tonerNombre.toLowerCase().includes(search.toLowerCase()) ||
      a.area.toLowerCase().includes(search.toLowerCase()) ||
      a.responsableNombre.toLowerCase().includes(search.toLowerCase());
    const matchArea = !filterArea || a.area === filterArea;
    return matchSearch && matchArea;
  });

  const handleFormChange = (field: string, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'impresoraId') {
        const imp = impresorasOpciones.find(i => String(i.id) === value);
        if (imp) next.area = imp.area;
      }
      return next;
    });
  };

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const nueva = {
      toner_id: form.tonerId ? Number(form.tonerId) : null,
      impresora_id: form.impresoraId ? Number(form.impresoraId) : null,
      area: form.area.trim(),
      responsable_id: form.responsableId || null,
      fecha_asignacion: form.fechaAsignacion || null,
      observaciones: form.observaciones.trim(),
    };
    const { error } = await supabase.from('asignaciones').insert(nueva);
    if (error) {
      setError('No se pudo guardar la asignación: ' + error.message);
      setSaving(false);
      return;
    }
    setForm(emptyForm);
    setShowModal(false);
    setSaving(false);
    await cargarAsignaciones();
  };

  return (
    <div className="space-y-4">
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
          <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Todas las áreas</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Nueva Asignación
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Total Asignaciones</p>
          <p className="text-xl font-bold text-gray-800">{asignaciones.length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Este Mes</p>
          <p className="text-xl font-bold text-blue-600">{asignaciones.filter(a => a.fechaAsignacion && a.fechaAsignacion >= new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10)).length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Áreas Atendidas</p>
          <p className="text-xl font-bold text-gray-800">{areas.length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Responsables</p>
          <p className="text-xl font-bold text-gray-800">{[...new Set(asignaciones.map(a => a.responsableNombre))].length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando asignaciones...</div>
        ) : (
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
                    <td className="px-4 py-3"><p className="font-medium text-gray-800">{asig.tonerNombre}</p></td>
                    <td className="px-4 py-3"><p className="text-gray-700">{asig.impresoraModelo}</p></td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">{asig.area}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{asig.responsableNombre}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[150px] truncate">{asig.observaciones}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredAsignaciones.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No se encontraron asignaciones</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6">
              <h3 className="text-lg font-semibold text-gray-800">Nueva Asignación de Toner</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAgregar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Toner</label>
                <select required value={form.tonerId} onChange={e => handleFormChange('tonerId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Seleccionar toner...</option>
                  {tonersOpciones.map(op => <option key={op.id} value={op.id}>{op.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impresora</label>
                <select required value={form.impresoraId} onChange={e => handleFormChange('impresoraId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Seleccionar impresora...</option>
                  {impresorasOpciones.map(op => <option key={op.id} value={op.id}>{op.nombre} - {op.area}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                <input required value={form.area} onChange={e => handleFormChange('area', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                <select value={form.responsableId} onChange={e => handleFormChange('responsableId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Seleccionar responsable...</option>
                  {responsablesOpciones.map(op => <option key={op.id} value={op.id}>{op.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de asignación</label>
                <input type="date" value={form.fechaAsignacion} onChange={e => handleFormChange('fechaAsignacion', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea value={form.observaciones} onChange={e => handleFormChange('observaciones', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3}></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asignaciones;