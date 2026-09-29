INSERT INTO monitoreo_pcs (nombre_pc, area, usuario, estado, ultima_conexion, ip_address) VALUES
('PC-CONTABILIDAD-01', 'Contabilidad', 'María García', 'encendida', NOW() - INTERVAL '30 minutes', '192.168.1.101'),
('PC-VENTAS-03', 'Ventas', 'Diego Moreno', 'encendida', NOW() - INTERVAL '1 hour', '192.168.1.102'),
('PC-DIRECCION-01', 'Dirección', 'Dr. Donnet', 'encendida', NOW() - INTERVAL '2 hours', '192.168.1.103'),
('PC-RRHH-02', 'Recursos Humanos', 'Ana Martínez', 'encendida', NOW() - INTERVAL '45 minutes', '192.168.1.104'),
('PC-IT-01', 'IT', 'Carlos López', 'encendida', NOW() - INTERVAL '15 minutes', '192.168.1.105');

INSERT INTO monitoreo_pcs (nombre_pc, area, usuario, estado, ultima_conexion, ip_address) VALUES
('PC-CONTABILIDAD-02', 'Contabilidad', 'Patricia Gómez', 'apagada', NOW() - INTERVAL '12 hours', '192.168.1.106'),
('PC-VENTAS-01', 'Ventas', 'Laura Fernández', 'apagada', NOW() - INTERVAL '10 hours', '192.168.1.107'),
('PC-DEPOSITO-01', 'Depósito', 'Miguel Torres', 'apagada', NOW() - INTERVAL '8 hours