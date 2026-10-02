import { createContext, useContext, useState, type ReactNode } from 'react';
import { hashPassword, safeEqual } from '../lib/auth';

interface User {
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  /** Async: valida contra hashes (SHA-256 + salt), nunca en claro */
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ⚠️ Contraseñas ALMACENADAS COMO HASH (no en claro).
// Para generar un hash nuevo:
//   node -e "const c=require('crypto');console.log(c.createHash('sha256').update('donnet-toner-v3'+process.argv[1]).digest('hex'))" 'NUEVA_CLAVE'
// En producción esto debe migrar a un backend real (Supabase Auth / OIDC);
// una SPA no puede proteger credenciales de forma fiable.
const SECURED_USERS = [
  {
    email: 'soporte@donnet.com.ar',
    passwordHash: '6cebea32215864e73afb256e1f5bd15e0afcb260cbc7ff6b878c52aa7c9bddba',
    name: 'Administrador',
    role: 'admin' as const,
  },
  {
    email: 'usuario@donnet.com.ar',
    passwordHash: '6636a9b98073e8abf9b3c81f39e44378771d7f756431d3305c70990f119879d8',
    name: 'Ana García',
    role: 'user' as const,
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('toner_user');
      return savedUser ? (JSON.parse(savedUser) as User) : null;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    const candidate = SECURED_USERS.find(u => u.email === email);
    if (!candidate) return false;

    // Hash + comparación en tiempo constante
    const inputHash = await hashPassword(password);
    if (safeEqual(inputHash, candidate.passwordHash)) {
      const userData = { email: candidate.email, name: candidate.name, role: candidate.role };
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
