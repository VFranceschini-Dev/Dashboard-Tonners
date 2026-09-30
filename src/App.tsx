import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Equipamiento from './components/Equipamiento';
import Toners from './components/Toners';
import Proveedores from './components/Proveedores';
import Comprobantes from './components/Comprobantes';
import ServiciosTecnicos from './components/ServiciosTecnicos';
import Usuarios from './components/Usuarios';
import MeshMonitor from './components/MeshMonitor';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'equipos': return <Equipamiento />;
      case 'toners': return <Toners />;
      case 'proveedores': return <Proveedores />;
      case 'comprobantes': return <Comprobantes />;
      case 'servicios': return <ServiciosTecnicos />;
      case 'usuarios': return <Usuarios />;
      case 'mesh': return <MeshMonitor />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;