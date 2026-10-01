import { useState } from 'react';
import { User } from '../types';
import { Printer, Lock, Mail, AlertCircle } from 'lucide-react';
import { ADMIN_CREDENTIALS } from '../data';

interface Props { users: User[]; onLogin: (user: User) => void; }

export default function LoginPage({ users, onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const admin = users.find(u => u.email === ADMIN_CREDENTIALS.email);
      if (admin) onLogin(admin);
      return;
    }
    const user = users.find(u => u.email === email && u.active);
    if (user) { onLogin(user); return; }
    setError('Credenciales invalidas. Verifique usuario y contrasena.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/30">
            <Printer className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Donnet Control</h1>
          <p className="text-slate-400 mt-2">Sistema de Control de Toner y Equipamientos</p>
          <p className="text-xs text-slate-500 mt-1">Monitoreo via mesh.donnet.com.ar</p>
        </div>
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Iniciar Sesion</h2>
          {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4"><AlertCircle className="w-4 h-4 text-red-400" /><p className="text-sm text-red-400">{error}</p></div>}
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="usuario@donnet.com.ar" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" /></div></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Contrasena</label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Ingrese su contrasena" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" onKeyDown={e => e.key === 'Enter' && handleLogin()} /></div></div>
            <button onClick={handleLogin} className="w-full py-3 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25">Ingresar al Sistema</button>
          </div>
        </div>
        <p className="text-center text-xs text-slate-500 mt-6">Donnet IT Management System v3.0</p>
      </div>
    </div>
  );
}