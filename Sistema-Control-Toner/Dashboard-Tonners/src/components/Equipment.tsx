import { useState } from 'react';
import { Equipment } from '../types';
import { Monitor, Printer, Mouse, Keyboard, Edit2, Save, X, Search } from 'lucide-react';
interface Props { equipment: Equipment[]; setEquipment: (e: Equipment[]) => void; }
export default function EquipmentPage({ equipment, setEquipment }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Equipment>>({});
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  var filtered = equipment.filter(function(e) {
    var mt = filterType === 'all' || e.type === filterType;
    var ms = e.brand.toLowerCase().includes(searchTerm.toLowerCase()) || e.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) || e.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return mt && ms;
  });
  function getTypeIcon(t: string) { return t === 'computer' ? '💻' : t === 'printer' ? '🖨️' : t === 'mouse' ? '🖱️' : t === 'keyboard' ? '⌨️' : t === 'monitor' ? '🖥️' : '📦'; }
  function getTypeLabel(t: string) { return t === 'computer' ? 'Computadora' : t === 'printer' ? 'Impresora' : t === 'mouse' ? 'Mouse' : t === 'keyboard' ? 'Teclado' : t === 'monitor' ? 'Monitor' : 'Otro'; }
  function startEdit(e: Equipment) { setEditingId(e.id); setEditForm({ assignedTo: e.assignedTo, department: e.department, status: e.status, notes: e.notes }); }
  function saveEdit() { if (editingId) { setEquipment(equipment.map(function(e) { return e.id === editingId ? Object.assign({}, e, editForm) : e; })); setEditingId(null); setEditForm({}); } }
  var inputCls = "w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  return (<div className="space-y-6">
    <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Equipamientos</h1><p className="text-slate-400 text-sm mt-1">Asignacion de impresoras, computadoras, mouse, teclados</p></div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">{['all', 'computer', 'printer', 'mouse', 'keyboard', 'monitor'].map(function(t) { return (
      <button key={t} onClick={function() { setFilterType(t); }} className={"p-3 rounded-xl text-center transition-all " + (filterType === t ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white/5 border border-white/10 hover:bg-white/10')}>
        <span className="text-2xl">{t === 'all' ? '📦' : getTypeIcon(t)}</span><p className={"text-xs mt-1 " + (filterType === t ? 'text-blue-400' : 'text-slate-400')}>{t === 'all' ? 'Todos' : getTypeLabel(t)}</p></button>); })}</div>
    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input type="text" placeholder="Buscar por marca, usuario, serial..." value={searchTerm} onChange={function(e) { setSearchTerm(e.target.value); }} className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" /></div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {filtered.map(function(item) { return (<div key={item.id} className="glass-card p-5 hover:border-white/20 transition-all group">
        {editingId === item.id ? (<div className="space-y-3">
          <input type="text" value={editForm.assignedTo || ''} onChange={function(e) { setEditForm(Object.assign({}, editForm, { assignedTo: e.target.value })); }} className={inputCls} placeholder="Asignado a" />
          <input type="text" value={editForm.department || ''} onChange={function(e) { setEditForm(Object.assign({}, editForm, { department: e.target.value })); }} className={inputCls} placeholder="Departamento" />
          <select value={editForm.status || 'active'} onChange={function(e) { setEditForm(Object.assign({}, editForm, { status: e.target.value as any })); }} className={inputCls}>
            <option value="active" className="bg-slate-800">Activo</option><option value="maintenance" className="bg-slate-800">Mantenimiento</option><option value="retired" className="bg-slate-800">Retirado</option></select>
          <div className="flex gap-2"><button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30"><Save className="w-4 h-4" />Guardar</button>
            <button onClick={function() { setEditingId(null); setEditForm({}); }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-slate-400 rounded-lg text-sm hover:bg-white/20"><X className="w-4 h-4" />Cancelar</button></div></div>) : (<>
          <div className="flex items-start justify-between"><div className="flex items-center gap-3">
            <span className="text-3xl">{getTypeIcon(item.type)}</span>
            <div><h3 className="text-sm font-semibold text-white">{item.brand} {item.model}</h3><p className="text-xs text-slate-400">S/N: {item.serialNumber}</p></div></div>
            <button onClick={function() { startEdit(item); }} className="p-2 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100"><Edit2 className="w-4 h-4 text-slate-400" /></button></div>
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-400">👤 Asignado a: <span className="text-white">{item.assignedTo}</span></p>
            <p className="text-xs text-slate-400">🏢 Departamento: <span className="text-white">{item.department}</span></p>
            <p className="text-xs text-slate-400">📅 Compra: {item.purchaseDate}</p>
            <p className="text-xs text-slate-400">🔧 Ultima revision: {item.lastRevision}</p></div>
          <div className="mt-3"><span className={"text-xs px-2 py-0.5 rounded-full " + (item.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : item.status === 'maintenance' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400')}>
            {item.status === 'active' ? '● Activo' : item.status === 'maintenance' ? '● Mantenimiento' : '● Retirado'}</span></div></>)}
      </div>); })}</div></div>);
}