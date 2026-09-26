import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Toners from './components/Toners';
import Impresoras from './components/Impresoras';
import Asignaciones from './components/Asignaciones';
import ServiciosTecnicos from './components/ServiciosTecnicos';
import Personal from './components/Personal';
import Proveedores from './components/Proveedores';
import Comprobantes from './components/Comprobantes';
import GuiaImplementacion from './components/GuiaImplementacion';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'toners': return <Toners />;
      case 'impresoras': return <Impresoras />;
      case 'asignaciones': return <Asignaciones />;
      case 'servicios': return <ServiciosTecnicos />;
      case 'personal': return <Personal />;
      case 'proveedores': return <Proveedores />;
      case 'comprobantes': return <Comprobantes />;
      case 'guia': return <GuiaImplementacion />;
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
