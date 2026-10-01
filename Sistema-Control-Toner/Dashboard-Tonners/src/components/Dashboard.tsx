import { Printer, TonerInventory, Movement, Alert, Equipment, MonitoredPC } from '../types';
import { Printer as PrinterIcon, Package, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, TrendingUp, Monitor, ShoppingCart, Wifi } from 'lucide-react';
import meshCentralService, { MeshConnectionState } from '../services/meshcentral';
import { useState, useEffect } from 'react';

interface Props { printers: Printer[]; inventory: TonerInventory[]; movements: Movement[]; alerts: Alert[]; equipment: Equipment[]; monitoredPCs: MonitoredPC[]; }

export default function Dashboard({ printers, inventory, movements, alerts, equipment, monitoredPCs }: Props) {
  const [meshState, setMeshState] = useState<MeshConnectionState>(meshCentralService.getState());

  useEffect(function() {
    var unsub = meshCentralService.onStateChange(function(state) { setMeshState(state); });
    return function() { unsub(); };
  }, []);

  const activePrinters = printers.filter(p => p.status === 'active').length;
  const totalToner = inventory.reduce((s, t) => s + t.quantity, 0);
  const lowStock = inventory.filter(t => t.quantity <= t.minStock).length;
  const unresolved = alerts.filter(a => !a.resolved).length;
  const totalValue = inventory.reduce((s, t) => s + (t.quantity * t.unitCost), 0);
  const pcsOffHours = monitoredPCs.filter(p => p.status === 'off_hours').length;
  const activeEquipment = equipment.filter(e => e.status === 'active').length;

  const stats = [
    { label: 'Impresoras Activas', value: activePrinters + '/' + printers.length, icon: PrinterIcon, color: 'from-blue-500 to-blue-600', change: 'Operativas', trend: 'up' as const },
    { label: 'Stock Toner', value: totalToner, icon: Package, color: 'from-emerald-500 to-emerald-600', change: lowStock + ' bajo minimo', trend: lowStock > 0 ? 'down' as const : 'up' as const },
    { label: 'Equipamientos', value: activeEquipment, icon: Monitor, color: 'from-purple-500 to-purple-600', change: equipment.length + ' total', trend: 'up' as const },
    { label: 'Alertas Activas', value: unresolved, icon: AlertTriangle, color: 'from-amber-500 to-orange-500', change: unresolved > 0 ? 'Requiere atencion' : 'Todo en orden', trend: unresolved > 0 ? 'down' as const : 'up' as const },
    { label: 'PCs Fuera Horario', value: pcsOffHours, icon: Monitor, color: 'from-red-500 to-red-600', change: 'Monitoreo mesh activo', trend: pcsOffHours > 0 ? 'down' as const : 'up' as const },
    { label: 'Valor Inventario', value: '$' + totalValue.toLocaleString(), icon: ShoppingCart, color: 'from-cyan-500 to-cyan-600', change: 'Toner en stock', trend: 'up' as const },
  ];

  function getTonerColor(l: number) { return l <= 20 ? 'bg-red-500' : l <= 40 ? 'bg-amber-500' : l <= 60 ? 'bg-yellow-400' : 'bg-emerald-500'; }
  function getMovIcon(t: string) { return t === 'install' ? '🟢' : t === 'remove' ? '🔴' : t === 'restock' ? '🔵' : '⚫'; }
  function getMovLabel(t: string) { return t === 'install' ? 'Instalacion' : t === 'remove' ? 'Retiro' : t === 'restock' ? 'Reabastecimiento' : 'Disposicion'; }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1><p className="text-slate-400 text-sm mt-1">Sistema de Control de Toner y Equipamientos - Donnet</p></div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10"><span className="text-sm text-slate-400">Valor inventario:</span><span className="text-lg font-bold text-emerald-400">${totalValue.toLocaleString()}</span></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(function(stat, i) {
          var Icon = stat.icon; var trendUp = stat.trend === 'up';
          return (<div key={i} className="glass-card p-5 hover:border-white/20 transition-all group">
            <div className="flex items-start justify-between"><div className={"w-12 h-12 rounded-xl bg-gradient-to-br " + stat.color + " flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"}><Icon className="w-6 h-6 text-white" /></div>
              <div className={"flex items-center gap-1 text-xs font-medium " + (trendUp ? 'text-emerald-400' : 'text-amber-400')}>{trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}</div></div>
            <div className="mt-4"><p className="text-2xl font-bold text-white">{stat.value}</p><p className="text-sm text-slate-400 mt-1">{stat.label}</p></div>
            <p className={"text-xs mt-2 " + (trendUp ? 'text-emerald-400/70' : 'text-amber-400/70')}>{stat.change}</p></div>);
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold text-white">Nivel de Toner por Impresora</h2><span className="text-xs text-slate-400 bg-white/5 px-3 py-1 rounded-full">En tiempo real</span></div>
          <div className="space-y-4">{printers.map(function(printer) {
            return (<div key={printer.id} className="flex items-center gap-4"><div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-white truncate">{printer.name}</span>
                <span className={"text-sm font-bold " + (printer.tonerLevel <= 20 ? 'text-red-400' : printer.tonerLevel <= 40 ? 'text-amber-400' : 'text-emerald-400')}>{printer.tonerLevel}%</span></div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden"><div className={"toner-bar h-full rounded-full " + getTonerColor(printer.tonerLevel)} style={{ width: printer.tonerLevel + '%' }} /></div>
              <div className="flex items-center justify-between mt-1"><span className="text-xs text-slate-500">{printer.department}</span>
                <span className={"text-xs px-2 py-0.5 rounded-full " + (printer.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : printer.status === 'maintenance' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400')}>{printer.status === 'active' ? 'Activa' : printer.status === 'maintenance' ? 'Mantenimiento' : 'Inactiva'}</span></div></div></div>);
          })}</div>
        </div>
        <div className="glass-card p-6"><div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold text-white">Ultimos Movimientos</h2><TrendingUp className="w-5 h-5 text-slate-400" /></div>
          <div className="space-y-3">{movements.slice(0, 6).map(function(m) {
            return (<div key={m.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <span className="text-lg">{getMovIcon(m.type)}</span><div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{getMovLabel(m.type)}</p>
                <p className="text-xs text-slate-400 truncate">{m.tonerModel} - {m.printerName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.date} - {m.user}</p></div></div>);
          })}</div></div>
      </div>

      {/* Estado MeshCentral - Solo datos, sin iframe */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + (meshState.connected ? 'bg-emerald-500/20' : 'bg-slate-500/20')}>
              <Wifi className={"w-5 h-5 " + (meshState.connected ? 'text-emerald-400' : 'text-slate-400')} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Estado MeshCentral</h2>
              <p className="text-xs text-slate-400">mesh.donnet.com.ar - WebSocket</p>
            </div>
          </div>
          <div className={"flex items-center gap-2 px-3 py-1.5 rounded-xl border " + (meshState.connected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20')}>
            <div className={"w-2 h-2 rounded-full " + (meshState.connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400')} />
            <span className={"text-sm " + (meshState.connected ? 'text-emerald-400' : 'text-red-400')}>{meshState.connected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-2xl font-bold text-white">{meshState.nodeCount || monitoredPCs.length}</p>
            <p className="text-xs text-slate-400 mt-1">Equipos monitoreados</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-2xl font-bold text-emerald-400">{monitoredPCs.filter(function(p){return p.status==='online'}).length}</p>
            <p className="text-xs text-slate-400 mt-1">En linea</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-2xl font-bold text-amber-400">{pcsOffHours}</p>
            <p className="text-xs text-slate-400 mt-1">Fuera de horario</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">Ver detalle en la seccion Monitoreo Mesh</p>
      </div>

      {pcsOffHours > 0 && <div className="glass-card p-6 border-red-500/20">
        <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center"><Monitor className="w-5 h-5 text-red-400" /></div>
          <div><h2 className="text-lg font-semibold text-white">PCs Encendidas Fuera de Horario</h2><p className="text-sm text-slate-400">Detectado via mesh.donnet.com.ar</p></div></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{monitoredPCs.filter(function(p){return p.status==='off_hours'}).map(function(pc){return(<div key={pc.id}className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"><p className="text-sm font-bold text-white">{pc.hostname}</p><p className="text-xs text-slate-400 mt-1">{pc.department} - {pc.user}</p><p className="text-xs text-red-400 mt-1">Ultima actividad: {pc.lastSeen}</p></div>)})}</div></div>}

      {lowStock > 0 && <div className="glass-card p-6 border-amber-500/20">
        <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
          <div><h2 className="text-lg font-semibold text-white">Alertas de Stock Bajo</h2><p className="text-sm text-slate-400">Items que necesitan reabastecimiento</p></div></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{inventory.filter(t => t.quantity <= t.minStock).map(item => (
          <div key={item.id} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center justify-between"><span className="text-sm font-bold text-white">{item.model}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{item.quantity}/{item.minStock} min.</span></div>
            <p className="text-xs text-slate-400 mt-1">Color: {item.color === 'black' ? 'Negro' : item.color}</p>
            <p className="text-xs text-slate-500 mt-1">{item.location}</p></div>))}</div></div>}
    </div>
  );
}