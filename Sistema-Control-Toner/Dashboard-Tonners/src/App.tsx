import { useState } from 'react';
import { Printer, LayoutDashboard, Package, History, AlertTriangle, Settings, Menu, X, Bell, Search, ShoppingCart, Users, Monitor, Truck, Keyboard, Mouse } from 'lucide-react';
import { initialUsers, initialPrinters, initialInventory, initialMovements, initialAlerts, initialSuppliers, initialPurchases, initialEquipment, initialMonitoredPCs, ADMIN_CREDENTIALS } from './data';
import { User, Printer as PrinterType, TonerInventory, Movement, Alert, Supplier, Purchase, Equipment, MonitoredPC } from './types';
import Dashboard from './components/Dashboard';
import PrintersPage from './components/Printers';
import InventoryPage from './components/Inventory';
import MovementsPage from './components/Movements';
import AlertsPage from './components/Alerts';
import SettingsPage from './components/Settings';
import SuppliersPage from './components/Suppliers';
import PurchasesPage from './components/Purchases';
import EquipmentPage from './components/Equipment';
import UsersPage from './components/Users';
import MonitoringPage from './components/Monitoring';
import LoginPage from './components/Login';

type Page = 'dashboard' | 'printers' | 'inventory' | 'movements' | 'alerts' | 'settings' | 'suppliers' | 'purchases' | 'equipment' | 'users' | 'monitoring';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [printers, setPrinters] = useState<PrinterType[]>(initialPrinters);
  const [inventory, setInventory] = useState<TonerInventory[]>(initialInventory);
  const [movements, setMovements] = useState<Movement[]>(initialMovements);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [monitoredPCs] = useState<MonitoredPC[]>(initialMonitoredPCs);

  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;

  if (!currentUser) {
    return <LoginPage users={users} onLogin={setCurrentUser} />;
  }

  const isAdmin = currentUser.role === 'admin';

  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'operator', 'viewer'] },
    { id: 'printers' as Page, label: 'Impresoras', icon: Printer, roles: ['admin', 'operator'] },
    { id: 'inventory' as Page, label: 'Inventario', icon: Package, roles: ['admin', 'operator'] },
    { id: 'purchases' as Page, label: 'Compras', icon: ShoppingCart, roles: ['admin', 'operator'] },
    { id: 'suppliers' as Page, label: 'Proveedores', icon: Truck, roles: ['admin', 'operator'] },
    { id: 'equipment' as Page, label: 'Equipamientos', icon: Monitor, roles: ['admin', 'operator'] },
    { id: 'movements' as Page, label: 'Movimientos', icon: History, roles: ['admin', 'operator'] },
    { id: 'monitoring' as Page, label: 'Monitoreo Mesh', icon: Monitor, roles: ['admin'] },
    { id: 'alerts' as Page, label: 'Alertas', icon: AlertTriangle, roles: ['admin', 'operator', 'viewer'] },
    { id: 'users' as Page, label: 'Usuarios', icon: Users, roles: ['admin'] },
    { id: 'settings' as Page, label: 'Configuracion', icon: Settings, roles: ['admin'] },
  ].filter(item => item.roles.includes(currentUser.role));

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard printers={printers} inventory={inventory} movements={movements} alerts={alerts} equipment={equipment} monitoredPCs={monitoredPCs} />;
      case 'printers': return <PrintersPage printers={printers} setPrinters={setPrinters} />;
      case 'inventory': return <InventoryPage inventory={inventory} setInventory={setInventory} suppliers={suppliers} />;
      case 'purchases': return <PurchasesPage purchases={purchases} setPurchases={setPurchases} suppliers={suppliers} />;
      case 'suppliers': return <SuppliersPage suppliers={suppliers} setSuppliers={setSuppliers} />;
      case 'equipment': return <EquipmentPage equipment={equipment} setEquipment={setEquipment} />;
      case 'movements': return <MovementsPage movements={movements} setMovements={setMovements} />;
      case 'monitoring': return <MonitoringPage pcs={monitoredPCs} alerts={alerts} setAlerts={setAlerts} />;
      case 'alerts': return <AlertsPage alerts={alerts} setAlerts={setAlerts} />;
      case 'users': return <UsersPage users={users} setUsers={setUsers} />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard printers={printers} inventory={inventory} movements={movements} alerts={alerts} equipment={equipment} monitoredPCs={monitoredPCs} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-white">
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={(sidebarOpen ? 'w-64 ' : 'w-20 ') + (mobileMenuOpen ? 'translate-x-0 ' : '-translate-x-full lg:translate-x-0 ') + 'fixed lg:static inset-y-0 left-0 z-50 transition-all duration-300 bg-slate-800/95 backdrop-blur-xl border-r border-white/5 flex flex-col'}>
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          {sidebarOpen && <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><Printer className="w-5 h-5 text-white" /></div>
            <div><h1 className="font-bold text-sm text-white">Donnet Control</h1><p className="text-[10px] text-slate-400">Sistema IT v3.0</p></div>
          </div>}
          <button onClick={() => { setSidebarOpen(!sidebarOpen); setMobileMenuOpen(false); }} className="p-2 rounded-lg hover:bg-white/10 lg:block hidden"><Menu className="w-4 h-4" /></button>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-white/10 lg:hidden"><X className="w-4 h-4" /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button key={item.id} onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
                className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ' + (isActive ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5') + (!sidebarOpen ? ' justify-center' : '')}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
                {item.id === 'alerts' && unresolvedAlerts > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{unresolvedAlerts}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          {sidebarOpen && <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-sm font-bold">{currentUser.name[0]}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{currentUser.name}</p><p className="text-xs text-slate-400">{currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'operator' ? 'Operador' : 'Visualizador'}</p></div>
            <button onClick={() => setCurrentUser(null)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10">Salir</button>
          </div>}
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 bg-slate-800/50 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-white/10 lg:hidden"><Menu className="w-5 h-5" /></button>
            <div className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64" /></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage('alerts')} className="relative p-2 rounded-xl hover:bg-white/10"><Bell className="w-5 h-5 text-slate-400" />{unresolvedAlerts > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}</button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-xs text-slate-300">mesh.donnet.com.ar activo</span></div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6"><div className="animate-slide-in">{renderPage()}</div></main>
      </div>
    </div>
  );
}
export default App;