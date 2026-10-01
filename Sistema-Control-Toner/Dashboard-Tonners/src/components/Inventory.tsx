import { useState } from 'react';
import { TonerInventory, Supplier } from '../types';
import { Package, Edit2, Save, X, Search, AlertTriangle, DollarSign } from 'lucide-react';
interface Props { inventory: TonerInventory[]; setInventory: (i: TonerInventory[]) => void; suppliers: Supplier[]; }
export default function InventoryPage({ inventory, setInventory, suppliers }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TonerInventory>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterColor, setFilterColor] = useState('all');
  var filtered = inventory.filter(function(t) {
    var mc = filterColor === 'all' || t.color === filterColor;
    var ms = t.model.toLowerCase().includes(searchTerm.toLowerCase());
    return mc && ms;
  });
  function getColorDot(c: string) { return c === 'black' ? 'bg-gray-800 border-2 border-gray-600' : c === 'cyan' ? 'bg-cyan-400' : c === 'magenta' ? 'bg-pink-500' : 'bg-yellow-400'; }
  function getColorLabel(c: string) { return c === 'black' ? 'Negro' : c === 'cyan' ? 'Cian' : c === 'magenta' ? 'Magenta' : 'Amarillo'; }
  function startEdit(t: TonerInventory) { setEditingId(t.id); setEditForm({ model: t.model, quantity: t.quantity, minStock: t.minStock, maxStock: t.maxStock, unitCost: t.unitCost }); }
  function saveEdit() { if (editingId) { setInventory(inventory.map(function(t) { return t.id === editingId ? Object.assign({}, t, editForm) : t; })); setEditingId(null); setEditForm({}); } }
  var totalValue = inventory.reduce(function(s, t) { return s + (t.quantity * t.unitCost); }, 0);
  var lowStock = inventory.filter(function(t) { return t.quantity <= t.minStock; }).length;
  var inputCls = "w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  function getSupplierName(id: string) { var s = suppliers.find(function(s) { return s.id === id; }); return s ? s.name : 'N/A'; }
  return (<div className="space-y-6">
    <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Inventario de Toner</h1><p className="text-slate-400 text-sm mt-1">Control de stock, minimo/maximo y reabastecimiento</p></div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="glass-card p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><Package className="w-5 h-5 text-blue-400" /></div>
        <div><p className="text-xl font-bold text-white">{inventory.length}</p><p className="text-xs text-slate-400">Modelos</p></div></div>
      <div className="glass-card p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><DollarSign className="w-5 h-5 text-emerald-400" /></div>
        <div><p className="text-xl font-bold text-white">${totalValue.toLocaleString()}</p><p className="text-xs text-slate-400">Valor total</p></div></div>
      <div className={"glass-card p-4 flex items-center gap-4 " + (lowStock > 0 ? 'border-amber-500/30' : '')}><div className={"w-10 h-10 rounded-xl flex items-center justify-center " + (lowStock > 0 ? 'bg-amber-500/20' : 'bg-emerald-500/20')}><AlertTriangle className={"w-5 h-5 " + (lowStock > 0 ? 'text-amber-400' : 'text-emerald-400')} /></div>
        <div><p className={"text-xl font-bold " + (lowStock > 0 ? 'text-amber-400' : 'text-emerald-400')}>{lowStock}</p><p className="text-xs text-slate-400">Bajo stock minimo</p></div></div></div>
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Buscar modelo..." value={searchTerm} onChange={function(e) { setSearchTerm(e.target.value); }} className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" /></div>
      <div className="flex gap-2 flex-wrap">{['all', 'black', 'cyan', 'magenta', 'yellow'].map(function(c) { return (
        <button key={c} onClick={function() { setFilterColor(c); }} className={"flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all " + (filterColor === c ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10')}>
          {c !== 'all' && <span className={"w-3 h-3 rounded-full " + getColorDot(c)}></span>}{c === 'all' ? 'Todos' : getColorLabel(c)}</button>); })}</div></div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {filtered.map(function(item) { return (<div key={item.id} className={"glass-card p-5 hover:border-white/20 transition-all group " + (item.quantity <= item.minStock ? 'border-amber-500/30' : '')}>
        {editingId === item.id ? (<div className="space-y-3">
          <input type="text" value={editForm.model || ''} onChange={function(e) { setEditForm(Object.assign({}, editForm, { model: e.target.value })); }} className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={editForm.quantity || 0} onChange={function(e) { setEditForm(Object.assign({}, editForm, { quantity: parseInt(e.target.value) || 0 })); }} className={inputCls} placeholder="Cantidad" />
            <input type="number" value={editForm.unitCost || 0} onChange={function(e) { setEditForm(Object.assign({}, editForm, { unitCost: parseFloat(e.target.value) || 0 })); }} className={inputCls} placeholder="Costo" /></div>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={editForm.minStock || 0} onChange={function(e) { setEditForm(Object.assign({}, editForm, { minStock: parseInt(e.target.value) || 0 })); }} className={inputCls} placeholder="Stock Min" />
            <input type="number" value={editForm.maxStock || 0} onChange={function(e) { setEditForm(Object.assign({}, editForm, { maxStock: parseInt(e.target.value) || 0 })); }} className={inputCls} placeholder="Stock Max" /></div>
          <div className="flex gap-2"><button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30"><Save className="w-4 h-4" />Guardar</button>
            <button onClick={function() { setEditingId(null); setEditForm({}); }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-slate-400 rounded-lg text-sm hover:bg-white/20"><X className="w-4 h-4" />Cancelar</button></div></div>) : (<>
          <div className="flex items-start justify-between"><div className="flex items-center gap-3">
            <div className={"w-8 h-8 rounded-full " + getColorDot(item.color) + " flex items-center justify-center"}><span className="text-xs font-bold text-white">{item.model[0]}</span></div>
            <div><h3 className="text-sm font-semibold text-white">{item.model}</h3><p className="text-xs text-slate-400">{getColorLabel(item.color)} - Proveedor: {getSupplierName(item.supplierId)}</p></div></div>
            <div className="flex items-center gap-2">{item.quantity <= item.minStock && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 animate-pulse">Bajo!</span>}
              <button onClick={function() { startEdit(item); }} className="p-1.5 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100"><Edit2 className="w-3.5 h-3.5 text-slate-400" /></button></div></div>
          <div className="mt-4 grid grid-cols-2 gap-3"><div className="p-2 rounded-lg bg-white/5"><p className="text-lg font-bold text-white">{item.quantity}</p><p className="text-xs text-slate-400">En stock (min:{item.minStock} max:{item.maxStock})</p></div>
            <div className="p-2 rounded-lg bg-white/5"><p className="text-lg font-bold text-white">${item.unitCost}</p><p className="text-xs text-slate-400">Costo unit.</p></div></div>
          <div className="mt-3"><div className="flex items-center justify-between mb-1"><span className="text-xs text-slate-400">Nivel de stock</span><span className="text-xs text-slate-400">{item.quantity}/{item.maxStock}</span></div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden"><div className={"h-full rounded-full " + (item.quantity <= item.minStock ? 'bg-red-500' : item.quantity <= item.minStock * 1.5 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: Math.min((item.quantity / item.maxStock) * 100, 100) + '%' }} /></div></div>
          <div className="mt-3 text-xs text-slate-500">📍 {item.location}</div></>)}
      </div>); })}</div></div>);
}