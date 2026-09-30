import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../lib/storage';
import type { Usuario } from '../lib/types';

interface AuthContextType {
  user: Usuario | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const currentUser = auth.getUser();
    if (currentUser) setUser(currentUser);
  }, []);

  const login = (email: string, password: string): boolean => {
    const loggedUser = auth.login(email, password);
    if (loggedUser) { setUser(loggedUser); return true; }
    return false;
  };

  const logout = () => { auth.logout(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
