import React, { useState } from 'react';
import { proveedores as initialProveedores } from '../data/mockData';
import { Building2, Search, Phone, Mail, MapPin } from 'lucide-react';

const Proveedores: React.FC = () => {
  const [proveedores] = useState(initialProveedores);
  const [search, setSearch] = useState('');

  const filteredProveedores = proveedores.filter(p => {
    return p.razonSocial.toLowerCase().includes(search.toLowerCase()) ||
      p.contacto.toLowerCase().includes(search.toLowerCase()) ||
      p.marcas.some(m => m.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar proveedor, contacto o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Total Proveedores</p>
          <p className="text-xl font-bold text-gray-800">{proveedores.length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Marcas Cubiertas</p>
          <p className="text-xl font-bold text-blue-600">{[...new Set(proveedores.flatMap(p => p.marcas))].length}</p>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">Marcas</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {[...new Set(proveedores.flatMap(p => p.marcas))].map(m => (
              <span key={m} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProveedores.map(prov => (
          <div key={prov.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{prov.razonSocial}</h3>
                <p className="text-xs text-gray-500 font-mono">CUIT: {prov.cuit}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-400 font-medium w-16">Contacto:</span>
                <span>{prov.contacto}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{prov.telefono}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{prov.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{prov.direccion}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500 mb-2">Marcas que provee:</p>
              <div className="flex flex-wrap gap-1.5">
                {prov.marcas.map(marca => (
                  <span key={marca} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">
                    {marca}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProveedores.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No se encontraron proveedores</p>
        </div>
      )}
    </div>
  );
};

export default Proveedores;
