import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Proveedor } from '../types';
import { Building2, Search, Phone, Mail, MapPin, Plus, X } from 'lucide-react';

const mapRowToProveedor = (row: any): Proveedor => ({
  id: row.id,
  razonSocial: row.razon_social,
  cuit: row.cuit,
  contacto: row.contacto,
  telefono: row.telefono,
  email: row.email,
  direccion: row.direccion,
  marcas: row.marcas ?? [],
});

const emptyForm = { razonSocial: '', cuit: '', contacto: '', telefono: '', email: '', direccion: '', marcas: '' };

const Proveedores: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const cargarProveedores = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('proveedores').select('*').order('id', { ascending: true });
    if (error) setError('No se pudieron cargar los proveedores: ' + error.message);
    else setProveedores((data || []).map(mapRowToProveedor));
    setLoading(false);
  };

  useEffect(() => { cargarProveedores(); }, []);

  const filteredProveedores = proveedores.filter(p => {
    return p.razonSocial.toLowerCase().includes(search.toLowerCase()) ||
      p.contacto.toLowerCase().includes(search.toLowerCase()) ||
      p.marcas.some(m => m.toLowerCase().includes(search.toLowerCase()));
  });

  const handleFormChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const nuevo = {
      razon_social: form.razonSocial.trim(),
      cuit: form.cuit.trim(),
      contacto: form.contacto.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
      direccion: form.direccion.trim(),
      marcas: form.marcas.split(',').map(s => s.trim()).filter(Boolean),
    };
    const { error } = await supabase.from('proveedores').insert(nuevo);
    if (error) {
      setError('No se pudo guardar el proveedor: ' + error.message);
      setSaving(false);
      return;
    }
    setForm(emptyForm);
    setShowModal(false);
    setSaving(false);
    await cargarProveedores();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar proveedor, contacto o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Agregar Proveedor
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Total Proveedores</p>
          <p className="text-xl font-bold text-gray-800">{proveedores.length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Marcas Cubiertas</p>
          <p className="text-xl font-bold text-blue-600">{[...new Set(proveedores.flatMap(p => p.marcas))].length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Marcas</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {[...new Set(proveedores.flatMap(p => p.marcas))].map(m => (
              <span key={m} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando proveedores...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProveedores.map(prov => (
            <div key={prov.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{prov.razonSocial}</h3>
                  <p className="text-xs text-gray-500 font-mono">CUIT: {prov.cuit}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-gray-400 font-medium w-16">Contacto:</span>
                  <span>{prov.contacto}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{prov.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{prov.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{prov.direccion}</span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500 mb-2">Marcas que provee:</p>
                <div className="flex flex-wrap gap-1.5">
                  {prov.marcas.map(marca => (
                    <span key={marca} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">{marca}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredProveedores.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No se encontraron proveedores</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Agregar Proveedor</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAgregar} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Razón Social</label>
                <input required value={form.razonSocial} onChange={e => handleFormChange('razonSocial', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CUIT</label>
                  <input value={form.cuit} onChange={e => handleFormChange('cuit', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="30-12345678-9" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Contacto</label>
                  <input value={form.contacto} onChange={e => handleFormChange('contacto', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                  <input value={form.telefono} onChange={e => handleFormChange('telefono', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => handleFormChange('email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Dirección</label>
                <input value={form.direccion} onChange={e => handleFormChange('direccion', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Marcas que provee (separadas por coma)</label>
                <input value={form.marcas} onChange={e => handleFormChange('marcas', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="HP, Epson, Brother" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar Proveedor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proveedores;

