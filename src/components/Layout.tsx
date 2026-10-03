import { type ReactNode, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { type Page } from '../types';
import {
  LayoutDashboard, Printer, Package, ArrowLeftRight, BarChart3, Bell, Menu, X, LogOut,
  Monitor, Users, Building2, FileText, ChevronRight, Settings, Sun, Moon, Server
} from 'lucide-react';

const navItems: { page: Page; label: string; icon: ReactNode }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { page: 'equipments', label: 'Equipamientos', icon: <Monitor size={20} /> },
  { page: 'collaborators', label: 'Colaboradores', icon: <Users size={20} /> },
  { page: 'suppliers', label: 'Proveedores', icon: <Building2 size={20} /> },
  { page: 'vouchers', label: 'Comprobantes', icon: <FileText size={20} /> },
  { page: 'printers', label: 'Impresoras', icon: <Printer size={20} /> },
  { page: 'inventory', label: 'Inventario', icon: <Package size={20} /> },
  { page: 'movements', label: 'Movimientos', icon: <ArrowLeftRight size={20} /> },
  { page: 'reports', label: 'Reportes', icon: <BarChart3 size={20} /> },
  { page: 'mesh-test', label: 'Test MeshCentral', icon: <Server size={20} /> },
  { page: 'admin', label: 'Administración', icon: <Settings size={20} /> },
];

// ThemeToggle: botón para alternar modo claro/oscuro
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
      title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { currentPage, setCurrentPage, unreadAlerts } = useApp();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Printer size={22} className="text-blue-600" />
            <span>Control Tóner</span>
          </div>
          <button
            className="lg:hidden p-1"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => {
                setCurrentPage(item.page);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                currentPage === item.page
                  ? 'bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {currentPage === item.page && (
                <ChevronRight size={16} className="ml-auto" />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold capitalize">
              {navItems.find((n) => n.page === currentPage)?.label ?? 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              onClick={() => setCurrentPage('reports')}
              title="Alertas"
            >
              <Bell size={18} />
              {unreadAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadAlerts}
                </span>
              )}
            </button>
            <div className="hidden sm:flex flex-col items-end leading-tight px-2">
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Página */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fadeIn">{children}</main>
      </div>
    </div>
  );
}