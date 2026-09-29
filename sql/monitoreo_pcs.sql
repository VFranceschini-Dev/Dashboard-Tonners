CREATE TABLE IF NOT EXISTS monitoreo_pcs (
  id SERIAL PRIMARY KEY,
  nombre_pc TEXT NOT NULL,
  area TEXT NOT NULL,
  usuario TEXT NOT NULL,
  estado TEXT CHECK (estado IN ('encendida', 'apagada')) DEFAULT 'apagada',
  ultima_conexion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE monitoreo_pcs DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_monitoreo_pcs_estado ON monitoreo_pcs(estado);
CREATE INDEX idx_monitoreo_pcs_ultima_conexion ON monitoreo_pcs(ultima_conexion DESC);
