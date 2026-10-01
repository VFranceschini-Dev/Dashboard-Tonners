import { useState } from 'react';
import { User } from '../types';
import { Users, Plus, Edit2, Save, X, Shield, Search, Trash2, UserCheck, UserX } from 'lucide-react';
import { ADMIN_CREDENTIALS } from '../data';
interface Props { users: User[]; setUsers: (u: User[]) => void; }
export default function UsersPage({ users, setUsers }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<Partial<User>>({ name: '', email: '', role: 'operator' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  function startEdit(u: User) { setEditingId(u.id); setEditForm({ name: u.name, email: u.email, role: u.role, active: u.active }); }
  function saveEdit() { if (editingId) { setUsers(users.map(function(u) { return u.id === editingId ? Object.assign({}, u, editForm) : u; })); setEditingId(null); setEditForm({}); } }
  function addNew() { if (newItem.name && newItem.email) { var u: User = { id: Date.now().toString(), name: newItem.name || '', email: newItem.email || '', role: (newItem.role as User['role']) || 'operator', permissions: [], active: true, createdAt: new Date().toISOString().split('T')[0] }; setUsers([...users, u]); setShowAdd(false); setNewItem({ name: '', email: '', role: 'operator' }); } }
  function toggleActive(id: string) { setUsers(users.map(function(u) { return u.id === id ? Object.assign({}, u, { active: !u.active }) : u; })); }
  function deleteUser(id: string) { 
    if (id === '1') { alert('No se puede eliminar el usuario administrador principal'); return; }
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      setUsers(users.filter(function(u) { return u.id !== id; })); 
    }
  }
  
  var filteredUsers = users.filter(function(u) {
    var matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    var matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });
  
  var adminCount = users.filter(function(u) { return u.role === 'admin'; }).length;
  var operatorCount = users.filter(function(u) { return u.role === 'operator'; }).length;
  var viewerCount = users.filter(function(u) { return u.role === 'viewer'; }).length;
  var activeCount = users.filter(function(u) { return u.active; }).length;
  
  var inputCls = "w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  function getRoleColor(r: string) { return r === 'admin' ? 'bg-purple-500/20 text-purple-400' : r === 'operator' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'; }
  function getRoleLabel(r: string) { return r === 'admin' ? 'Administrador' : r === 'operator' ? 'Operador' : 'Visualizador'; }
  function getPermissions(role: string) { 
    if (role === 'admin') return ['Todos los permisos'];
    if (role === 'operator') return ['Impresoras', 'Inventario', 'Movimientos', 'Compras', 'Proveedores', 'Equipamientos'];
    return ['Solo lectura'];
  }
  return (<div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Gestión de Usuarios</h1><p className="text-slate-400 text-sm mt-1">Administración de usuarios, roles y permisos</p></div>
      <button onClick={function() { setShowAdd(!showAdd); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-500/30 border border-blue-500/30"><Plus className="w-4 h-4" />Nuevo Usuario</button></div>
    
    {/* Estadísticas */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="glass-card p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center"><Shield className="w-5 h-5 text-purple-400" /></div><div><p className="text-xl font-bold text-white">{adminCount}</p><p className="text-xs text-slate-400">Administradores</p></div></div></div>
      <div className="glass-card p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><UserCheck className="w-5 h-5 text-blue-400" /></div><div><p className="text-xl font-bold text-white">{operatorCount}</p><p className="text-xs text-slate-400">Operadores</p></div></div></div>
      <div className="glass-card p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center"><Users className="w-5 h-5 text-slate-400" /></div><div><p className="text-xl font-bold text-white">{viewerCount}</p><p className="text-xs text-slate-400">Visualizadores</p></div></div></div>
      <div className="glass-card p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><UserCheck className="w-5 h-5 text-emerald-400" /></div><div><p className="text-xl font-bold text-emerald-400">{activeCount}</p><p className="text-xs text-slate-400">Activos</p></div></div></div>
    </div>
    
    {/* Formulario de nuevo usuario */}
    {showAdd && <div className="glass-card p-6 border-blue-500/20 animate-slide-in"><h3 className="text-lg font-semibold text-white mb-4">Nuevo Usuario</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input type="text" placeholder="Nombre completo" value={newItem.name} onChange={function(e) { setNewItem(Object.assign({}, newItem, { name: e.target.value })); }} className={inputCls} />
        <input type="email" placeholder="Email" value={newItem.email} onChange={function(e) { setNewItem(Object.assign({}, newItem, { email: e.target.value })); }} className={inputCls} />
        <select value={newItem.role} onChange={function(e) { setNewItem(Object.assign({}, newItem, { role: e.target.value as any })); }} className={inputCls}>
          <option value="admin" className="bg-slate-800">Administrador</option><option value="operator" className="bg-slate-800">Operador</option><option value="viewer" className="bg-slate-800">Visualizador</option></select></div>
      <div className="flex gap-3 mt-4"><button onClick={addNew} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/30"><Save className="w-4 h-4" />Guardar</button>
        <button onClick={function() { setShowAdd(false); }} className="flex items-center gap-2 px-4 py-2 bg-white/10 text-slate-400 rounded-xl text-sm font-medium hover:bg-white/20"><X className="w-4 h-4" />Cancelar</button></div></div>}
    
    {/* Búsqueda y filtros */}
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Buscar por nombre o email..." value={searchTerm} onChange={function(e) { setSearchTerm(e.target.value); }} className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" /></div>
      <div className="flex gap-2">{['all', 'admin', 'operator', 'viewer'].map(function(r) { return (
        <button key={r} onClick={function() { setFilterRole(r); }} className={"px-4 py-2 rounded-xl text-sm font-medium transition-all " + (filterRole === r ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10')}>
          {r === 'all' ? 'Todos' : r === 'admin' ? 'Admin' : r === 'operator' ? 'Operador' : 'Visualizador'}</button>); })}</div></div>
    
    {/* Lista de usuarios */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {filteredUsers.map(function(user) { return (<div key={user.id} className={"glass-card p-5 hover:border-white/20 transition-all group " + (user.email === ADMIN_CREDENTIALS.email ? 'border-purple-500/30' : '')}>
        {editingId === user.id ? (<div className="space-y-3">
          <input type="text" value={editForm.name || ''} onChange={function(e) { setEditForm(Object.assign({}, editForm, { name: e.target.value })); }} className={inputCls} />
          <input type="email" value={editForm.email || ''} onChange={function(e) { setEditForm(Object.assign({}, editForm, { email: e.target.value })); }} className={inputCls} />
          <select value={editForm.role || 'operator'} onChange={function(e) { setEditForm(Object.assign({}, editForm, { role: e.target.value as any })); }} className={inputCls}>
            <option value="admin" className="bg-slate-800">Administrador</option><option value="operator" className="bg-slate-800">Operador</option><option value="viewer" className="bg-slate-800">Visualizador</option></select>
          <div className="flex gap-2"><button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30"><Save className="w-4 h-4" />Guardar</button>
            <button onClick={function() { setEditingId(null); setEditForm({}); }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-slate-400 rounded-lg text-sm hover:bg-white/20"><X className="w-4 h-4" />Cancelar</button></div></div>) : (<>
          <div className="flex items-start justify-between"><div className="flex items-center gap-3">
            <div className={"w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold " + (user.email === ADMIN_CREDENTIALS.email ? 'ring-2 ring-purple-400' : '')}>{user.name[0]}</div>
            <div><h3 className="text-sm font-semibold text-white">{user.name}{user.email === ADMIN_CREDENTIALS.email && <span className="ml-2 text-xs text-purple-400">★ Admin Principal</span>}</h3><p className="text-xs text-slate-400">{user.email}</p></div></div>
            <div className="flex gap-1">
              <button onClick={function() { startEdit(user); }} className="p-2 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100"><Edit2 className="w-4 h-4 text-slate-400" /></button>
              {user.email !== ADMIN_CREDENTIALS.email && <button onClick={function() { deleteUser(user.id); }} className="p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4 text-red-400" /></button>}</div></div>
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className={"text-xs px-2.5 py-1 rounded-full flex items-center gap-1 " + getRoleColor(user.role)}><Shield className="w-3 h-3" />{getRoleLabel(user.role)}</span>
            <span className={"text-xs px-2 py-0.5 rounded-full flex items-center gap-1 " + (user.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>{user.active ? <><UserCheck className="w-3 h-3" />Activo</> : <><UserX className="w-3 h-3" />Inactivo</>}</span></div>
          <div className="mt-3"><p className="text-xs text-slate-500 mb-1">Permisos:</p>
            <div className="flex flex-wrap gap-1">{getPermissions(user.role).map(function(perm, i) { return (<span key={i} className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400">{perm}</span>); })}</div></div>
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-xs text-slate-500">Creado: {user.createdAt}</span>
            {user.email !== ADMIN_CREDENTIALS.email && <button onClick={function() { toggleActive(user.id); }} className={"text-xs px-3 py-1 rounded-lg transition-colors " + (user.active ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10')}>{user.active ? 'Desactivar' : 'Activar'}</button>}</div></>)}
      </div>); })}</div>
    
    {filteredUsers.length === 0 && <div className="text-center py-12"><Users className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No se encontraron usuarios</p></div>}
  </div>);
}