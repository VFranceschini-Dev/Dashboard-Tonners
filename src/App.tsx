import { lazy, Suspense, type ComponentType } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Code-splitting: cada página se carga bajo demanda (dynamic import)
const Printers = lazy(() => import('./components/Printers'));
const Inventory = lazy(() => import('./components/Inventory'));
const Movements = lazy(() => import('./components/Movements'));
const Reports = lazy(() => import('./components/Reports'));
const Equipments = lazy(() => import('./components/Equipments'));
const Suppliers = lazy(() => import('./components/Suppliers'));
const Collaborators = lazy(() => import('./components/Collaborators'));
const Vouchers = lazy(() => import('./components/Vouchers'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const MeshTestConnection = lazy(() => import('./components/MeshTestConnection'));

const pages: Record<string, ComponentType> = {
  dashboard: Dashboard,
  printers: Printers,
  inventory: Inventory,
  movements: Movements,
  reports: Reports,
  equipments: Equipments,
  suppliers: Suppliers,
  collaborators: Collaborators,
  vouchers: Vouchers,
  admin: AdminPanel,
  'mesh-test': MeshTestConnection,
};

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
}

function PageRouter() {
  const { currentPage } = useApp();
  const Page = pages[currentPage] ?? Dashboard;

  return (
    <Suspense fallback={<PageLoader />}>
      <Page />
    </Suspense>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <AppProvider>
      <Layout>
        <PageRouter />
      </Layout>
    </AppProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}