import React, { useState } from 'react';
import { personal as initialPersonal } from '../data/mockData';
import { Users, Search, Mail, Phone, Building } from 'lucide-react';

const Personal: React.FC = () => {
  const [personal] = useState(initialPersonal);
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState('');

  const areas = [...new Set(personal.map(p => p.area))];

  const filteredPersonal = personal.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.apellido.toLowerCase().includes(search.toLowerCase()) ||
      p.legajo.toLowerCase().includes(search.toLowerCase());
    const matchArea = !filterArea || p.area === filterArea;
    return matchSearch && matchArea;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o legajo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Todas las áreas</option>
          {areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Total Personal</p>
          <p className="text-xl font-bold text-gray-800">{personal.length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Activos</p>
          <p className="text-xl font-bold text-green-600">{personal.filter(p => p.activo).length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Áreas</p>
          <p className="text-xl font-bold text-blue-600">{areas.length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Departamento IT</p>
          <p className="text-xl font-bold text-purple-600">{personal.filter(p => p.area === 'IT').length}</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersonal.map(persona => (
          <div key={persona.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-700">{persona.nombre[0]}{persona.apellido[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{persona.nombre} {persona.apellido}</p>
                <p className="text-xs text-gray-500">{persona.cargo}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                persona.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {persona.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="w-3.5 h-3.5 text-gray-400" />
                <span>{persona.area}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate">{persona.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{persona.telefono}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xs font-mono text-gray-400">Legajo: {persona.legajo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPersonal.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No se encontró personal con los filtros aplicados</p>
        </div>
      )}
    </div>
  );
};

export default Personal;
