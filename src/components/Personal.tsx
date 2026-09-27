import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Personal as PersonalType } from '../types';
import { Users, Search, Mail, Phone, Building, Plus, X } from 'lucide-react';

const mapRowToPersonal = (row: any): PersonalType => ({
  id: row.id,
  nombre: row.nombre,
  apellido: row.apellido,
  legajo: row.legajo,
  area: row.area,
  cargo: row.cargo,
  email: row.email,
  telefono: row.telefono,
  activo: row.activo,
});

const emptyForm = {
  nombre: '', apellido: '', legajo: '', area: '', cargo: '', email: '', telefono: '', activo: true,
};

const Personal: React.FC = () => {
  const [personal, setPersonal] = useState<PersonalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const cargarPersonal = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('personal').select('*').order('id', { ascending: true });
    if (error) setError('No se pudo cargar el personal: ' + error.message);
    else setPersonal((data || []).map(mapRowToPersonal));
    setLoading(false);
  };

  useEffect(() => { cargarPersonal(); }, []);

  const areas = [...new Set(personal.map(p => p.area))];

  const filteredPersonal = personal.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.apellido.toLowerCase().includes(search.toLowerCase()) ||
      p.legajo.toLowerCase().includes(search.toLowerCase());
    const matchArea = !filterArea || p.area === filterArea;
    return matchSearch && matchArea;
  });

  const handleFormChange = (field: string, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const nuevo = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      legajo: form.legajo.trim(),
      area: form.area.trim(),
      cargo: form.cargo.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      activo: form.activo,
    };
    const { error } = await supabase.from('personal').insert(nuevo);
    if (error) {
      setError('No se pudo guardar: ' + error.message);
      setSaving(false);
      return;
    }
    setForm(emptyForm);
    setShowModal(false);
    setSaving(false);
    await cargarPersonal();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o legajo..."
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
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Agregar Personal
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Total Personal</p>
          <p className="text-xl font-bold text-gray-800">{personal.length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Activos</p>
          <p className="text-xl font-bold text-green-600">{personal.filter(p => p.activo).length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Áreas</p>
          <p className="text-xl font-bold text-blue-600">{areas.length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Departamento IT</p>
          <p className="text-xl font-bold text-purple-600">{personal.filter(p => p.area === 'IT').length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando personal...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPersonal.map(persona => (
            <div key={persona.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-700">{persona.nombre[0]}{persona.apellido[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{persona.nombre} {persona.apellido}</p>
                  <p className="text-xs text-gray-500">{persona.cargo}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  persona.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {persona.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="w-3.5 h-3.5 text-gray-400" />
                  <span>{persona.area}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{persona.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{persona.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-xs font-mono text-gray-400">Legajo: {persona.legajo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredPersonal.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No se encontró personal con los filtros aplicados</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Agregar Personal</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAgregar} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                  <input required value={form.nombre} onChange={e => handleFormChange('nombre', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Apellido</label>
                  <input required value={form.apellido} onChange={e => handleFormChange('apellido', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Legajo</label>
                  <input required value={form.legajo} onChange={e => handleFormChange('legajo', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="EMP-011" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Área</label>
                  <input required value={form.area} onChange={e => handleFormChange('area', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cargo</label>
                <input required value={form.cargo} onChange={e => handleFormChange('cargo', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input required type="email" value={form.email} onChange={e => handleFormChange('email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                  <input value={form.telefono} onChange={e => handleFormChange('telefono', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.activo} onChange={e => handleFormChange('activo', e.target.checked)} />
                Activo
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personal;