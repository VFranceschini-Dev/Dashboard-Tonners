import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Printer, Package, ClipboardList, Wrench, 
  Users, Building2, FileText, LogOut, Menu, X, ChevronDown, BookOpen, HelpCircle
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'operador', 'consulta'] },
  { id: 'toners', label: 'Toners', icon: Package, roles: ['admin', 'operador', 'consulta'] },
  { id: 'impresoras', label: 'Impresoras', icon: Printer, roles: ['admin', 'operador', 'consulta'] },
  { id: 'asignaciones', label: 'Asignaciones', icon: ClipboardList, roles: ['admin', 'operador'] },
  { id: 'servicios', label: 'Servicios Técnicos', icon: Wrench, roles: ['admin', 'operador', 'consulta'] },
  { id: 'personal', label: 'Personal', icon: Users, roles: ['admin', 'operador'] },
  { id: 'proveedores', label: 'Proveedores', icon: Building2, roles: ['admin', 'operador', 'consulta'] },
  { id: 'comprobantes', label: 'Comprobantes', icon: FileText, roles: ['admin', 'operador'] },
  { id: 'guia', label: 'Guía de Implementación', icon: BookOpen, roles: ['admin', 'operador', 'consulta'] },
  { id: 'tutorial', label: '¿Cómo ejecutar?', icon: HelpCircle, roles: ['admin', 'operador', 'consulta'] },
];

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const filteredMenu = menuItems.filter(item => 
    user && item.roles.includes(user.rol)
  );

  const getRoleBadge = (rol: string) => {
    switch(rol) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'operador': return 'bg-blue-100 text-blue-700';
      case 'consulta': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800 text-sm">Donnet S.A.</h1>
                <p className="text-xs text-gray-500">Gestión de Toners</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <ul className="space-y-1">
              {filteredMenu.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === item.id 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User info */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-700">{user?.nombre.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.nombre}</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${getRoleBadge(user?.rol || '')}`}>
                  {user?.rol}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {menuItems.find(m => m.id === currentPage)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="relative">
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">{user?.nombre.charAt(0)}</span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.nombre}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">{user?.nombre}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
