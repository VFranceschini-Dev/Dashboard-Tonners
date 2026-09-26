import { Usuario, Toner, Impresora, Asignacion, ServicioTecnico, Proveedor, Comprobante, Personal, Area } from '../types';

export const usuarios: Usuario[] = [
  { id: 1, nombre: 'Admin Donnet', email: 'admin@donnet.com.ar', password: 'admin123', rol: 'admin', area: 'Sistemas', activo: true },
  { id: 2, nombre: 'Carlos López', email: 'clopez@donnet.com.ar', password: 'oper123', rol: 'operador', area: 'IT', activo: true },
  { id: 3, nombre: 'María García', email: 'mgarcia@donnet.com.ar', password: 'cons123', rol: 'consulta', area: 'Administración', activo: true },
];

export const areas: Area[] = [
  { id: 1, nombre: 'Administración', ubicacion: 'Piso 1 - Of. 101', responsable: 'Juan Pérez', cantidadImpresoras: 3 },
  { id: 2, nombre: 'Recursos Humanos', ubicacion: 'Piso 1 - Of. 105', responsable: 'Ana Martínez', cantidadImpresoras: 2 },
  { id: 3, nombre: 'Contabilidad', ubicacion: 'Piso 2 - Of. 201', responsable: 'Roberto Díaz', cantidadImpresoras: 4 },
  { id: 4, nombre: 'Ventas', ubicacion: 'Piso 2 - Of. 205', responsable: 'Laura Fernández', cantidadImpresoras: 3 },
  { id: 5, nombre: 'Depósito', ubicacion: 'Planta Baja', responsable: 'Miguel Torres', cantidadImpresoras: 1 },
  { id: 6, nombre: 'Dirección', ubicacion: 'Piso 3 - Of. 301', responsable: 'Dr. Donnet', cantidadImpresoras: 2 },
];

export const toners: Toner[] = [
  { id: 1, marca: 'HP', modelo: 'CF217A', codigo: 'TN-HP-001', color: 'Negro', stockActual: 12, stockMinimo: 5, stockMaximo: 30, compatibleCon: ['HP LaserJet Pro M102w', 'HP LaserJet Pro M104w'], proveedorId: 1, precioUnitario: 4500 },
  { id: 2, marca: 'HP', modelo: 'CF219A', codigo: 'TN-HP-002', color: 'Negro', stockActual: 3, stockMinimo: 5, stockMaximo: 25, compatibleCon: ['HP LaserJet Pro M102w'], proveedorId: 1, precioUnitario: 3800 },
  { id: 3, marca: 'Brother', modelo: 'TN-2420', codigo: 'TN-BR-001', color: 'Negro', stockActual: 8, stockMinimo: 4, stockMaximo: 20, compatibleCon: ['Brother HL-L2350DW', 'Brother DCP-L2530DW'], proveedorId: 2, precioUnitario: 5200 },
  { id: 4, marca: 'Brother', modelo: 'DR-2420', codigo: 'TN-BR-002', color: 'Negro', stockActual: 2, stockMinimo: 3, stockMaximo: 15, compatibleCon: ['Brother HL-L2350DW'], proveedorId: 2, precioUnitario: 6100 },
  { id: 5, marca: 'Samsung', modelo: 'MLT-D111S', codigo: 'TN-SA-001', color: 'Negro', stockActual: 15, stockMinimo: 5, stockMaximo: 25, compatibleCon: ['Samsung Xpress M2020', 'Samsung Xpress M2070W'], proveedorId: 3, precioUnitario: 3900 },
  { id: 6, marca: 'Epson', modelo: 'T-664', codigo: 'TN-EP-001', color: 'Negro', stockActual: 6, stockMinimo: 4, stockMaximo: 20, compatibleCon: ['Epson EcoTank L3110', 'Epson EcoTank L3250'], proveedorId: 1, precioUnitario: 2800 },
  { id: 7, marca: 'Epson', modelo: 'T-664-C', codigo: 'TN-EP-002', color: 'Cian', stockActual: 1, stockMinimo: 3, stockMaximo: 15, compatibleCon: ['Epson EcoTank L3110', 'Epson EcoTank L3250'], proveedorId: 1, precioUnitario: 2800 },
  { id: 8, marca: 'Epson', modelo: 'T-664-M', codigo: 'TN-EP-003', color: 'Magenta', stockActual: 2, stockMinimo: 3, stockMaximo: 15, compatibleCon: ['Epson EcoTank L3110', 'Epson EcoTank L3250'], proveedorId: 1, precioUnitario: 2800 },
  { id: 9, marca: 'Epson', modelo: 'T-664-A', codigo: 'TN-EP-004', color: 'Amarillo', stockActual: 4, stockMinimo: 3, stockMaximo: 15, compatibleCon: ['Epson EcoTank L3110', 'Epson EcoTank L3250'], proveedorId: 1, precioUnitario: 2800 },
  { id: 10, marca: 'Canon', modelo: 'CRG-325', codigo: 'TN-CN-001', color: 'Negro', stockActual: 7, stockMinimo: 4, stockMaximo: 20, compatibleCon: ['Canon LBP-6030B', 'Canon MF3010'], proveedorId: 3, precioUnitario: 4800 },
];

export const impresoras: Impresora[] = [
  { id: 1, marca: 'HP', modelo: 'LaserJet Pro M102w', numeroSerie: 'HP-2023-001', area: 'Administración', estado: 'disponible', tonerCompatible: 'CF217A', ultimaFechaServicio: '2024-01-15', proximoServicio: '2024-07-15' },
  { id: 2, marca: 'Brother', modelo: 'HL-L2350DW', numeroSerie: 'BR-2023-002', area: 'Contabilidad', estado: 'disponible', tonerCompatible: 'TN-2420', ultimaFechaServicio: '2024-02-20', proximoServicio: '2024-08-20' },
  { id: 3, marca: 'Epson', modelo: 'EcoTank L3110', numeroSerie: 'EP-2023-003', area: 'Recursos Humanos', estado: 'disponible', tonerCompatible: 'T-664', ultimaFechaServicio: '2024-03-10', proximoServicio: '2024-09-10' },
  { id: 4, marca: 'Samsung', modelo: 'Xpress M2020', numeroSerie: 'SA-2022-004', area: 'Ventas', estado: 'en_servicio', tonerCompatible: 'MLT-D111S', ultimaFechaServicio: '2024-01-05', proximoServicio: '2024-04-05' },
  { id: 5, marca: 'Canon', modelo: 'LBP-6030B', numeroSerie: 'CN-2022-005', area: 'Dirección', estado: 'disponible', tonerCompatible: 'CRG-325', ultimaFechaServicio: '2024-02-28', proximoServicio: '2024-08-28' },
  { id: 6, marca: 'Brother', modelo: 'DCP-L2530DW', numeroSerie: 'BR-2023-006', area: 'Contabilidad', estado: 'disponible', tonerCompatible: 'TN-2420', ultimaFechaServicio: '2024-03-15', proximoServicio: '2024-09-15' },
  { id: 7, marca: 'HP', modelo: 'LaserJet Pro M104w', numeroSerie: 'HP-2023-007', area: 'Ventas', estado: 'disponible', tonerCompatible: 'CF217A', ultimaFechaServicio: '2024-01-20', proximoServicio: '2024-07-20' },
  { id: 8, marca: 'Epson', modelo: 'EcoTank L3250', numeroSerie: 'EP-2024-008', area: 'Contabilidad', estado: 'fuera_servicio', tonerCompatible: 'T-664', ultimaFechaServicio: '2023-12-01', proximoServicio: '2024-06-01' },
  { id: 9, marca: 'Brother', modelo: 'HL-L2350DW', numeroSerie: 'BR-2024-009', area: 'Depósito', estado: 'disponible', tonerCompatible: 'TN-2420', ultimaFechaServicio: '2024-03-20', proximoServicio: '2024-09-20' },
  { id: 10, marca: 'HP', modelo: 'LaserJet Pro M102w', numeroSerie: 'HP-2024-010', area: 'Administración', estado: 'disponible', tonerCompatible: 'CF217A', ultimaFechaServicio: '2024-02-10', proximoServicio: '2024-08-10' },
  { id: 11, marca: 'Canon', modelo: 'MF3010', numeroSerie: 'CN-2023-011', area: 'Recursos Humanos', estado: 'disponible', tonerCompatible: 'CRG-325', ultimaFechaServicio: '2024-01-25', proximoServicio: '2024-07-25' },
  { id: 12, marca: 'Samsung', modelo: 'Xpress M2070W', numeroSerie: 'SA-2023-012', area: 'Ventas', estado: 'disponible', tonerCompatible: 'MLT-D111S', ultimaFechaServicio: '2024-03-05', proximoServicio: '2024-09-05' },
];

export const asignaciones: Asignacion[] = [
  { id: 1, tonerId: 1, tonerNombre: 'HP CF217A', impresoraId: 1, impresoraModelo: 'HP LaserJet Pro M102w', area: 'Administración', responsableId: 2, responsableNombre: 'Carlos López', fechaAsignacion: '2024-03-15', observaciones: 'Cambio programado' },
  { id: 2, tonerId: 3, tonerNombre: 'Brother TN-2420', impresoraId: 2, impresoraModelo: 'Brother HL-L2350DW', area: 'Contabilidad', responsableId: 2, responsableNombre: 'Carlos López', fechaAsignacion: '2024-03-10', observaciones: 'Reemplazo por agotamiento' },
  { id: 3, tonerId: 6, tonerNombre: 'Epson T-664 Negro', impresoraId: 3, impresoraModelo: 'Epson EcoTank L3110', area: 'Recursos Humanos', responsableId: 2, responsableNombre: 'Carlos López', fechaAsignacion: '2024-03-08', observaciones: 'Recarga de tinta' },
  { id: 4, tonerId: 5, tonerNombre: 'Samsung MLT-D111S', impresoraId: 4, impresoraModelo: 'Samsung Xpress M2020', area: 'Ventas', responsableId: 2, responsableNombre: 'Carlos López', fechaAsignacion: '2024-02-28', observaciones: 'Cambio urgente' },
  { id: 5, tonerId: 10, tonerNombre: 'Canon CRG-325', impresoraId: 5, impresoraModelo: 'Canon LBP-6030B', area: 'Dirección', responsableId: 2, responsableNombre: 'Carlos López', fechaAsignacion: '2024-03-01', observaciones: 'Instalación nueva' },
  { id: 6, tonerId: 7, tonerNombre: 'Epson T-664 Cian', impresoraId: 3, impresoraModelo: 'Epson EcoTank L3110', area: 'Recursos Humanos', responsableId: 2, responsableNombre: 'Carlos López', fechaAsignacion: '2024-03-08', observaciones: 'Recarga de tinta' },
];

export const serviciosTecnicos: ServicioTecnico[] = [
  { id: 1, impresoraId: 4, impresoraModelo: 'Samsung Xpress M2020', tipoServicio: 'correctivo', descripcion: 'Falla en alimentación de papel', tecnicoAsignado: 'Técnico Externo - PrintService', estado: 'en_proceso', fechaSolicitud: '2024-03-18', fechaEstimada: '2024-03-22', costo: 15000, observaciones: 'Se requiere cambio de rodillo' },
  { id: 2, impresoraId: 8, impresoraModelo: 'Epson EcoTank L3250', tipoServicio: 'correctivo', descripcion: 'Cabezal de impresión obstruido', tecnicoAsignado: 'Técnico Externo - ColorPrint', estado: 'pendiente', fechaSolicitud: '2024-03-20', fechaEstimada: '2024-03-25', costo: 22000, observaciones: 'Diagnóstico pendiente' },
  { id: 3, impresoraId: 2, impresoraModelo: 'Brother HL-L2350DW', tipoServicio: 'preventivo', descripcion: 'Limpieza general y calibración', tecnicoAsignado: 'Carlos López', estado: 'completado', fechaSolicitud: '2024-02-20', fechaEstimada: '2024-02-22', fechaCompletado: '2024-02-21', costo: 5000, observaciones: 'Sin novedades' },
  { id: 4, impresoraId: 6, impresoraModelo: 'Brother DCP-L2530DW', tipoServicio: 'instalacion', descripcion: 'Configuración de red y drivers', tecnicoAsignado: 'Carlos López', estado: 'completado', fechaSolicitud: '2024-03-01', fechaEstimada: '2024-03-02', fechaCompletado: '2024-03-01', costo: 3000, observaciones: 'Instalada en red compartida' },
  { id: 5, impresoraId: 1, impresoraModelo: 'HP LaserJet Pro M102w', tipoServicio: 'preventivo', descripcion: 'Mantenimiento preventivo semestral', tecnicoAsignado: 'Carlos López', estado: 'pendiente', fechaSolicitud: '2024-03-22', fechaEstimada: '2024-03-28', costo: 4500, observaciones: 'Programado para próxima semana' },
];

export const proveedores: Proveedor[] = [
  { id: 1, razonSocial: 'Distribuidora de Insumos SRL', cuit: '30-71234567-8', contacto: 'Roberto Méndez', telefono: '011-4567-8901', email: 'ventas@disumin.com.ar', direccion: 'Av. Corrientes 1234, CABA', marcas: ['HP', 'Epson'] },
  { id: 2, razonSocial: 'TechSupply Argentina S.A.', cuit: '30-71987654-3', contacto: 'Silvia Romero', telefono: '011-4321-5678', email: 'info@techsupply.com.ar', direccion: 'Av. Rivadavia 5678, CABA', marcas: ['Brother', 'Lenovo'] },
  { id: 3, razonSocial: 'PrintMax Distribuciones', cuit: '30-71555444-2', contacto: 'Fernando Castro', telefono: '011-4789-0123', email: 'pedidos@printmax.com.ar', direccion: 'Calle San Martín 910, Córdoba', marcas: ['Samsung', 'Canon', 'Xerox'] },
];

export const comprobantes: Comprobante[] = [
  { id: 1, numero: 'FC-0001-00012345', tipo: 'factura', proveedorId: 1, proveedorNombre: 'Distribuidora de Insumos SRL', fecha: '2024-03-01', monto: 54000, concepto: 'Compra de 12 toners HP CF217A', estado: 'pagado', observaciones: '' },
  { id: 2, numero: 'FC-0001-00012346', tipo: 'factura', proveedorId: 2, proveedorNombre: 'TechSupply Argentina S.A.', fecha: '2024-03-05', monto: 41600, concepto: 'Compra de 8 toners Brother TN-2420', estado: 'aprobado', observaciones: 'Pago programado 15/04' },
  { id: 3, numero: 'OC-2024-0034', tipo: 'orden_compra', proveedorId: 3, proveedorNombre: 'PrintMax Distribuciones', fecha: '2024-03-15', monto: 27300, concepto: 'Compra de 7 toners Samsung MLT-D111S', estado: 'pendiente', observaciones: 'Aprobación de gerencia' },
  { id: 4, numero: 'FC-0003-00008901', tipo: 'factura', proveedorId: 1, proveedorNombre: 'Distribuidora de Insumos SRL', fecha: '2024-02-15', monto: 22400, concepto: 'Compra de 8 toners Epson T-664 (varios colores)', estado: 'pagado', observaciones: '' },
  { id: 5, numero: 'RB-2024-0012', tipo: 'recibo', proveedorId: 2, proveedorNombre: 'TechSupply Argentina S.A.', fecha: '2024-03-10', monto: 30500, concepto: 'Seña pedido toners Brother DR-2420', estado: 'pagado', observaciones: 'Anticipo 50%' },
  { id: 6, numero: 'FC-0003-00008902', tipo: 'factura', proveedorId: 3, proveedorNombre: 'PrintMax Distribuciones', fecha: '2024-03-20', monto: 48000, concepto: 'Compra de 10 toners Canon CRG-325', estado: 'pendiente', observaciones: 'Pendiente de recepción' },
];

export const personal: Personal[] = [
  { id: 1, nombre: 'Carlos', apellido: 'López', legajo: 'EMP-001', area: 'IT', cargo: 'Técnico IT', email: 'clopez@donnet.com.ar', telefono: '011-1234-5678', activo: true },
  { id: 2, nombre: 'María', apellido: 'García', legajo: 'EMP-002', area: 'Administración', cargo: 'Administrativa', email: 'mgarcia@donnet.com.ar', telefono: '011-2345-6789', activo: true },
  { id: 3, nombre: 'Juan', apellido: 'Pérez', legajo: 'EMP-003', area: 'Administración', cargo: 'Jefe de Administración', email: 'jperez@donnet.com.ar', telefono: '011-3456-7890', activo: true },
  { id: 4, nombre: 'Ana', apellido: 'Martínez', legajo: 'EMP-004', area: 'Recursos Humanos', cargo: 'Jefa de RRHH', email: 'amartinez@donnet.com.ar', telefono: '011-4567-8901', activo: true },
  { id: 5, nombre: 'Roberto', apellido: 'Díaz', legajo: 'EMP-005', area: 'Contabilidad', cargo: 'Contador', email: 'rdiaz@donnet.com.ar', telefono: '011-5678-9012', activo: true },
  { id: 6, nombre: 'Laura', apellido: 'Fernández', legajo: 'EMP-006', area: 'Ventas', cargo: 'Jefa de Ventas', email: 'lfernandez@donnet.com.ar', telefono: '011-6789-0123', activo: true },
  { id: 7, nombre: 'Miguel', apellido: 'Torres', legajo: 'EMP-007', area: 'Depósito', cargo: 'Encargado de Depósito', email: 'mtorres@donnet.com.ar', telefono: '011-7890-1234', activo: true },
  { id: 8, nombre: 'Sandra', apellido: 'Ruiz', legajo: 'EMP-008', area: 'IT', cargo: 'Desarrolladora', email: 'sruiz@donnet.com.ar', telefono: '011-8901-2345', activo: true },
  { id: 9, nombre: 'Diego', apellido: 'Moreno', legajo: 'EMP-009', area: 'Ventas', cargo: 'Vendedor', email: 'dmoreno@donnet.com.ar', telefono: '011-9012-3456', activo: true },
  { id: 10, nombre: 'Patricia', apellido: 'Gómez', legajo: 'EMP-010', area: 'Contabilidad', cargo: 'Asistente Contable', email: 'pgomez@donnet.com.ar', telefono: '011-0123-4567', activo: true },
];
