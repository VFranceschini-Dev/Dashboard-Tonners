import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';


// Definición de la estructura del usuario basada en tu sistema
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'operador' | 'consulta';
  area?: string;
  activo: boolean;
}

interface AuthContextType {
  user: Usuario | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verificar si hay una sesión activa al cargar la aplicación
    const inicializarAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await cargarPerfilUsuario(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    inicializarAuth();

    // 2. Escuchar cambios de estado en tiempo real (Login / Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await cargarPerfilUsuario(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Función interna para traer el rol y los datos desde la tabla de la base de datos
  const cargarPerfilUsuario = async (uid: string, email: string) => {
    try {
      const { data: perfil, error } = await supabase
        .from('perfiles_usuarios')
        .select('*')
        .eq('id', uid)
        .single();

      if (!error && perfil) {
        setUser({
          id: perfil.id,
          nombre: perfil.nombre,
          email: perfil.email,
          rol: perfil.rol,
          area: perfil.area,
          activo: perfil.activo
        });
      } else {
        // En caso de que se haya creado en Auth pero falte el perfil en la base de datos
        setUser({ id: uid, nombre: 'Usuario', email, rol: 'consulta', activo: true });
      }
    } catch (err) {
      console.error('Error al cargar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función de Login conectada a la API de autenticación de Supabase
  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Error de login:', error.message);
      return false;
    }
    return true;
  };

  // Función de Cierre de Sesión
  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};
