import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USERS = [
  { email: 'soporte@donnet.com.ar', passwordHash: '1ff58fc23c79d374e79d0537f64f5a2d930929099d3d92f614823b5880f5766e', name: 'Administrador', role: 'admin' as const },
  { email: 'usuario@donnet.com.ar', passwordHash: 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', name: 'Ana García', role: 'user' as const },
];

// NOTA DE SEGURIDAD: la autenticación client-side es solo una maqueta de UI.
// Las contraseñas reales NUNCA deben almacenarse en el frontend (ni siquiera hasheadas
// con SHA-256 sin salt). Para producción, mover la validación a un backend que use
// bcrypt/scrypt/argon2 y emitir un token de sesión (JWT/sesión httpOnly).
async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('toner_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    const hash = await sha256(password);
    const foundUser = DEFAULT_USERS.find(
      u => u.email === email && u.passwordHash === hash
    );
    
    if (foundUser) {
      const userData = { email: foundUser.email, name: foundUser.name, role: foundUser.role };
      setUser(userData);
      localStorage.setItem('toner_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('toner_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}