import { useState } from 'react';
import { Supplier } from '../types';
import { Truck, Plus, Edit2, Save, X, Search } from 'lucide-react';
interface Props { suppliers: Supplier[]; setSuppliers: (s: Supplier[]) => void; }
export default function SuppliersPage({ suppliers, setSuppliers }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Supplier>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Supplier>>({ name: '', contact: '', email: '', phone: '', address: '' });
  var filtered = suppliers.filter(function(s) { return s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.contact.toLowerCase().includes(searchTerm.toLowerCase()); });
  function startEdit(s: Supplier) { setEditingId(s.id); setEditForm({ name: s.name, contact: s.contact, email: s.email, phone: s.phone, address: s.address }); }
  function saveEdit() { if (editingId) { setSuppliers(suppliers.map(function(s) { return s.id === editingId ? Object.assign({}, s, editForm) : s; })); setEditingId(null); setEditForm({}); } }
  function addNew() { if (newItem.name) { var s: Supplier = { id: Date.now().toString(), name: newItem.name || '', contact: newItem.contact || '', email: newItem.email || '', phone: newItem.phone || '', address: newItem.address || '', active: true }; setSuppliers([...suppliers, s]); setShowAdd(false); setNewItem({ name: '', contact: '', email: '', phone: '', address: '' }); } }
  var inputCls = "w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  return (<div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Proveedores</h1><p className="text-slate-400 text-sm mt-1">Gestion de proveedores de insumos</p></div>
      <button onClick={function() { setShowAdd(!showAdd); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-500/30 border border-blue-500/30"><Plus className="w-4 h-4" />Nuevo Proveedor</button></div>
    {showAdd && <div className="glass-card p-6 border-blue-500/20 animate-slide-in"><h3 className="text-lg font-semibold text-white mb-4">Nuevo Proveedor</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" placeholder="Nombre" value={newItem.name} onChange={function(e) { setNewItem(Object.assign({}, newItem, { name: e.target.value })); }} className={inputCls} />
        <input type="text" placeholder="Contacto" value={newItem.contact} onChange={function(e) { setNewItem(Object.assign({}, newItem, { contact: e.target.value })); }} className={inputCls} />
        <input type="email" placeholder="Email" value={newItem.email} onChange={function(e) { setNewItem(Object.assign({}, newItem, { email: e.target.value })); }} className={inputCls} />
        <input type="text" placeholder="Telefono" value={newItem.phone} onChange={function(e) { setNewItem(Object.assign({}, newItem, { phone: e.target.value })); }} className={inputCls} />
        <input type="text" placeholder="Direccion" value={newItem.address} onChange={function(e) { setNewItem(Object.assign({}, newItem, { address: e.target.value })); }} className={inputCls} /></div>
      <div className="flex gap-3 mt-4"><button onClick={addNew} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/30"><Save className="w-4 h-4" />Guardar</button>
        <button onClick={function() { setShowAdd(false); }} className="flex items-center gap-2 px-4 py-2 bg-white/10 text-slate-400 rounded-xl text-sm font-medium hover:bg-white/20"><X className="w-4 h-4" />Cancelar</button></div></div>}
    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input type="text" placeholder="Buscar proveedor..." value={searchTerm} onChange={function(e) { setSearchTerm(e.target.value); }} className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" /></div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {filtered.map(function(supplier) { return (<div key={supplier.id} className="glass-card p-5 hover:border-white/20 transition-all group">
        {editingId === supplier.id ? (<div className="space-y-3">
          <input type="text" value={editForm.name || ''} onChange={function(e) { setEditForm(Object.assign({}, editForm, { name: e.target.value })); }} className={inputCls} placeholder="Nombre" />
          <input type="text" value={editForm.contact || ''} onChange={function(e) { setEditForm(Object.assign({}, editForm, { contact: e.target.value })); }} className={inputCls} placeholder="Contacto" />
          <input type="text" value={editForm.email || ''} onChange={function(e) { setEditForm(Object.assign({}, editForm, { email: e.target.value })); }} className={inputCls} placeholder="Email" />
          <input type="text" value={editForm.phone || ''} onChange={function(e) { setEditForm(Object.assign({}, editForm, { phone: e.target.value })); }} className={inputCls} placeholder="Telefono" />
          <div className="flex gap-2"><button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30"><Save className="w-4 h-4" />Guardar</button>
            <button onClick={function() { setEditingId(null); setEditForm({}); }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-slate-400 rounded-lg text-sm hover:bg-white/20"><X className="w-4 h-4" />Cancelar</button></div></div>) : (<>
          <div className="flex items-start justify-between"><div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center"><Truck className="w-6 h-6 text-blue-400" /></div>
            <div><h3 className="text-sm font-semibold text-white">{supplier.name}</h3><p className="text-xs text-slate-400">{supplier.contact}</p></div></div>
            <button onClick={function() { startEdit(supplier); }} className="p-2 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100"><Edit2 className="w-4 h-4 text-slate-400" /></button></div>
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-400">📧 {supplier.email}</p>
            <p className="text-xs text-slate-400">📞 {supplier.phone}</p>
            <p className="text-xs text-slate-400">📍 {supplier.address}</p></div>
          <div className="mt-3"><span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">● Activo</span></div></>)}
      </div>); })}</div></div>);
}