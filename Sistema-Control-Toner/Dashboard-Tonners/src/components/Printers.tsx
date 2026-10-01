import { useState } from 'react';
import { Printer as PrinterType } from '../types';
import { Printer, MapPin, Hash, Calendar, Edit2, Save, X, Search } from 'lucide-react';
interface Props { printers: PrinterType[]; setPrinters: (p: PrinterType[]) => void; }
export default function PrintersPage({ printers, setPrinters }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PrinterType>>({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  var filtered = printers.filter(function(p) {
    var ms = filterStatus === 'all' || p.status === filterStatus;
    var ms2 = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.department.toLowerCase().includes(searchTerm.toLowerCase());
    return ms && ms2;
  });
  function startEdit(p: PrinterType) { setEditingId(p.id); setEditForm({ name: p.name, location: p.location, department: p.department, status: p.status }); }
  function saveEdit() { if (editingId) { setPrinters(printers.map(function(p) { return p.id === editingId ? Object.assign({}, p, editForm) : p; })); setEditingId(null); setEditForm({}); } }
  function getTonerColor(l: number) { return l <= 20 ? 'bg-red-500' : l <= 40 ? 'bg-amber-500' : l <= 60 ? 'bg-yellow-400' : 'bg-emerald-500'; }
  var inputCls = "w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  return (<div className="space-y-6">
    <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Impresoras</h1><p className="text-slate-400 text-sm mt-1">Gestion de impresoras y niveles de toner</p></div>
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Buscar impresora..." value={searchTerm} onChange={function(e) { setSearchTerm(e.target.value); }} className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" /></div>
      <div className="flex gap-2">{['all', 'active', 'maintenance', 'inactive'].map(function(s) { return (
        <button key={s} onClick={function() { setFilterStatus(s); }} className={"px-4 py-2 rounded-xl text-sm font-medium transition-all " + (filterStatus === s ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10')}>
          {s === 'all' ? 'Todas' : s === 'active' ? 'Activas' : s === 'maintenance' ? 'Mant.' : 'Inactivas'}</button>); })}</div></div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {filtered.map(function(printer) { return (<div key={printer.id} className="glass-card p-5 hover:border-white/20 transition-all group">
        {editingId === printer.id ? (<div className="space-y-3">
          <input type="text" value={editForm.name || ''} onChange={function(e) { setEditForm(Object.assign({}, editForm, { name: e.target.value })); }} className={inputCls} placeholder="Nombre" />
          <input type="text" value={editForm.location || ''} onChange={function(e) { setEditForm(Object.assign({}, editForm, { location: e.target.value })); }} className={inputCls} placeholder="Ubicacion" />
          <select value={editForm.status || 'active'} onChange={function(e) { setEditForm(Object.assign({}, editForm, { status: e.target.value as any })); }} className={inputCls}>
            <option value="active" className="bg-slate-800">Activa</option><option value="maintenance" className="bg-slate-800">Mantenimiento</option><option value="inactive" className="bg-slate-800">Inactiva</option></select>
          <div className="flex gap-2"><button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30"><Save className="w-4 h-4" />Guardar</button>
            <button onClick={function() { setEditingId(null); setEditForm({}); }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-slate-400 rounded-lg text-sm hover:bg-white/20"><X className="w-4 h-4" />Cancelar</button></div></div>) : (<>
          <div className="flex items-start justify-between"><div className="flex items-center gap-3">
            <div className={"w-12 h-12 rounded-xl flex items-center justify-center " + (printer.status === 'active' ? 'bg-emerald-500/20' : printer.status === 'maintenance' ? 'bg-amber-500/20' : 'bg-red-500/20')}>
              <Printer className={"w-6 h-6 " + (printer.status === 'active' ? 'text-emerald-400' : printer.status === 'maintenance' ? 'text-amber-400' : 'text-red-400')} /></div>
            <div><h3 className="text-sm font-semibold text-white">{printer.name}</h3><p className="text-xs text-slate-400">{printer.department}</p></div></div>
            <button onClick={function() { startEdit(printer); }} className="p-2 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100"><Edit2 className="w-4 h-4 text-slate-400" /></button></div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400"><MapPin className="w-3 h-3" /><span>{printer.location}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-400"><Hash className="w-3 h-3" /><span>Toner: {printer.tonerModel}</span></div>
            <div className="flex items-center gap-2 text-xs text-slate-400"><Calendar className="w-3 h-3" /><span>Ult. mant.: {printer.lastMaintenance}</span></div></div>
          <div className="mt-4"><div className="flex items-center justify-between mb-1"><span className="text-xs text-slate-400">Nivel de toner</span>
            <span className={"text-xs font-bold " + (printer.tonerLevel <= 20 ? 'text-red-400' : printer.tonerLevel <= 40 ? 'text-amber-400' : 'text-emerald-400')}>{printer.tonerLevel}%</span></div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden"><div className={"toner-bar h-full rounded-full " + getTonerColor(printer.tonerLevel)} style={{ width: printer.tonerLevel + '%' }} /></div></div>
          <div className="mt-3 flex items-center justify-between"><span className="text-xs text-slate-500">{printer.pagesPrinted.toLocaleString()} pags.</span>
            <span className={"text-xs px-2 py-0.5 rounded-full " + (printer.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : printer.status === 'maintenance' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400')}>
              {printer.status === 'active' ? '● Activa' : printer.status === 'maintenance' ? '● Mant.' : '● Inactiva'}</span></div></>)}
      </div>); })}</div></div>);
}