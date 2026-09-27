import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Shield, Key, RefreshCw } from 'lucide-react';

export const Usuarios: React.FC = () => {
  const [listaUsuarios, setListaUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Estados para modales
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null);
  const [nuevoRol, setNuevoRol] = useState('');
  const [nuevaClave, setNuevaClave] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('perfiles_usuarios')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (!error && data) {
      setListaUsuarios(data);
    } else {
      mostrarMensaje('Error al cargar la lista de usuarios desde la base de datos', 'error');
    }
    setLoading(false);
  };

  const mostrarMensaje = (texto: string, tipo: 'success' | 'error') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  // 1. Modificar Rol / Permisos en la Base de Datos
  const guardarPermisos = async (id: string) => {
    const { error } = await supabase
      .from('perfiles_usuarios')
      .update({ rol: nuevoRol })
      .eq('id', id);

    if (!error) {
      mostrarMensaje('Permisos actualizados correctamente en la base de datos', 'success');
      setUsuarioSeleccionado(null);
      cargarUsuarios();
    } else {
      mostrarMensaje('No se pudieron actualizar los permisos', 'error');
    }
  };

  // 2. Modificar Clave (Usa el servicio Auth de Supabase)
  const guardarNuevaClave = async () => {
    if (nuevaClave.length < 6) {
      mostrarMensaje('La clave debe tener al menos 6 caracteres', 'error');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: nuevaClave
    });

    if (!error) {
      mostrarMensaje('Contraseña administrativa actualizada con éxito', 'success');
      setNuevaClave('');
      setUsuarioSeleccionado(null);
    } else {
      mostrarMensaje('Error: ' + error.message, 'error');
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Cargando usuarios desde Supabase...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Control de Usuarios</h2>
          <p className="text-sm text-gray-500">Administra los permisos de acceso y contraseñas de Donnet S.A.</p>
        </div>
        <button 
          onClick={cargarUsuarios}
          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Actualizar Lista
        </button>
      </div>

      {mensaje.texto && (
        <div className={`p-4 rounded-lg border text-sm ${
          mensaje.tipo === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {mensaje.texto}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Nivel de Permiso</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {listaUsuarios.map((usr) => (
              <tr key={usr.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{usr.nombre}</td>
                <td className="px-6 py-4">{usr.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    usr.rol === 'admin' ? 'bg-red-100 text-red-700' : 
                    usr.rol === 'operador' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {usr.rol || 'consulta'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => { setUsuarioSeleccionado(usr); setNuevoRol(usr.rol || 'consulta'); }}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" /> Permisos
                  </button>
                  <button 
                    onClick={() => { setUsuarioSeleccionado(usr); setNuevoRol(''); }}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors"
                  >
                    <Key className="w-3.5 h-3.5" /> Clave
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ventana Emergente (Modal) */}
      {usuarioSeleccionado && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Modificar Usuario
            </h3>
            <p className="text-xs text-gray-500 mb-4">Editando las credenciales de {usuarioSeleccionado.nombre}</p>
            
            {nuevoRol !== '' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Nivel de Acceso</label>
                  <select 
                    value={nuevoRol} 
                    onChange={(e) => setNuevoRol(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                  >
                    <option value="admin">Administrador (Acceso Total)</option>
                    <option value="operador">Operador (Modificar Stock)</option>
                    <option value="consulta">Consulta (Solo Ver)</option>
                  </select>
                </div>
                <button 
                  onClick={() => guardarPermisos(usuarioSeleccionado.id)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                >
                  Guardar Permisos
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    value={nuevaClave}
                    onChange={(e) => setNuevaClave(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>
                <button 
                  onClick={guardarNuevaClave}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                >
                  Establecer Clave
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setUsuarioSeleccionado(null)}
              className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
            >
              Cancelar Cambios
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
