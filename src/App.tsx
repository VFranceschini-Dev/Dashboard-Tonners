import React, { useState, useEffect } from 'react';
import { meshCentralService, MeshNode } from './services/meshCentral';

// ==================== TIPOS ====================
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'operador' | 'consulta';
  password: string;
}

interface Equipo {
  id: string;
  tipo: 'impresora' | 'monitor' | 'cpu' | 'teclado' | 'mouse' | 'parlantes' | 'cable_red' | 'antena_wifi';
  marca: string;
  modelo: string;
  numeroSerie: string;
  area: string;
  usuarioAsignado: string;
  estado: 'disponible' | 'asignado' | 'mantenimiento' | 'fuera_servicio';
  fechaAdquisicion: string;
  observaciones: string;
}

interface Toner {
  id: string;
  marca: string;
  modelo: string;
  codigo: string;
  color: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  precioUnitario: number;
  proveedorId: string;
}

interface Proveedor {
  id: string;
  razonSocial: string;
  cuit: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
}

interface Comprobante {
  id: string;
  numero: string;
  tipo: 'factura' | 'recibo' | 'orden_compra';
  proveedorId: string;
  fecha: string;
  monto: number;
  concepto: string;
  estado: 'pendiente' | 'aprobado' | 'pagado';
  archivo?: string;
}

interface Personal {
  id: string;
  nombre: string;
  apellido: string;
  legajo: string;
  area: string;
  cargo: string;
  email: string;
  telefono: string;
}

interface Solicitud {
  id: string;
  tipo: 'toner' | 'equipamiento';
  solicitanteId: string;
  descripcion: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'completado';
  fechaSolicitud: string;
  prioridad: 'baja' | 'media' | 'alta';
}

interface TareaMantenimiento {
  id: string;
  equipoId: string;
  tipo: 'preventivo' | 'correctivo';
  descripcion: string;
  fechaProgramada: string;
  estado: 'pendiente' | 'en_proceso' | 'completado';
  tecnicoAsignado: string;
}

interface PCNode {
  id: string;
  nombre: string;
  usuario: string;
  area: string;
  estado: 'online' | 'offline' | 'error';
  ultimaConexion: string;
  ip: string;
  encendidaDesde: string;
}

// ==================== APP PRINCIPAL ====================
const App: React.FC = () => {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [toners, setToners] = useState<Toner[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [tareas, setTareas] = useState<TareaMantenimiento[]>([]);
  const [pcs, setPcs] = useState<PCNode[]>([]);

  const [paginaActual, setPaginaActual] = useState('dashboard');

  // Cargar datos desde localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('usuarioActual');
    if (savedUser) {
      try {
        setUsuarioActual(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('usuarioActual');
      }
    }

    const savedUsuarios = localStorage.getItem('usuarios');
    const adminDefault: Usuario = {
      id: '1',
      nombre: 'Administrador',
      email: 'admin@donnet.com.ar',
      rol: 'admin',
      password: 'admin123'
    };
    
    if (savedUsuarios) {
      try {
        const parsed = JSON.parse(savedUsuarios);
        // Verificar que el admin exista
        const adminExiste = parsed.find((u: Usuario) => u.email === 'admin@donnet.com.ar');
        if (!adminExiste) {
          parsed.push(adminDefault);
          localStorage.setItem('usuarios', JSON.stringify(parsed));
        }
        setUsuarios(parsed);
      } catch {
        // Si hay error al parsear, resetear
        localStorage.setItem('usuarios', JSON.stringify([adminDefault]));
        setUsuarios([adminDefault]);
      }
    } else {
      setUsuarios([adminDefault]);
      localStorage.setItem('usuarios', JSON.stringify([adminDefault]));
    }

    const savedEquipos = localStorage.getItem('equipos');
    if (savedEquipos) setEquipos(JSON.parse(savedEquipos));

    const savedToners = localStorage.getItem('toners');
    if (savedToners) setToners(JSON.parse(savedToners));

    const savedProveedores = localStorage.getItem('proveedores');
    if (savedProveedores) setProveedores(JSON.parse(savedProveedores));

    const savedPersonal = localStorage.getItem('personal');
    if (savedPersonal) setPersonal(JSON.parse(savedPersonal));

    const savedComprobantes = localStorage.getItem('comprobantes');
    if (savedComprobantes) setComprobantes(JSON.parse(savedComprobantes));

    const savedSolicitudes = localStorage.getItem('solicitudes');
    if (savedSolicitudes) setSolicitudes(JSON.parse(savedSolicitudes));

    const savedTareas = localStorage.getItem('tareas');
    if (savedTareas) setTareas(JSON.parse(savedTareas));

    const savedPcs = localStorage.getItem('pcs');
    if (savedPcs) setPcs(JSON.parse(savedPcs));
  }, []);

  // Guardar datos en localStorage
  useEffect(() => { localStorage.setItem('usuarios', JSON.stringify(usuarios)); }, [usuarios]);
  useEffect(() => { localStorage.setItem('equipos', JSON.stringify(equipos)); }, [equipos]);
  useEffect(() => { localStorage.setItem('toners', JSON.stringify(toners)); }, [toners]);
  useEffect(() => { localStorage.setItem('proveedores', JSON.stringify(proveedores)); }, [proveedores]);
  useEffect(() => { localStorage.setItem('personal', JSON.stringify(personal)); }, [personal]);
  useEffect(() => { localStorage.setItem('comprobantes', JSON.stringify(comprobantes)); }, [comprobantes]);
  useEffect(() => { localStorage.setItem('solicitudes', JSON.stringify(solicitudes)); }, [solicitudes]);
  useEffect(() => { localStorage.setItem('tareas', JSON.stringify(tareas)); }, [tareas]);
  useEffect(() => { localStorage.setItem('pcs', JSON.stringify(pcs)); }, [pcs]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usuarios.find(u => u.email === email && u.password === password);
    if (user) {
      setUsuarioActual(user);
      localStorage.setItem('usuarioActual', JSON.stringify(user));
      setError('');
    } else {
      setError('Credenciales incorrectas. Verificá email y contraseña.');
    }
  };

  const handleLogout = () => {
    setUsuarioActual(null);
    localStorage.removeItem('usuarioActual');
    setPaginaActual('dashboard');
  };

  const handleReset = () => {
    if (confirm('¿Resetear todos los datos? Esto eliminará todos los usuarios, equipos, toners, etc.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (!usuarioActual) {
    return (
      <div className="min-h-screen gradient-header flex items-center justify-center p-4">
        <div className="card p-8 w-full max-w-md fade-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 gradient-card rounded-3xl flex items-center justify-center mx-auto mb-4 text-white text-3xl shadow-lg">
              🏢
            </div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Donnet S.A.</h1>
            <p className="text-gray-500">Sistema de Gestión Integral</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="tu@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" required />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button type="submit" className="btn btn-primary w-full justify-center">Iniciar Sesión</button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl text-xs text-blue-700">
            <p className="font-semibold mb-1">ℹ️ Información</p>
            <p>Si es tu primer acceso, contactá al administrador del sistema para obtener tus credenciales.</p>
          </div>
          
          <button onClick={handleReset} className="mt-4 w-full text-xs text-red-500 hover:text-red-700 underline">
            🔄 Resetear todos los datos
          </button>
        </div>
      </div>
    );
  }

  const renderPagina = () => {
    switch (paginaActual) {
      case 'dashboard': return <Dashboard pcs={pcs} toners={toners} equipos={equipos} solicitudes={solicitudes} tareas={tareas} />;
      case 'equipos': return <EquiposPage equipos={equipos} setEquipos={setEquipos} usuarioActual={usuarioActual} />;
      case 'toners': return <TonersPage toners={toners} setToners={setToners} proveedores={proveedores} usuarioActual={usuarioActual} />;
      case 'proveedores': return <ProveedoresPage proveedores={proveedores} setProveedores={setProveedores} usuarioActual={usuarioActual} />;
      case 'comprobantes': return <ComprobantesPage comprobantes={comprobantes} setComprobantes={setComprobantes} proveedores={proveedores} usuarioActual={usuarioActual} />;
      case 'personal': return <PersonalPage personal={personal} setPersonal={setPersonal} usuarioActual={usuarioActual} />;
      case 'solicitudes': return <SolicitudesPage solicitudes={solicitudes} setSolicitudes={setSolicitudes} personal={personal} usuarioActual={usuarioActual} />;
      case 'calendario': return <CalendarioPage tareas={tareas} setTareas={setTareas} equipos={equipos} personal={personal} usuarioActual={usuarioActual} />;
      case 'usuarios': return usuarioActual.rol === 'admin' ? <UsuariosPage usuarios={usuarios} setUsuarios={setUsuarios} /> : <div className="alert alert-danger">No tenés permisos</div>;
      case 'monitoreo': return <MonitoreoPage pcs={pcs} setPcs={setPcs} />;
      default: return <Dashboard pcs={pcs} toners={toners} equipos={equipos} solicitudes={solicitudes} tareas={tareas} />;
    }
  };

  return (
    <div className="min-h-screen">
      <header className="gradient-header text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-2xl border border-white/30">
              🏢
            </div>
            <div>
              <h1 className="text-xl font-bold">Donnet S.A.</h1>
              <p className="text-xs text-blue-100">Sistema de Gestión Integral</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{usuarioActual.nombre}</p>
              <p className="text-xs text-blue-200 capitalize">{usuarioActual.rol}</p>
            </div>
            <button onClick={handleLogout} className="btn bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8 flex-col lg:flex-row">
          <aside className="w-full lg:w-72 flex-shrink-0">
            <nav className="card p-6 space-y-2">
              <div onClick={() => setPaginaActual('dashboard')} className={`sidebar-item ${paginaActual === 'dashboard' ? 'active' : ''}`}>
                <span>📊</span> Dashboard
              </div>
              <div onClick={() => setPaginaActual('equipos')} className={`sidebar-item ${paginaActual === 'equipos' ? 'active' : ''}`}>
                <span>💻</span> Equipamiento
              </div>
              <div onClick={() => setPaginaActual('toners')} className={`sidebar-item ${paginaActual === 'toners' ? 'active' : ''}`}>
                <span>🖨️</span> Toners
              </div>
              <div onClick={() => setPaginaActual('proveedores')} className={`sidebar-item ${paginaActual === 'proveedores' ? 'active' : ''}`}>
                <span>🏢</span> Proveedores
              </div>
              <div onClick={() => setPaginaActual('comprobantes')} className={`sidebar-item ${paginaActual === 'comprobantes' ? 'active' : ''}`}>
                <span>📄</span> Comprobantes
              </div>
              <div onClick={() => setPaginaActual('personal')} className={`sidebar-item ${paginaActual === 'personal' ? 'active' : ''}`}>
                <span>👥</span> Personal
              </div>
              <div onClick={() => setPaginaActual('solicitudes')} className={`sidebar-item ${paginaActual === 'solicitudes' ? 'active' : ''}`}>
                <span>📋</span> Solicitudes
              </div>
              <div onClick={() => setPaginaActual('calendario')} className={`sidebar-item ${paginaActual === 'calendario' ? 'active' : ''}`}>
                <span>📅</span> Calendario
              </div>
              <div onClick={() => setPaginaActual('monitoreo')} className={`sidebar-item ${paginaActual === 'monitoreo' ? 'active' : ''}`}>
                <span>🖥️</span> Monitoreo PCs
              </div>
              {usuarioActual.rol === 'admin' && (
                <div onClick={() => setPaginaActual('usuarios')} className={`sidebar-item ${paginaActual === 'usuarios' ? 'active' : ''}`}>
                  <span>⚙️</span> Usuarios
                </div>
              )}
            </nav>
          </aside>

          <main className="flex-1 fade-in">
            {renderPagina()}
          </main>
        </div>
      </div>
    </div>
  );
};

// ==================== DASHBOARD ====================
const Dashboard: React.FC<{ pcs: PCNode[]; toners: Toner[]; equipos: Equipo[]; solicitudes: Solicitud[]; tareas: TareaMantenimiento[] }> = ({ pcs, toners, equipos, solicitudes, tareas }) => {
  const tonersBajoStock = toners.filter(t => t.stockActual <= t.stockMinimo);
  const pcsOnline = pcs.filter(pc => pc.estado === 'online').length;
  const pcsEncendidasLargoPlazo = pcs.filter(pc => {
    if (pc.estado !== 'online') return false;
    const horas = (Date.now() - new Date(pc.encendidaDesde).getTime()) / (1000 * 60 * 60);
    return horas > 24;
  });
  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
  const tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-icon gradient-card text-white">💻</div>
          <p className="text-gray-500 text-sm mb-1">Total Equipos</p>
          <p className="text-4xl font-bold text-gray-800">{equipos.length}</p>
          <p className="text-xs text-gray-400 mt-2">Equipos registrados</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon gradient-success text-white">🖥️</div>
          <p className="text-gray-500 text-sm mb-1">PCs Online</p>
          <p className="text-4xl font-bold text-gray-800">{pcsOnline}/{pcs.length}</p>
          <p className="text-xs text-gray-400 mt-2">Equipos conectados</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon gradient-warning text-white">🖨️</div>
          <p className="text-gray-500 text-sm mb-1">Toners Bajo Stock</p>
          <p className="text-4xl font-bold text-gray-800">{tonersBajoStock.length}</p>
          <p className="text-xs text-gray-400 mt-2">Requieren atención</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon gradient-info text-white">📋</div>
          <p className="text-gray-500 text-sm mb-1">Solicitudes Pendientes</p>
          <p className="text-4xl font-bold text-gray-800">{solicitudesPendientes}</p>
          <p className="text-xs text-gray-400 mt-2">Por procesar</p>
        </div>
      </div>
      {pcsEncendidasLargoPlazo.length > 0 && (
        <div className="alert alert-danger">
          <span className="text-2xl">🔥</span>
          <div className="flex-1">
            <h3 className="font-bold mb-2">PCs Encendidas por Más de 24 Horas</h3>
            <div className="space-y-1">
              {pcsEncendidasLargoPlazo.map(pc => {
                const horas = Math.floor((Date.now() - new Date(pc.encendidaDesde).getTime()) / (1000 * 60 * 60));
                return (
                  <p key={pc.id} className="text-sm">
                    <strong>{pc.nombre}</strong> - {horas}h encendida
                    {pc.usuario && ` (${pc.usuario})`}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tonersBajoStock.length > 0 && (
        <div className="alert alert-warning">
          <span className="text-2xl">🖨️</span>
          <div className="flex-1">
            <h3 className="font-bold mb-2">Toners con Stock Bajo</h3>
            <div className="space-y-1">
              {tonersBajoStock.map(t => (
                <p key={t.id} className="text-sm">
                  <strong>{t.marca} {t.modelo}</strong> - Stock: {t.stockActual} (Mín: {t.stockMinimo})
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {tareasPendientes > 0 && (
        <div className="alert alert-info">
          <span className="text-2xl">📅</span>
          <div>
            <h3 className="font-bold">Tareas de Mantenimiento Pendientes</h3>
            <p className="text-sm mt-1">{tareasPendientes} tarea{tareasPendientes !== 1 ? 's' : ''} por realizar</p>
          </div>
        </div>
      )}

      {equipos.length === 0 && toners.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold mb-2 text-gray-800">¡Bienvenido al Sistema!</h3>
          <p className="text-gray-500 mb-4">Comenzá agregando equipos, toners y personal desde el menú lateral.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              🔄 Actualizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== EQUIPOS ====================
const EquiposPage: React.FC<{ equipos: Equipo[]; setEquipos: React.Dispatch<React.SetStateAction<Equipo[]>>; usuarioActual: Usuario }> = ({ equipos, setEquipos, usuarioActual }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Equipo>>({ tipo: 'impresora', estado: 'disponible' });

  const handleSave = () => {
    const newEquipo: Equipo = { ...form, id: Date.now().toString() } as Equipo;
    setEquipos([...equipos, newEquipo]);
    setShowModal(false);
    setForm({ tipo: 'impresora', estado: 'disponible' });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este equipo?')) setEquipos(equipos.filter(e => e.id !== id));
  };

  const tiposEquipo = ['impresora', 'monitor', 'cpu', 'teclado', 'mouse', 'parlantes', 'cable_red', 'antena_wifi'];
  const iconosTipo: Record<string, string> = { impresora: '🖨️', monitor: '🖥️', cpu: '💻', teclado: '⌨️', mouse: '🖱️', parlantes: '🔊', cable_red: '🔌', antena_wifi: '📡' };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Equipamiento</h2>
        {usuarioActual.rol !== 'consulta' && <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nuevo Equipo</button>}
      </div>
      {equipos.length === 0 ? (
        <div className="card p-12 text-center"><div className="text-6xl mb-4">💻</div><h3 className="text-xl font-bold mb-2">No hay equipos registrados</h3><p className="text-gray-500">Comenzá agregando tu primer equipo</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipos.map(equipo => (
            <div key={equipo.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center text-white text-xl">{iconosTipo[equipo.tipo]}</div>
                  <div><p className="font-bold capitalize">{equipo.tipo.replace('_', ' ')}</p><p className="text-sm text-gray-500">{equipo.marca} {equipo.modelo}</p></div>
                </div>
                <span className={`badge ${equipo.estado === 'disponible' ? 'badge-success' : equipo.estado === 'asignado' ? 'badge-info' : equipo.estado === 'mantenimiento' ? 'badge-warning' : 'badge-danger'}`}>{equipo.estado}</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><span className="font-semibold">S/N:</span> {equipo.numeroSerie}</p>
                <p><span className="font-semibold">Área:</span> {equipo.area}</p>
                <p><span className="font-semibold">Usuario:</span> {equipo.usuarioAsignado}</p>
              </div>
              {usuarioActual.rol !== 'consulta' && <button onClick={() => handleDelete(equipo.id)} className="btn btn-danger w-full justify-center text-sm">Eliminar</button>}
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">Nuevo Equipo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold mb-2">Tipo</label><select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as any })} className="input">{tiposEquipo.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}</select></div>
              <div><label className="block text-sm font-semibold mb-2">Marca</label><input type="text" value={form.marca || ''} onChange={(e) => setForm({ ...form, marca: e.target.value })} className="input" /></div>
              <div><label className="block text-sm font-semibold mb-2">Modelo</label><input type="text" value={form.modelo || ''} onChange={(e) => setForm({ ...form, modelo: e.target.value })} className="input" /></div>
              <div><label className="block text-sm font-semibold mb-2">N° Serie</label><input type="text" value={form.numeroSerie || ''} onChange={(e) => setForm({ ...form, numeroSerie: e.target.value })} className="input" /></div>
              <div><label className="block text-sm font-semibold mb-2">Área</label><input type="text" value={form.area || ''} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input" /></div>
              <div><label className="block text-sm font-semibold mb-2">Usuario Asignado</label><input type="text" value={form.usuarioAsignado || ''} onChange={(e) => setForm({ ...form, usuarioAsignado: e.target.value })} className="input" /></div>
              <div><label className="block text-sm font-semibold mb-2">Estado</label><select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as any })} className="input"><option value="disponible">Disponible</option><option value="asignado">Asignado</option><option value="mantenimiento">En Mantenimiento</option><option value="fuera_servicio">Fuera de Servicio</option></select></div>
              <div><label className="block text-sm font-semibold mb-2">Fecha Adquisición</label><input type="date" value={form.fechaAdquisicion || ''} onChange={(e) => setForm({ ...form, fechaAdquisicion: e.target.value })} className="input" /></div>
            </div>
            <div className="mt-4"><label className="block text-sm font-semibold mb-2">Observaciones</label><textarea value={form.observaciones || ''} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} className="input" rows={3} /></div>
            <div className="flex gap-3 mt-6"><button onClick={handleSave} className="btn btn-primary flex-1 justify-center">Guardar</button><button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1 justify-center">Cancelar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== TONERS ====================
const TonersPage: React.FC<{ toners: Toner[]; setToners: React.Dispatch<React.SetStateAction<Toner[]>>; proveedores: Proveedor[]; usuarioActual: Usuario }> = ({ toners, setToners, usuarioActual }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Toner>>({ color: 'Negro' });

  const handleSave = () => {
    const newToner: Toner = { ...form, id: Date.now().toString() } as Toner;
    setToners([...toners, newToner]);
    setShowModal(false);
    setForm({ color: 'Negro' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Toners</h2>
        {usuarioActual.rol !== 'consulta' && <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nuevo Toner</button>}
      </div>
      {toners.length === 0 ? (
        <div className="card p-12 text-center"><div className="text-6xl mb-4">🖨️</div><h3 className="text-xl font-bold mb-2">No hay toners registrados</h3><p className="text-gray-500">Comenzá agregando tu primer toner</p></div>
      ) : (
        <div className="table-container">
          <div className="table-header font-semibold">Gestión de Stock de Toners</div>
          {toners.map(t => (
            <div key={t.id} className="table-row flex justify-between items-center">
              <div><p className="font-bold">{t.marca} {t.modelo}</p><p className="text-sm text-gray-500">{t.codigo} | {t.color}</p></div>
              <div className="flex items-center gap-4">
                <div className="text-right"><p className="text-2xl font-bold">{t.stockActual}</p><p className="text-xs text-gray-500">de {t.stockMaximo}</p></div>
                <span className={`badge ${t.stockActual <= t.stockMinimo ? 'badge-danger' : 'badge-success'}`}>{t.stockActual <= t.stockMinimo ? 'Bajo' : 'OK'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">Nuevo Toner</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold mb-2">Marca</label><input type="text" value={form.marca || ''} onChange={(e) => setForm({ ...form, marca: e.target.value })} className="input" /></div>
              <div><label className="block text-sm font-semibold mb-2">Modelo</label><input type="text" value={form.modelo || ''} onChange={(e) => setForm({ ...form, modelo: e.target.value })} className="input" /></div>
              <div><label className="block text-sm font-semibold mb-2">Código</label><input type="text" value={form.codigo || ''} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="input" /></div>
              <div><label className="block text-sm font-semibold mb-2">Color</label><select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="input"><option>Negro</option><option>Cian</option><option>Magenta</option><option>Amarillo</option></select></div>
              <div><label className="block text-sm font-semibold mb-2">Stock Actual</label><input type="number" value={form.stockActual || 0} onChange={(e) => setForm({ ...form, stockActual: Number(e.target.value) })} className="input" /></div>
              <div><label className="block text-sm font-semibold mb-2">Stock Mínimo</label><input type="number" value={form.stockMinimo || 0} onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })} className="input" /></div>
              <div><label className="block text-sm font-semibold mb-2">Stock Máximo</label><input type="number" value={form.stockMaximo || 0} onChange={(e) => setForm({ ...form, stockMaximo: Number(e.target.value) })} className="input" /></div>
              <div><label className="block text-sm font-semibold mb-2">Precio Unitario</label><input type="number" value={form.precioUnitario || 0} onChange={(e) => setForm({ ...form, precioUnitario: Number(e.target.value) })} className="input" /></div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={handleSave} className="btn btn-primary flex-1 justify-center">Guardar</button><button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1 justify-center">Cancelar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== PROVEEDORES ====================
const ProveedoresPage: React.FC<{ proveedores: Proveedor[]; setProveedores: React.Dispatch<React.SetStateAction<Proveedor[]>>; usuarioActual: Usuario }> = ({ proveedores, setProveedores, usuarioActual }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Proveedor>>({});

  const handleSave = () => {
    const newProv: Proveedor = { ...form, id: Date.now().toString() } as Proveedor;
    setProveedores([...proveedores, newProv]);
    setShowModal(false);
    setForm({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Proveedores</h2>
        {usuarioActual.rol !== 'consulta' && <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nuevo Proveedor</button>}
      </div>
      {proveedores.length === 0 ? (
        <div className="card p-12 text-center"><div className="text-6xl mb-4">🏢</div><h3 className="text-xl font-bold mb-2">No hay proveedores registrados</h3></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proveedores.map(p => (
            <div key={p.id} className="card p-6">
              <h3 className="font-bold text-lg mb-2">{p.razonSocial}</h3>
              <p className="text-sm text-gray-500 mb-4">CUIT: {p.cuit}</p>
              <div className="space-y-2 text-sm"><p><span className="font-semibold">Contacto:</span> {p.contacto}</p><p><span className="font-semibold">Tel:</span> {p.telefono}</p><p><span className="font-semibold">Email:</span> {p.email}</p></div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">Nuevo Proveedor</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Razón Social" value={form.razonSocial || ''} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} className="input" />
              <input type="text" placeholder="CUIT" value={form.cuit || ''} onChange={(e) => setForm({ ...form, cuit: e.target.value })} className="input" />
              <input type="text" placeholder="Contacto" value={form.contacto || ''} onChange={(e) => setForm({ ...form, contacto: e.target.value })} className="input" />
              <input type="text" placeholder="Teléfono" value={form.telefono || ''} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="input" />
              <input type="email" placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
              <input type="text" placeholder="Dirección" value={form.direccion || ''} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="input" />
            </div>
            <div className="flex gap-3 mt-6"><button onClick={handleSave} className="btn btn-primary flex-1 justify-center">Guardar</button><button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1 justify-center">Cancelar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== COMPROBANTES ====================
const ComprobantesPage: React.FC<{ comprobantes: Comprobante[]; setComprobantes: React.Dispatch<React.SetStateAction<Comprobante[]>>; proveedores: Proveedor[]; usuarioActual: Usuario }> = ({ comprobantes, setComprobantes, proveedores, usuarioActual }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Comprobante>>({ tipo: 'factura', estado: 'pendiente' });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setForm({ ...form, archivo: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const newComp: Comprobante = { ...form, id: Date.now().toString() } as Comprobante;
    setComprobantes([...comprobantes, newComp]);
    setShowModal(false);
    setForm({ tipo: 'factura', estado: 'pendiente' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Comprobantes</h2>
        {usuarioActual.rol !== 'consulta' && <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nuevo Comprobante</button>}
      </div>
      {comprobantes.length === 0 ? (
        <div className="card p-12 text-center"><div className="text-6xl mb-4">📄</div><h3 className="text-xl font-bold mb-2">No hay comprobantes</h3></div>
      ) : (
        <div className="table-container">
          <div className="table-header font-semibold">Registro de Comprobantes</div>
          {comprobantes.map(c => (
            <div key={c.id} className="table-row flex justify-between items-center">
              <div><p className="font-bold">{c.numero}</p><p className="text-sm text-gray-500 capitalize">{c.tipo} | {c.fecha}</p></div>
              <div className="flex items-center gap-4">
                <p className="text-xl font-bold">${c.monto.toLocaleString()}</p>
                <span className={`badge ${c.estado === 'pagado' ? 'badge-success' : c.estado === 'aprobado' ? 'badge-info' : 'badge-warning'}`}>{c.estado}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">Nuevo Comprobante</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Número" value={form.numero || ''} onChange={(e) => setForm({ ...form, numero: e.target.value })} className="input" />
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as any })} className="input"><option value="factura">Factura</option><option value="recibo">Recibo</option><option value="orden_compra">Orden de Compra</option></select>
              <select value={form.proveedorId || ''} onChange={(e) => setForm({ ...form, proveedorId: e.target.value })} className="input"><option value="">Seleccionar proveedor...</option>{proveedores.map(p => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}</select>
              <input type="date" value={form.fecha || ''} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="input" />
              <input type="number" placeholder="Monto" value={form.monto || ''} onChange={(e) => setForm({ ...form, monto: Number(e.target.value) })} className="input" />
              <input type="text" placeholder="Concepto" value={form.concepto || ''} onChange={(e) => setForm({ ...form, concepto: e.target.value })} className="input" />
              <div><label className="block text-sm font-semibold mb-2">Adjuntar documento</label><input type="file" onChange={handleFileUpload} className="input" /></div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={handleSave} className="btn btn-primary flex-1 justify-center">Guardar</button><button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1 justify-center">Cancelar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== PERSONAL ====================
const PersonalPage: React.FC<{ personal: Personal[]; setPersonal: React.Dispatch<React.SetStateAction<Personal[]>>; usuarioActual: Usuario }> = ({ personal, setPersonal, usuarioActual }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Personal>>({});

  const handleSave = () => {
    const newPer: Personal = { ...form, id: Date.now().toString() } as Personal;
    setPersonal([...personal, newPer]);
    setShowModal(false);
    setForm({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Personal</h2>
        {usuarioActual.rol !== 'consulta' && <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nuevo Empleado</button>}
      </div>
      {personal.length === 0 ? (
        <div className="card p-12 text-center"><div className="text-6xl mb-4">👥</div><h3 className="text-xl font-bold mb-2">No hay personal registrado</h3></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personal.map(p => (
            <div key={p.id} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center text-white text-xl font-bold">{p.nombre[0]}{p.apellido[0]}</div>
                <div><p className="font-bold">{p.nombre} {p.apellido}</p><p className="text-sm text-gray-500">{p.cargo}</p></div>
              </div>
              <div className="space-y-2 text-sm"><p><span className="font-semibold">Legajo:</span> {p.legajo}</p><p><span className="font-semibold">Área:</span> {p.area}</p><p><span className="font-semibold">Email:</span> {p.email}</p></div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">Nuevo Empleado</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre" value={form.nombre || ''} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" />
              <input type="text" placeholder="Apellido" value={form.apellido || ''} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="input" />
              <input type="text" placeholder="Legajo" value={form.legajo || ''} onChange={(e) => setForm({ ...form, legajo: e.target.value })} className="input" />
              <input type="text" placeholder="Área" value={form.area || ''} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input" />
              <input type="text" placeholder="Cargo" value={form.cargo || ''} onChange={(e) => setForm({ ...form, cargo: e.target.value })} className="input" />
              <input type="email" placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
              <input type="text" placeholder="Teléfono" value={form.telefono || ''} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="input col-span-2" />
            </div>
            <div className="flex gap-3 mt-6"><button onClick={handleSave} className="btn btn-primary flex-1 justify-center">Guardar</button><button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1 justify-center">Cancelar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== SOLICITUDES ====================
const SolicitudesPage: React.FC<{ solicitudes: Solicitud[]; setSolicitudes: React.Dispatch<React.SetStateAction<Solicitud[]>>; personal: Personal[]; usuarioActual: Usuario }> = ({ solicitudes, setSolicitudes, personal, usuarioActual }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Solicitud>>({ tipo: 'toner', estado: 'pendiente', prioridad: 'media' });

  const handleSave = () => {
    const newSol: Solicitud = { ...form, id: Date.now().toString(), fechaSolicitud: new Date().toISOString().split('T')[0] } as Solicitud;
    setSolicitudes([...solicitudes, newSol]);
    setShowModal(false);
    setForm({ tipo: 'toner', estado: 'pendiente', prioridad: 'media' });
  };

  const cambiarEstado = (id: string, estado: Solicitud['estado']) => {
    setSolicitudes(solicitudes.map(s => s.id === id ? { ...s, estado } : s));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Solicitudes</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nueva Solicitud</button>
      </div>
      {solicitudes.length === 0 ? (
        <div className="card p-12 text-center"><div className="text-6xl mb-4">📋</div><h3 className="text-xl font-bold mb-2">No hay solicitudes</h3></div>
      ) : (
        <div className="table-container">
          <div className="table-header font-semibold">Control de Solicitudes</div>
          {solicitudes.map(s => (
            <div key={s.id} className="table-row flex justify-between items-center">
              <div><p className="font-bold capitalize">{s.tipo}</p><p className="text-sm text-gray-500">{s.fechaSolicitud} | {s.descripcion}</p></div>
              <div className="flex items-center gap-3">
                <span className={`badge ${s.prioridad === 'alta' ? 'badge-danger' : s.prioridad === 'media' ? 'badge-warning' : 'badge-success'}`}>{s.prioridad}</span>
                <span className={`badge ${s.estado === 'completado' ? 'badge-success' : s.estado === 'aprobado' ? 'badge-info' : s.estado === 'rechazado' ? 'badge-danger' : 'badge-warning'}`}>{s.estado}</span>
                {usuarioActual.rol !== 'consulta' && (
                  <select value={s.estado} onChange={(e) => cambiarEstado(s.id, e.target.value as any)} className="input text-xs py-1 px-2"><option value="pendiente">Pendiente</option><option value="aprobado">Aprobado</option><option value="rechazado">Rechazado</option><option value="completado">Completado</option></select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">Nueva Solicitud</h3>
            <div className="space-y-4">
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as any })} className="input"><option value="toner">Toner</option><option value="equipamiento">Equipamiento</option></select>
              <select value={form.solicitanteId || ''} onChange={(e) => setForm({ ...form, solicitanteId: e.target.value })} className="input"><option value="">Seleccionar solicitante...</option>{personal.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}</select>
              <textarea placeholder="Descripción" value={form.descripcion || ''} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="input" rows={3} />
              <select value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value as any })} className="input"><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={handleSave} className="btn btn-primary flex-1 justify-center">Guardar</button><button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1 justify-center">Cancelar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== CALENDARIO ====================
const CalendarioPage: React.FC<{ tareas: TareaMantenimiento[]; setTareas: React.Dispatch<React.SetStateAction<TareaMantenimiento[]>>; equipos: Equipo[]; personal: Personal[]; usuarioActual: Usuario }> = ({ tareas, setTareas, equipos, personal, usuarioActual }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<TareaMantenimiento>>({ tipo: 'preventivo', estado: 'pendiente' });

  const handleSave = () => {
    const newTarea: TareaMantenimiento = { ...form, id: Date.now().toString() } as TareaMantenimiento;
    setTareas([...tareas, newTarea]);
    setShowModal(false);
    setForm({ tipo: 'preventivo', estado: 'pendiente' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Calendario de Mantenimiento</h2>
        {usuarioActual.rol !== 'consulta' && <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nueva Tarea</button>}
      </div>
      {tareas.length === 0 ? (
        <div className="card p-12 text-center"><div className="text-6xl mb-4">📅</div><h3 className="text-xl font-bold mb-2">No hay tareas programadas</h3></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tareas.map(t => (
            <div key={t.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div><p className="font-bold">{equipos.find(e => e.id === t.equipoId)?.marca} {equipos.find(e => e.id === t.equipoId)?.modelo}</p><p className="text-sm text-gray-500 capitalize">{t.tipo}</p></div>
                <span className={`badge ${t.estado === 'completado' ? 'badge-success' : t.estado === 'en_proceso' ? 'badge-info' : 'badge-warning'}`}>{t.estado}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{t.descripcion}</p>
              <div className="text-xs text-gray-500 space-y-1"><p>📅 {t.fechaProgramada}</p><p>👤 {personal.find(p => p.id === t.tecnicoAsignado)?.nombre || 'Sin asignar'}</p></div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">Nueva Tarea</h3>
            <div className="space-y-4">
              <select value={form.equipoId || ''} onChange={(e) => setForm({ ...form, equipoId: e.target.value })} className="input"><option value="">Seleccionar equipo...</option>{equipos.map(e => <option key={e.id} value={e.id}>{e.marca} {e.modelo}</option>)}</select>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as any })} className="input"><option value="preventivo">Preventivo</option><option value="correctivo">Correctivo</option></select>
              <textarea placeholder="Descripción" value={form.descripcion || ''} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="input" rows={3} />
              <input type="date" value={form.fechaProgramada || ''} onChange={(e) => setForm({ ...form, fechaProgramada: e.target.value })} className="input" />
              <select value={form.tecnicoAsignado || ''} onChange={(e) => setForm({ ...form, tecnicoAsignado: e.target.value })} className="input"><option value="">Seleccionar técnico...</option>{personal.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}</select>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={handleSave} className="btn btn-primary flex-1 justify-center">Guardar</button><button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1 justify-center">Cancelar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== USUARIOS ====================
const UsuariosPage: React.FC<{ usuarios: Usuario[]; setUsuarios: React.Dispatch<React.SetStateAction<Usuario[]>> }> = ({ usuarios, setUsuarios }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Usuario>>({ rol: 'consulta' });

  const handleSave = () => {
    const newUser: Usuario = { ...form, id: Date.now().toString() } as Usuario;
    setUsuarios([...usuarios, newUser]);
    setShowModal(false);
    setForm({ rol: 'consulta' });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar usuario?')) setUsuarios(usuarios.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestión de Usuarios</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Nuevo Usuario</button>
      </div>
      <div className="table-container">
        <div className="table-header font-semibold">Usuarios del Sistema</div>
        {usuarios.map(u => (
          <div key={u.id} className="table-row flex justify-between items-center">
            <div><p className="font-bold">{u.nombre}</p><p className="text-sm text-gray-500">{u.email}</p></div>
            <div className="flex items-center gap-3">
              <span className={`badge ${u.rol === 'admin' ? 'badge-danger' : u.rol === 'operador' ? 'badge-info' : 'badge-success'}`}>{u.rol}</span>
              <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">Nuevo Usuario</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Nombre" value={form.nombre || ''} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" />
              <input type="email" placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
              <input type="password" placeholder="Contraseña" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as any })} className="input"><option value="admin">Administrador</option><option value="operador">Operador</option><option value="consulta">Consulta</option></select>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={handleSave} className="btn btn-primary flex-1 justify-center">Guardar</button><button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1 justify-center">Cancelar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== MONITOREO ====================
const MonitoreoPage: React.FC<{ pcs: PCNode[]; setPcs: React.Dispatch<React.SetStateAction<PCNode[]>> }> = ({ pcs, setPcs }) => {
  const [meshNodes, setMeshNodes] = useState<MeshNode[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [meshCredentials, setMeshCredentials] = useState({ username: '', password: '' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<PCNode>>({ estado: 'online' });

  // Suscribirse a cambios de MeshCentral
  useEffect(() => {
    const unsubscribe = meshCentralService.subscribe((nodes) => {
      setMeshNodes(nodes);
      setIsConnected(meshCentralService.isWebSocketConnected());
    });

    // Intentar conectar automáticamente
    const tryAutoConnect = async () => {
      const savedCreds = localStorage.getItem('meshCredentials');
      if (savedCreds) {
        const { username, password } = JSON.parse(savedCreds);
        setIsConnecting(true);
        const connected = await meshCentralService.connect(username, password);
        setIsConnected(connected);
        setIsConnecting(false);
      }
    };

    tryAutoConnect();

    return () => {
      unsubscribe();
    };
  }, []);

  const handleMeshLogin = async () => {
    setIsConnecting(true);
    const connected = await meshCentralService.connect(meshCredentials.username, meshCredentials.password);
    setIsConnected(connected);
    setIsConnecting(false);
    
    if (connected) {
      localStorage.setItem('meshCredentials', JSON.stringify(meshCredentials));
      setShowLoginModal(false);
    }
  };

  // Convertir MeshNodes a PCNodes para compatibilidad
  const allPcs: PCNode[] = [
    ...pcs,
    ...meshNodes.map(node => ({
      id: node.id,
      nombre: node.name,
      usuario: '',
      area: node.meshName || 'MeshCentral',
      estado: node.connected ? 'online' as const : 'offline' as const,
      ultimaConexion: new Date(node.lastConnect * 1000).toISOString(),
      ip: node.ip,
      encendidaDesde: new Date(node.lastConnect * 1000).toISOString()
    }))
  ];

  const pcsOnline = allPcs.filter(pc => pc.estado === 'online').length;
  const pcsOffline = allPcs.filter(pc => pc.estado === 'offline').length;

  // Detectar PCs encendidas por más de 24 horas
  const pcsEncendidasLargoPlazo = allPcs.filter(pc => {
    if (pc.estado !== 'online') return false;
    const horas = (Date.now() - new Date(pc.encendidaDesde).getTime()) / (1000 * 60 * 60);
    return horas > 24;
  });

  const handleSave = () => {
    const newPc: PCNode = { ...form, id: Date.now().toString(), ultimaConexion: new Date().toISOString(), encendidaDesde: new Date().toISOString() } as PCNode;
    setPcs([...pcs, newPc]);
    setShowModal(false);
    setForm({ estado: 'online' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Monitoreo de PCs</h2>
          <p className="text-sm text-gray-500 mt-1">Seguimiento en tiempo real de equipos conectados</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className={`connection-status ${isConnected ? 'connection-online' : isConnecting ? 'connection-connecting' : 'connection-offline'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 pulse' : isConnecting ? 'bg-yellow-500 pulse' : 'bg-red-500'}`}></span>
            {isConnected ? 'MeshCentral Conectado' : isConnecting ? 'Conectando...' : 'Desconectado'}
          </div>
          <button onClick={() => setShowLoginModal(true)} className="btn btn-primary">
            🔐 {isConnected ? 'Reconectar' : 'Conectar MeshCentral'}
          </button>
          <button onClick={() => setShowModal(true)} className="btn btn-secondary">+ Nueva PC</button>
          <a href="https://mesh.donnet.com.ar" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">🔗 Abrir MeshCentral</a>
        </div>
      </div>

      {/* Alerta de conexión */}
      {!isConnected && !isConnecting && (
        <div className="alert alert-warning">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold mb-1">No conectado a MeshCentral</h3>
            <p className="text-sm">Conectate a MeshCentral para ver los equipos en tiempo real. Los datos mostrados son locales.</p>
          </div>
        </div>
      )}

      {/* Alerta de PCs encendidas por mucho tiempo */}
      {pcsEncendidasLargoPlazo.length > 0 && (
        <div className="alert alert-danger">
          <span className="text-2xl">🔥</span>
          <div className="flex-1">
            <h3 className="font-bold mb-2">PCs Encendidas por Más de 24 Horas</h3>
            <div className="space-y-1">
              {pcsEncendidasLargoPlazo.map(pc => {
                const horas = Math.floor((Date.now() - new Date(pc.encendidaDesde).getTime()) / (1000 * 60 * 60));
                return (
                  <p key={pc.id} className="text-sm">
                    <strong>{pc.nombre}</strong> - {horas}h encendida
                    {pc.usuario && ` (${pc.usuario})`}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="stat-icon gradient-success text-white">🟢</div>
          <p className="text-gray-500 text-sm mb-1">Online</p>
          <p className="text-4xl font-bold text-gray-800">{pcsOnline}</p>
          <p className="text-xs text-gray-400 mt-2">Equipos conectados</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon gradient-danger text-white">⚫</div>
          <p className="text-gray-500 text-sm mb-1">Offline</p>
          <p className="text-4xl font-bold text-gray-800">{pcsOffline}</p>
          <p className="text-xs text-gray-400 mt-2">Equipos desconectados</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon gradient-card text-white">💻</div>
          <p className="text-gray-500 text-sm mb-1">Total</p>
          <p className="text-4xl font-bold text-gray-800">{allPcs.length}</p>
          <p className="text-xs text-gray-400 mt-2">Equipos registrados</p>
        </div>
      </div>

      {/* Tabla de equipos */}
      {allPcs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🖥️</div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">No hay PCs registradas</h3>
          <p className="text-gray-500 mb-4">Conectate a MeshCentral o agregá PCs manualmente</p>
          <button onClick={() => setShowLoginModal(true)} className="btn btn-primary">
            🔐 Conectar a MeshCentral
          </button>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-header font-semibold flex justify-between items-center">
            <span>Estado de Equipos</span>
            <span className="text-xs text-blue-600">
              {meshNodes.length > 0 && `${meshNodes.length} desde MeshCentral`}
            </span>
          </div>
          {allPcs.map(pc => (
            <div key={pc.id} className="table-row flex justify-between items-center flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800">{pc.nombre}</p>
                <p className="text-sm text-gray-500 truncate">
                  {pc.usuario && `${pc.usuario} | `}
                  {pc.area}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-mono text-gray-600">{pc.ip}</p>
                <span className={`badge ${pc.estado === 'online' ? 'badge-success' : pc.estado === 'offline' ? 'badge-danger' : 'badge-warning'}`}>
                  {pc.estado === 'online' ? '● Online' : pc.estado === 'offline' ? '○ Offline' : '⚠ Error'}
                </span>
                {meshNodes.find(n => n.id === pc.id) && (
                  <a 
                    href={meshCentralService.getNodeUrl(pc.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary text-xs py-1 px-3"
                  >
                    🔗 Acceder
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Login MeshCentral */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">Conectar a MeshCentral</h3>
            <p className="text-sm text-gray-500 mb-6">Ingresá tus credenciales de MeshCentral para ver los equipos en tiempo real</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Usuario</label>
                <input 
                  type="text" 
                  value={meshCredentials.username}
                  onChange={(e) => setMeshCredentials({ ...meshCredentials, username: e.target.value })}
                  className="input" 
                  placeholder="tu_usuario"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Contraseña</label>
                <input 
                  type="password" 
                  value={meshCredentials.password}
                  onChange={(e) => setMeshCredentials({ ...meshCredentials, password: e.target.value })}
                  className="input" 
                  placeholder="••••••••"
                />
              </div>
              {isConnecting && (
                <div className="flex items-center gap-3 text-blue-600">
                  <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }}></div>
                  <span className="text-sm">Conectando...</span>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleMeshLogin} disabled={isConnecting} className="btn btn-primary flex-1 justify-center disabled:opacity-50">
                {isConnecting ? 'Conectando...' : 'Conectar'}
              </button>
              <button onClick={() => setShowLoginModal(false)} className="btn btn-secondary flex-1 justify-center">Cancelar</button>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              <p className="font-semibold mb-1">ℹ️ Información</p>
              <p>Las credenciales se guardan localmente en tu navegador. Se usa WebSocket para comunicación en tiempo real con mesh.donnet.com.ar</p>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">Nueva PC</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Nombre" value={form.nombre || ''} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" />
              <input type="text" placeholder="Usuario" value={form.usuario || ''} onChange={(e) => setForm({ ...form, usuario: e.target.value })} className="input" />
              <input type="text" placeholder="Área" value={form.area || ''} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input" />
              <input type="text" placeholder="IP" value={form.ip || ''} onChange={(e) => setForm({ ...form, ip: e.target.value })} className="input" />
              <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as any })} className="input"><option value="online">Online</option><option value="offline">Offline</option><option value="error">Error</option></select>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={handleSave} className="btn btn-primary flex-1 justify-center">Guardar</button><button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1 justify-center">Cancelar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;