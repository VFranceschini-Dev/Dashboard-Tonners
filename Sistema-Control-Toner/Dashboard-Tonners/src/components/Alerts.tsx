import { Alert } from '../types';
import { AlertTriangle, Check, Bell, Shield, Clock } from 'lucide-react';
interface Props { alerts: Alert[]; setAlerts: (a: Alert[]) => void; }
export default function AlertsPage({ alerts, setAlerts }: Props) {
  function resolveAlert(id: string) { setAlerts(alerts.map(function(a) { return a.id === id ? Object.assign({}, a, { resolved: true }) : a; })); }
  function resolveAll() { setAlerts(alerts.map(function(a) { return Object.assign({}, a, { resolved: true }); })); }
  var unresolved = alerts.filter(function(a) { return !a.resolved; });
  var resolved = alerts.filter(function(a) { return a.resolved; });
  function getSevIcon(s: string) { return s === 'high' ? <Shield className="w-5 h-5 text-red-400" /> : s === 'medium' ? <AlertTriangle className="w-5 h-5 text-amber-400" /> : <Bell className="w-5 h-5 text-blue-400" />; }
  function getSevColor(s: string) { return s === 'high' ? 'border-red-500/30 bg-red-500/5' : s === 'medium' ? 'border-amber-500/30 bg-amber-500/5' : 'border-blue-500/30 bg-blue-500/5'; }
  function getSevBadge(s: string) { return s === 'high' ? 'bg-red-500/20 text-red-400' : s === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'; }
  function getTypeLabel(t: string) { return t === 'low_stock' ? 'Stock Bajo' : t === 'maintenance_due' ? 'Mantenimiento' : t === 'toner_low' ? 'Toner Bajo' : t === 'pc_off_hours' ? 'PC Fuera Horario' : 'Revision Equipo'; }
  return (<div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Centro de Alertas</h1><p className="text-slate-400 text-sm mt-1">Notificaciones del sistema</p></div>
      {unresolved.length > 0 && <button onClick={resolveAll} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/30 border border-emerald-500/30"><Check className="w-4 h-4" />Resolver Todas</button>}</div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="glass-card p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
        <div><p className="text-xl font-bold text-white">{unresolved.filter(function(a) { return a.severity === 'high'; }).length}</p><p className="text-xs text-slate-400">Criticas</p></div></div>
      <div className="glass-card p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
        <div><p className="text-xl font-bold text-white">{unresolved.filter(function(a) { return a.severity === 'medium'; }).length}</p><p className="text-xs text-slate-400">Advertencias</p></div></div>
      <div className="glass-card p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Check className="w-5 h-5 text-emerald-400" /></div>
        <div><p className="text-xl font-bold text-white">{resolved.length}</p><p className="text-xs text-slate-400">Resueltas</p></div></div></div>
    {unresolved.length > 0 && <div><h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-blue-400" />Alertas Activas ({unresolved.length})</h2>
      <div className="space-y-3">{unresolved.map(function(alert) { return (<div key={alert.id} className={"glass-card p-5 border " + getSevColor(alert.severity) + " " + (alert.severity === 'high' ? 'alert-pulse' : '')}>
        <div className="flex items-start gap-4"><div className="mt-0.5">{getSevIcon(alert.severity)}</div>
          <div className="flex-1 min-w-0"><div className="flex items-center gap-3 flex-wrap">
            <span className={"text-xs px-2.5 py-1 rounded-full " + getSevBadge(alert.severity)}>{alert.severity === 'high' ? 'Critica' : alert.severity === 'medium' ? 'Advertencia' : 'Info'}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-400">{getTypeLabel(alert.type)}</span></div>
            <p className="text-sm font-medium text-white mt-2">{alert.message}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500"><Clock className="w-3 h-3" /><span>{alert.date}</span></div></div>
          <button onClick={function() { resolveAlert(alert.id); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/30"><Check className="w-3 h-3" />Resolver</button></div></div>); })}</div></div>}
    {resolved.length > 0 && <div><h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" />Resueltas ({resolved.length})</h2>
      <div className="space-y-3">{resolved.map(function(alert) { return (<div key={alert.id} className="glass-card p-4 opacity-60">
        <div className="flex items-start gap-4"><Check className="w-5 h-5 text-emerald-400 mt-0.5" />
          <div className="flex-1"><p className="text-sm text-slate-400 line-through">{alert.message}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500"><Clock className="w-3 h-3" /><span>{alert.date}</span><span className="text-emerald-400">• Resuelta</span></div></div></div></div>); })}</div></div>}</div>);
}