import React, { useState } from 'react';
import { BookOpen, Server, Database, Shield, Globe, Terminal, CheckCircle, ChevronDown, ChevronRight, Copy, ExternalLink } from 'lucide-react';

const GuiaImplementacion: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('arquitectura');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language = 'bash' }) => (
    <div className="relative group">
      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm text-green-400 font-mono whitespace-pre">{code}</pre>
      </div>
      <button
        onClick={() => copyToClipboard(code)}
        className="absolute top-2 right-2 p-1.5 bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
        title="Copiar"
      >
        <Copy className="w-3.5 h-3.5 text-gray-300" />
      </button>
      <span className="absolute top-2 left-3 text-xs text-gray-500 font-mono">{language}</span>
    </div>
  );

  const AccordionSection: React.FC<{ id: string; title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ id, title, icon, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        {openSection === id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </button>
      {openSection === id && (
        <div className="p-4 pt-0 border-t border-gray-100">
          <div className="pt-4 space-y-4">{children}</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Guía de Implementación</h2>
        </div>
        <p className="text-blue-100">
          Instrucciones completas para desplegar el Sistema de Gestión de Toners de Donnet S.A. en un entorno de producción.
        </p>
      </div>

      {/* Quick Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Resumen del Sistema</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-blue-700"><strong>Frontend:</strong> React 18 + TypeScript + Vite</p>
            <p className="text-blue-700"><strong>Estilos:</strong> Tailwind CSS 4</p>
            <p className="text-blue-700"><strong>Iconos:</strong> Lucide React</p>
          </div>
          <div>
            <p className="text-blue-700"><strong>Backend sugerido:</strong> Node.js + Express o Python + FastAPI</p>
            <p className="text-blue-700"><strong>Base de datos:</strong> PostgreSQL o MySQL</p>
            <p className="text-blue-700"><strong>Hosting:</strong> Vercel, Netlify o servidor propio</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <AccordionSection id="arquitectura" title="1. Arquitectura del Sistema" icon={<Server className="w-5 h-5 text-blue-600" />}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">El sistema está diseñado con una arquitectura de tres capas:</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-700">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Capa de Presentación (Frontend)</p>
                    <p className="text-sm text-gray-600">React + TypeScript con componentes modulares, routing por estado y diseño responsive.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-green-700">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Capa de Lógica de Negocio (API)</p>
                    <p className="text-sm text-gray-600">Servidor REST que maneja autenticación JWT, validaciones y reglas de negocio.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-purple-700">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Capa de Datos (Base de Datos)</p>
                    <p className="text-sm text-gray-600">PostgreSQL/MySQL con tablas normalizadas para cada entidad del sistema.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Actualmente el sistema funciona con datos simulados (mock). Para producción se debe conectar a un backend real con base de datos.
              </p>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection id="requisitos" title="2. Requisitos Previos" icon={<Terminal className="w-5 h-5 text-green-600" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Antes de implementar, asegúrate de tener instalado:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm"><strong>Node.js</strong> v18 o superior</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm"><strong>npm</strong> v9+ o <strong>yarn</strong> v1.22+</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm"><strong>Git</strong> para control de versiones</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm"><strong>Servidor web:</strong> Nginx, Apache o servicio de hosting estático</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm"><strong>Base de datos:</strong> PostgreSQL 14+ o MySQL 8+</span>
              </div>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection id="instalacion" title="3. Instalación Local (Desarrollo)" icon={<Terminal className="w-5 h-5 text-orange-600" />}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Pasos para ejecutar el proyecto en tu máquina local:</p>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Paso 1: Clonar o copiar el proyecto</p>
              <CodeBlock code={`# Si usas Git:
git clone https://tu-repositorio/donnet-toners.git
cd donnet-toners

# O simplemente copiar los archivos del proyecto`} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Paso 2: Instalar dependencias</p>
              <CodeBlock code={`npm install`} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Paso 3: Ejecutar en modo desarrollo</p>
              <CodeBlock code={`npm run dev`} language="bash" />
              <p className="text-xs text-gray-500 mt-2">El sistema estará disponible en http://localhost:5173</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Paso 4: Generar build de producción</p>
              <CodeBlock code={`npm run build`} />
              <p className="text-xs text-gray-500 mt-2">Los archivos optimizados se generan en la carpeta <code className="bg-gray-100 px-1 rounded">dist/</code></p>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection id="backend" title="4. Backend y Base de Datos" icon={<Database className="w-5 h-5 text-purple-600" />}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Para convertir el sistema en una aplicación completa con persistencia de datos:</p>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Estructura de Base de Datos sugerida:</p>
              <CodeBlock code={`-- Tablas principales del sistema
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) CHECK (rol IN ('admin','operador','consulta')),
  area VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE toners (
  id SERIAL PRIMARY KEY,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  color VARCHAR(20),
  stock_actual INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 5,
  stock_maximo INTEGER DEFAULT 30,
  proveedor_id INTEGER REFERENCES proveedores(id),
  precio_unitario DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE impresoras (
  id SERIAL PRIMARY KEY,
  marca VARCHAR(50),
  modelo VARCHAR(100),
  numero_serie VARCHAR(100) UNIQUE,
  area VARCHAR(50),
  estado VARCHAR(20) CHECK (estado IN ('disponible','en_servicio','fuera_servicio')),
  toner_compatible VARCHAR(100),
  ultima_fecha_servicio DATE,
  proximo_servicio DATE
);

CREATE TABLE asignaciones (
  id SERIAL PRIMARY KEY,
  toner_id INTEGER REFERENCES toners(id),
  impresora_id INTEGER REFERENCES impresoras(id),
  area VARCHAR(50),
  responsable_id INTEGER REFERENCES usuarios(id),
  fecha_asignacion DATE,
  observaciones TEXT
);

CREATE TABLE servicios_tecnicos (
  id SERIAL PRIMARY KEY,
  impresora_id INTEGER REFERENCES impresoras(id),
  tipo_servicio VARCHAR(20),
  descripcion TEXT,
  tecnico_asignado VARCHAR(100),
  estado VARCHAR(20),
  fecha_solicitud DATE,
  fecha_estimada DATE,
  fecha_completado DATE,
  costo DECIMAL(10,2)
);

CREATE TABLE proveedores (
  id SERIAL PRIMARY KEY,
  razon_social VARCHAR(200),
  cuit VARCHAR(20),
  contacto VARCHAR(100),
  telefono VARCHAR(30),
  email VARCHAR(150),
  direccion TEXT
);

CREATE TABLE comprobantes (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(50),
  tipo VARCHAR(20),
  proveedor_id INTEGER REFERENCES proveedores(id),
  fecha DATE,
  monto DECIMAL(12,2),
  concepto TEXT,
  estado VARCHAR(20)
);

CREATE TABLE personal (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  legajo VARCHAR(20) UNIQUE,
  area VARCHAR(50),
  cargo VARCHAR(100),
  email VARCHAR(150),
  telefono VARCHAR(30),
  activo BOOLEAN DEFAULT true
);`} language="sql" />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">API REST sugerida (Node.js + Express):</p>
              <CodeBlock code={`// Estructura de endpoints
GET    /api/auth/login          → Login
POST   /api/auth/logout         → Logout
GET    /api/toners              → Listar toners
POST   /api/toners              → Crear toner
PUT    /api/toners/:id          → Actualizar toner
DELETE /api/toners/:id          → Eliminar toner
GET    /api/toners/alertas      → Toners bajo stock mínimo
GET    /api/impresoras          → Listar impresoras
POST   /api/impresoras          → Crear impresora
GET    /api/asignaciones        → Listar asignaciones
POST   /api/asignaciones        → Registrar asignación
GET    /api/servicios           → Listar servicios técnicos
POST   /api/servicios           → Crear servicio técnico
GET    /api/proveedores         → Listar proveedores
GET    /api/comprobantes        → Listar comprobantes
POST   /api/comprobantes        → Crear comprobante
GET    /api/personal            → Listar personal
GET    /api/dashboard/stats     → Estadísticas del dashboard`} language="javascript" />
            </div>
          </div>
        </AccordionSection>

        <AccordionSection id="auth" title="5. Sistema de Autenticación" icon={<Shield className="w-5 h-5 text-red-600" />}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">El sistema implementa 3 niveles de permisos:</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-600 border-b">Módulo</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600 border-b">Admin</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600 border-b">Operador</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600 border-b">Consulta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="px-3 py-2">Dashboard</td><td className="text-center">✅</td><td className="text-center">✅</td><td className="text-center">✅</td></tr>
                  <tr><td className="px-3 py-2">Toners</td><td className="text-center">✅ Ver</td><td className="text-center">✅ Ver</td><td className="text-center">✅ Ver</td></tr>
                  <tr><td className="px-3 py-2">Impresoras</td><td className="text-center">✅ CRUD</td><td className="text-center">✅ CRUD</td><td className="text-center">✅ Ver</td></tr>
                  <tr><td className="px-3 py-2">Asignaciones</td><td className="text-center">✅ CRUD</td><td className="text-center">✅ CRUD</td><td className="text-center">❌</td></tr>
                  <tr><td className="px-3 py-2">Servicios Técnicos</td><td className="text-center">✅ CRUD</td><td className="text-center">✅ CRUD</td><td className="text-center">✅ Ver</td></tr>
                  <tr><td className="px-3 py-2">Personal</td><td className="text-center">✅ CRUD</td><td className="text-center">✅ CRUD</td><td className="text-center">❌</td></tr>
                  <tr><td className="px-3 py-2">Proveedores</td><td className="text-center">✅ CRUD</td><td className="text-center">✅ Ver</td><td className="text-center">✅ Ver</td></tr>
                  <tr><td className="px-3 py-2">Comprobantes</td><td className="text-center">✅ CRUD</td><td className="text-center">✅ CRUD</td><td className="text-center">❌</td></tr>
                </tbody>
              </table>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Implementación de JWT para producción:</p>
              <CodeBlock code={`// Backend: Generar token JWT
const jwt = require('jsonwebtoken');

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, activo: true });
  
  if (!user || !await bcrypt.compare(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  
  const token = jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  
  res.json({ token, user: { id: user.id, nombre: user.nombre, rol: user.rol } });
});`} language="javascript" />
            </div>
          </div>
        </AccordionSection>

        <AccordionSection id="deploy" title="6. Opciones de Despliegue" icon={<Globe className="w-5 h-5 text-teal-600" />}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Opciones para poner el sistema en producción:</p>

            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">🅰️ Opción A: Hosting Estático (Solo Frontend)</h4>
                <p className="text-sm text-gray-600 mb-2">Ideal si ya tenés un backend separado o querés empezar rápido.</p>
                <CodeBlock code={`# Opción 1: Vercel (Recomendado)
npm install -g vercel
vercel

# Opción 2: Netlify
npm run build
# Subir la carpeta dist/ a Netlify

# Opción 3: Servidor propio con Nginx
sudo cp -r dist/* /var/www/donnet-toners/`} />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">🅱️ Opción B: Servidor Completo (Frontend + Backend)</h4>
                <p className="text-sm text-gray-600 mb-2">Para una implementación completa con base de datos.</p>
                <CodeBlock code={`# En servidor Linux (Ubuntu/Debian)

# 1. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# 3. Configurar Nginx como reverse proxy
sudo nano /etc/nginx/sites-available/donnet

# 4. Configurar PM2 para mantener el backend activo
npm install -g pm2
pm2 start server.js --name donnet-api
pm2 startup
pm2 save`} />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">🅲️ Opción C: Docker (Contenedores)</h4>
                <p className="text-sm text-gray-600 mb-2">Para facilitar el despliegue y la escalabilidad.</p>
                <CodeBlock code={`# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/donnet
      - JWT_SECRET=tu_secret_aqui
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=donnet
      - POSTGRES_USER=donnet_user
      - POSTGRES_PASSWORD=tu_password
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`} language="yaml" />
              </div>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection id="nginx" title="7. Configuración Nginx" icon={<Server className="w-5 h-5 text-gray-600" />}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Configuración recomendada para Nginx:</p>
            <CodeBlock code={`server {
    listen 80;
    server_name toners.donnet.com.ar;
    
    # Frontend (archivos estáticos)
    root /var/www/donnet-toners/dist;
    index index.html;
    
    # SPA routing - redirigir todo a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API Backend (proxy)
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}`} language="nginx" />
          </div>
        </AccordionSection>

        <AccordionSection id="credenciales" title="8. Credenciales de Acceso (Demo)" icon={<Shield className="w-5 h-5 text-indigo-600" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Usuarios disponibles en la versión demo del sistema:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-600 border-b">Rol</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600 border-b">Email</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600 border-b">Contraseña</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-3 py-2"><span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">Admin</span></td>
                    <td className="px-3 py-2 font-mono text-xs">admin@donnet.com.ar</td>
                    <td className="px-3 py-2 font-mono text-xs">admin123</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2"><span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Operador</span></td>
                    <td className="px-3 py-2 font-mono text-xs">clopez@donnet.com.ar</td>
                    <td className="px-3 py-2 font-mono text-xs">oper123</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2"><span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Consulta</span></td>
                    <td className="px-3 py-2 font-mono text-xs">mgarcia@donnet.com.ar</td>
                    <td className="px-3 py-2 font-mono text-xs">cons123</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                <strong>⚠️ Importante:</strong> Estas credenciales son solo para la versión demo. En producción se deben usar contraseñas seguras con hash bcrypt y autenticación JWT.
              </p>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection id="roadmap" title="9. Próximas Mejoras Sugeridas" icon={<CheckCircle className="w-5 h-5 text-green-600" />}>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">🔔 Notificaciones por Email</p>
                <p className="text-xs text-gray-500">Alertas automáticas cuando el stock llega al mínimo</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">📊 Reportes PDF/Excel</p>
                <p className="text-xs text-gray-500">Exportar datos para auditorías y análisis</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">📱 App Mobile (PWA)</p>
                <p className="text-xs text-gray-500">Acceso desde celular para técnicos en campo</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">📷 Escaneo de Códigos</p>
                <p className="text-xs text-gray-500">Leer códigos de barra de toners con la cámara</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">📈 Gráficos Avanzados</p>
                <p className="text-xs text-gray-500">Dashboard con tendencias de consumo por área</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">🔗 Integración con AFIP</p>
                <p className="text-xs text-gray-500">Validación automática de comprobantes fiscales</p>
              </div>
            </div>
          </div>
        </AccordionSection>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600">
          <strong>Donnet S.A.</strong> — Sistema de Gestión de Toners v1.0
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Desarrollado con React + TypeScript + Tailwind CSS
        </p>
      </div>
    </div>
  );
};

export default GuiaImplementacion;
