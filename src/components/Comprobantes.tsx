import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Comprobante } from '../types';
import { FileText, Search, DollarSign, Plus, X } from 'lucide-react';

const mapRowToComprobante = (row: any): Comprobante => ({
  id: row.id,
  numero: row.numero,
  tipo: row.tipo,
  proveedorId: row.proveedor_id,
  proveedorNombre: row.proveedores ? row.proveedores.razon_social : `Proveedor #${row.proveedor_id ?? '-'}`,
  fecha: row.fecha,
  monto: row.monto ?? 0,
  concepto: row.concepto,
  estado: row.estado,
  observaciones: '',
});

const emptyForm = {
  numero: '', tipo: 'factura', proveedorId: '', fecha: '', monto: '', concepto: '', estado: 'pendiente',
};

const Comprobantes: React.FC = () => {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [proveedoresOpciones, setProveedoresOpciones] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const cargarComprobantes = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('comprobantes')
      .select('*, proveedores(razon_social)')
      .order('id', { ascending: true });
    if (error) setError('No se pudieron cargar los comprobantes: ' + error.message);
    else setComprobantes((data || []).map(mapRowToComprobante));
    setLoading(false);
  };

  const cargarProveedoresOpciones = async () => {
    const { data } = await supabase.from('proveedores').select('id, razon_social').order('id');
    setProveedoresOpciones((data || []).map((p: any) => ({ id: p.id, nombre: p.razon_social })));
  };

  useEffect(() => { cargarComprobantes(); cargarProveedoresOpciones(); }, []);

  const filteredComprobantes = comprobantes.filter(c => {
    const matchSearch = c.numero.toLowerCase().includes(search.toLowerCase()) ||
      c.proveedorNombre.toLowerCase().includes(search.toLowerCase()) ||
      c.concepto.toLowerCase().includes(search.toLowerCase());
    const matchTipo = !filterTipo || c.tipo === filterTipo;
    const matchEstado = !filterEstado || c.estado === filterEstado;
    return matchSearch && matchTipo && matchEstado;
  });

  const getTipoBadge = (tipo: string) => {
    switch(tipo) {
      case 'factura': return 'bg-blue-100 text-blue-700';
      case 'recibo': return 'bg-green-100 text-green-700';
      case 'orden_compra': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch(tipo) {
      case 'factura': return 'Factura';
      case 'recibo': return 'Recibo';
      case 'orden_compra': return 'Orden de Compra';
      default: return tipo;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch(estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-700';
      case 'aprobado': return 'bg-blue-100 text-blue-700';
      case 'pagado': return 'bg-green-100 text-green-700';
      case 'rechazado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch(estado) {
      case 'pendiente': return 'Pendiente';
      case 'aprobado': return 'Aprobado';
      case 'pagado': return 'Pagado';
      case 'rechazado': return 'Rechazado';
      default: return estado;
    }
  };

  const totalPagado = comprobantes.filter(c => c.estado === 'pagado').reduce((a, c) => a + c.monto, 0);
  const totalPendiente = comprobantes.filter(c => c.estado === 'pendiente').reduce((a, c) => a + c.monto, 0);
  const totalAprobado = comprobantes.filter(c => c.estado === 'aprobado').reduce((a, c) => a + c.monto, 0);

  const handleFormChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const nuevo = {
      numero: form.numero.trim(),
      tipo: form.tipo,
      proveedor_id: form.proveedorId ? Number(form.proveedorId) : null,
      fecha: form.fecha || null,
      monto: Number(form.monto) || 0,
      concepto: form.concepto.trim(),
      estado: form.estado,
    };
    const { error } = await supabase.from('comprobantes').insert(nuevo);
    if (error) {
      setError('No se pudo guardar el comprobante: ' + error.message);
      setSaving(false);
      return;
    }
    setForm(emptyForm);
    setShowModal(false);
    setSaving(false);
    await cargarComprobantes();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número, proveedor o concepto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Todos los tipos</option>
            <option value="factura">Factura</option>
            <option value="recibo">Recibo</option>
            <option value="orden_compra">Orden de Compra</option>
          </select>
          <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="pagado">Pagado</option>
            <option value="rechazado">Rechazado</option>
          </select>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Agregar Comprobante
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Total Comprobantes</p>
          <p className="text-xl font-bold text-gray-800">{comprobantes.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-xs text-green-600">Pagado</p>
          <p className="text-xl font-bold text-green-800">${totalPagado.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-600">Pendiente</p>
          <p className="text-xl font-bold text-yellow-800">${totalPendiente.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-600">Aprobado</p>
          <p className="text-xl font-bold text-blue-800">${totalAprobado.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando comprobantes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">N° Comprobante</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Proveedor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Concepto</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Monto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredComprobantes.map(comp => (
                  <tr key={comp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{comp.numero}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTipoBadge(comp.tipo)}`}>{getTipoLabel(comp.tipo)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{comp.proveedorNombre}</td>
                    <td className="px-4 py-3 text-gray-700">{comp.fecha}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{comp.concepto}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">${comp.monto.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getEstadoBadge(comp.estado)}`}>{getEstadoLabel(comp.estado)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredComprobantes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No se encontraron comprobantes</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-700">Total General</span>
          </div>
          <span className="text-xl font-bold text-gray-800">
            ${filteredComprobantes.reduce((a, c) => a + c.monto, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Agregar Comprobante</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAgregar} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">N° Comprobante</label>
                  <input required value={form.numero} onChange={e => handleFormChange('numero', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="FC-0001-00012345" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                  <select value={form.tipo} onChange={e => handleFormChange('tipo', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="factura">Factura</option>
                    <option value="recibo">Recibo</option>
                    <option value="orden_compra">Orden de Compra</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor</label>
                <select required value={form.proveedorId} onChange={e => handleFormChange('proveedorId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Seleccionar proveedor...</option>
                  {proveedoresOpciones.map(op => <option key={op.id} value={op.id}>{op.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                  <input type="date" value={form.fecha} onChange={e => handleFormChange('fecha', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Monto</label>
                  <input required type="number" min="0" step="0.01" value={form.monto} onChange={e => handleFormChange('monto', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Concepto</label>
                <input value={form.concepto} onChange={e => handleFormChange('concepto', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                <select value={form.estado} onChange={e => handleFormChange('estado', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="pagado">Pagado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar Comprobante'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comprobantes;