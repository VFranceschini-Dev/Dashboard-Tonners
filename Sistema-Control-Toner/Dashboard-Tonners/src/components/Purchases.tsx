import { Purchase, Supplier } from '../types';
import { ShoppingCart, Eye } from 'lucide-react';
interface Props { purchases: Purchase[]; setPurchases: (p: Purchase[]) => void; suppliers: Supplier[]; }
export default function PurchasesPage({ purchases, suppliers }: Props) {
  function getSupplierName(id: string) { var s = suppliers.find(function(s) { return s.id === id; }); return s ? s.name : 'N/A'; }
  function getStatusColor(s: string) { return s === 'received' ? 'bg-emerald-500/20 text-emerald-400' : s === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'; }
  function getStatusLabel(s: string) { return s === 'received' ? 'Recibido' : s === 'pending' ? 'Pendiente' : 'Cancelado'; }
  return (<div className="space-y-6">
    <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Compras</h1><p className="text-slate-400 text-sm mt-1">Historial de compras de insumos</p></div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="glass-card p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-blue-400" /></div>
        <div><p className="text-xl font-bold text-white">{purchases.length}</p><p className="text-xs text-slate-400">Total compras</p></div></div>
      <div className="glass-card p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-emerald-400" /></div>
        <div><p className="text-xl font-bold text-white">${purchases.reduce(function(s, p) { return s + p.total; }, 0).toLocaleString()}</p><p className="text-xs text-slate-400">Monto total</p></div></div>
      <div className="glass-card p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-amber-400" /></div>
        <div><p className="text-xl font-bold text-white">{purchases.filter(function(p) { return p.status === 'pending'; }).length}</p><p className="text-xs text-slate-400">Pendientes</p></div></div></div>
    <div className="space-y-4">{purchases.map(function(purchase) { return (<div key={purchase.id} className="glass-card p-5 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div><div className="flex items-center gap-3"><span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-400">#{purchase.id}</span>
          <span className={"text-xs px-2.5 py-1 rounded-full " + getStatusColor(purchase.status)}>{getStatusLabel(purchase.status)}</span></div>
          <h3 className="text-sm font-semibold text-white mt-2">Proveedor: {getSupplierName(purchase.supplierId)}</h3>
          <p className="text-xs text-slate-400 mt-1">📅 {purchase.date}</p></div>
        <div className="text-right"><p className="text-xl font-bold text-emerald-400">${purchase.total.toLocaleString()}</p><p className="text-xs text-slate-400">{purchase.items.length} items</p></div></div>
      {purchase.notes && <p className="text-xs text-slate-500 mt-3 italic">"{purchase.notes}"</p>}
      <div className="mt-4 border-t border-white/5 pt-3"><p className="text-xs font-medium text-slate-400 mb-2">Detalle de items:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{purchase.items.map(function(item, i) { return (<div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs">
          <span className="text-white">{item.tonerModel}</span><span className="text-slate-400">x{item.quantity} - ${item.total}</span></div>); })}</div></div></div>); })}</div></div>);
}