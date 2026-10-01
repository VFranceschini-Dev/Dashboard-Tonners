import { useState } from 'react';
import { Movement } from '../types';
import { Filter, Search } from 'lucide-react';
interface Props { movements: Movement[]; setMovements: (m: Movement[]) => void; }
export default function MovementsPage({ movements }: Props) {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  var filtered = movements.filter(function(m) {
    var mt = filterType === 'all' || m.type === filterType;
    var ms = m.tonerModel.toLowerCase().includes(searchTerm.toLowerCase()) || m.user.toLowerCase().includes(searchTerm.toLowerCase());
    return mt && ms;
  });
  function getIcon(t: string) { return t === 'install' ? '🟢' : t === 'remove' ? '🔴' : t === 'restock' ? '🔵' : '⚫'; }
  function getLabel(t: string) { return t === 'install' ? 'Instalacion' : t === 'remove' ? 'Retiro' : t === 'restock' ? 'Reabastecimiento' : 'Disposicion'; }
  function getColor(t: string) { return t === 'install' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : t === 'remove' ? 'bg-red-500/20 text-red-400 border-red-500/30' : t === 'restock' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'; }
  return (<div className="space-y-6">
    <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Historial de Movimientos</h1><p className="text-slate-400 text-sm mt-1">Registro de operaciones</p></div>
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={function(e) { setSearchTerm(e.target.value); }} className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" /></div></div>
    <div className="flex gap-2 flex-wrap">{[{ k: 'all', l: 'Todos' }, { k: 'install', l: 'Instalaciones' }, { k: 'remove', l: 'Retiros' }, { k: 'restock', l: 'Reabastecimientos' }, { k: 'dispose', l: 'Disposiciones' }].map(function(tab) { return (
      <button key={tab.k} onClick={function() { setFilterType(tab.k); }} className={"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all " + (filterType === tab.k ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10')}>
        <Filter className="w-3 h-3" />{tab.l}</button>); })}</div>
    <div className="space-y-3">{filtered.map(function(m) { return (<div key={m.id} className="glass-card p-4 hover:border-white/20 transition-all">
      <div className="flex items-start gap-4"><div className="flex flex-col items-center"><span className="text-2xl">{getIcon(m.type)}</span></div>
        <div className="flex-1 min-w-0"><div className="flex items-center gap-3 flex-wrap">
          <span className={"text-xs px-2.5 py-1 rounded-full border " + getColor(m.type)}>{getLabel(m.type)}</span>
          <span className="text-sm font-semibold text-white">{m.tonerModel}</span><span className="text-xs text-slate-500">x{m.quantity}</span></div>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">{m.printerName !== '-' && <span>🖨️ {m.printerName}</span>}<span>👤 {m.user}</span><span>📅 {m.date}</span></div>
          {m.notes && <p className="text-xs text-slate-500 mt-2 italic">"{m.notes}"</p>}</div></div></div>); })}</div></div>);
}