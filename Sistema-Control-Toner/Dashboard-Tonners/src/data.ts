import { User, Printer, TonerInventory, Supplier, Purchase, Equipment, Movement, Alert, MonitoredPC } from './types';

export const initialUsers: User[] = [
  { id: '1', email: 'soporte@donnet.com.ar', name: 'Administrador', role: 'admin', permissions: ['all'], active: true, createdAt: '2024-01-01' },
  { id: '2', email: 'carlos@donnet.com.ar', name: 'Carlos Mendez', role: 'operator', permissions: ['printers', 'inventory', 'movements'], active: true, createdAt: '2024-02-15' },
  { id: '3', email: 'ana@donnet.com.ar', name: 'Ana Garcia', role: 'operator', permissions: ['inventory', 'purchases', 'suppliers'], active: true, createdAt: '2024-03-01' },
];

export const ADMIN_CREDENTIALS = { email: 'soporte@donnet.com.ar', password: '6mn78az39*' };

export const initialPrinters: Printer[] = [
  { id: '1', name: 'HP LaserJet Pro M404', location: 'Oficina Principal - Piso 1', model: 'HP LaserJet Pro', department: 'Administracion', status: 'active', lastMaintenance: '2024-01-15', tonerLevel: 75, tonerModel: 'CF258A', pagesPrinted: 12450, assignedTo: 'Recepcion' },
  { id: '2', name: 'Brother HL-L2350DW', location: 'Contabilidad - Piso 2', model: 'Brother HL-L2350DW', department: 'Contabilidad', status: 'active', lastMaintenance: '2024-02-20', tonerLevel: 30, tonerModel: 'TN-760', pagesPrinted: 8900, assignedTo: 'Contabilidad' },
  { id: '3', name: 'Canon imageCLASS MF269dw', location: 'RRHH - Piso 1', model: 'Canon imageCLASS', department: 'RRHH', status: 'active', lastMaintenance: '2024-03-10', tonerLevel: 90, tonerModel: '057', pagesPrinted: 5600, assignedTo: 'RRHH' },
  { id: '4', name: 'Samsung Xpress M2070W', location: 'Direccion - Piso 3', model: 'Samsung Xpress', department: 'Direccion', status: 'maintenance', lastMaintenance: '2024-01-05', tonerLevel: 15, tonerModel: 'MLT-D111S', pagesPrinted: 15200, assignedTo: 'Gerencia' },
  { id: '5', name: 'HP Color LaserJet Pro M479', location: 'Marketing - Piso 2', model: 'HP Color LaserJet', department: 'Marketing', status: 'active', lastMaintenance: '2024-02-28', tonerLevel: 55, tonerModel: 'W2020A', pagesPrinted: 9800, assignedTo: 'Diseno' },
  { id: '6', name: 'Epson EcoTank L3250', location: 'Recepcion', model: 'Epson EcoTank', department: 'Recepcion', status: 'active', lastMaintenance: '2024-03-15', tonerLevel: 60, tonerModel: 'T544', pagesPrinted: 3200, assignedTo: 'Recepcion' },
];

export const initialSuppliers: Supplier[] = [
  { id: '1', name: 'TechSupply SRL', contact: 'Juan Perez', email: 'ventas@techsupply.com', phone: '+54 11 4567-8901', address: 'Av. Corrientes 1234, CABA', active: true },
  { id: '2', name: 'PrintMax SA', contact: 'Maria Lopez', email: 'info@printmax.com', phone: '+54 11 5678-9012', address: 'Av. Rivadavia 5678, CABA', active: true },
  { id: '3', name: 'Insumos Office', contact: 'Pedro Rodriguez', email: 'pedro@insumosoffice.com', phone: '+54 11 6789-0123', address: 'San Martin 910, CABA', active: true },
  { id: '4', name: 'Digital Solutions', contact: 'Laura Martinez', email: 'laura@digitalsolutions.com', phone: '+54 11 7890-1234', address: 'Florida 1516, CABA', active: true },
];

export const initialInventory: TonerInventory[] = [
  { id: '1', model: 'CF258A', color: 'black', quantity: 8, minStock: 3, maxStock: 15, location: 'Almacen A - Estante 1', lastRestocked: '2024-03-01', compatiblePrinters: ['HP LaserJet Pro M404'], unitCost: 85, supplierId: '1' },
  { id: '2', model: 'TN-760', color: 'black', quantity: 2, minStock: 3, maxStock: 12, location: 'Almacen A - Estante 2', lastRestocked: '2024-02-15', compatiblePrinters: ['Brother HL-L2350DW'], unitCost: 65, supplierId: '1' },
  { id: '3', model: '057', color: 'black', quantity: 5, minStock: 2, maxStock: 10, location: 'Almacen B - Estante 1', lastRestocked: '2024-03-10', compatiblePrinters: ['Canon imageCLASS MF269dw'], unitCost: 72, supplierId: '2' },
  { id: '4', model: 'MLT-D111S', color: 'black', quantity: 1, minStock: 2, maxStock: 8, location: 'Almacen B - Estante 2', lastRestocked: '2024-01-20', compatiblePrinters: ['Samsung Xpress M2070W'], unitCost: 45, supplierId: '2' },
  { id: '5', model: 'W2020A', color: 'black', quantity: 4, minStock: 2, maxStock: 10, location: 'Almacen A - Estante 3', lastRestocked: '2024-02-28', compatiblePrinters: ['HP Color LaserJet Pro M479'], unitCost: 95, supplierId: '3' },
  { id: '6', model: 'W2021A', color: 'cyan', quantity: 3, minStock: 2, maxStock: 8, location: 'Almacen A - Estante 3', lastRestocked: '2024-02-28', compatiblePrinters: ['HP Color LaserJet Pro M479'], unitCost: 105, supplierId: '3' },
  { id: '7', model: 'W2022A', color: 'yellow', quantity: 3, minStock: 2, maxStock: 8, location: 'Almacen A - Estante 3', lastRestocked: '2024-02-28', compatiblePrinters: ['HP Color LaserJet Pro M479'], unitCost: 105, supplierId: '3' },
  { id: '8', model: 'W2023A', color: 'magenta', quantity: 2, minStock: 2, maxStock: 8, location: 'Almacen A - Estante 3', lastRestocked: '2024-02-28', compatiblePrinters: ['HP Color LaserJet Pro M479'], unitCost: 105, supplierId: '3' },
  { id: '9', model: 'T544', color: 'black', quantity: 6, minStock: 3, maxStock: 15, location: 'Almacen C - Estante 1', lastRestocked: '2024-03-12', compatiblePrinters: ['Epson EcoTank L3250'], unitCost: 12, supplierId: '4' },
];

export const initialPurchases: Purchase[] = [
  { id: '1', supplierId: '1', date: '2024-03-15', items: [{ tonerModel: 'CF258A', quantity: 10, unitCost: 85, total: 850 }, { tonerModel: 'TN-760', quantity: 5, unitCost: 65, total: 325 }], total: 1175, status: 'received', notes: 'Pedido urgente para reposicion' },
  { id: '2', supplierId: '2', date: '2024-03-10', items: [{ tonerModel: '057', quantity: 8, unitCost: 72, total: 576 }], total: 576, status: 'received', notes: 'Reabastecimiento trimestral' },
  { id: '3', supplierId: '3', date: '2024-03-20', items: [{ tonerModel: 'W2020A', quantity: 6, unitCost: 95, total: 570 }, { tonerModel: 'W2021A', quantity: 4, unitCost: 105, total: 420 }], total: 990, status: 'pending', notes: 'Pedido color para marketing' },
];

export const initialEquipment: Equipment[] = [
  { id: '1', type: 'computer', brand: 'Dell', model: 'OptiPlex 7090', serialNumber: 'DL-2024-001', assignedTo: 'Juan Perez', department: 'Administracion', status: 'active', purchaseDate: '2024-01-10', lastRevision: '2024-03-01', notes: 'Equipo principal' },
  { id: '2', type: 'computer', brand: 'HP', model: 'ProDesk 400 G7', serialNumber: 'HP-2024-002', assignedTo: 'Maria Lopez', department: 'Contabilidad', status: 'active', purchaseDate: '2024-01-15', lastRevision: '2024-02-20', notes: '' },
  { id: '3', type: 'printer', brand: 'HP', model: 'LaserJet Pro M404', serialNumber: 'HP-PR-001', assignedTo: 'Recepcion', department: 'Recepcion', status: 'active', purchaseDate: '2023-06-15', lastRevision: '2024-01-15', notes: 'Uso compartido' },
  { id: '4', type: 'mouse', brand: 'Logitech', model: 'M185', serialNumber: 'LG-M-001', assignedTo: 'Juan Perez', department: 'Administracion', status: 'active', purchaseDate: '2024-02-01', lastRevision: '2024-02-01', notes: '' },
  { id: '5', type: 'keyboard', brand: 'Logitech', model: 'K120', serialNumber: 'LG-K-001', assignedTo: 'Juan Perez', department: 'Administracion', status: 'active', purchaseDate: '2024-02-01', lastRevision: '2024-02-01', notes: '' },
  { id: '6', type: 'monitor', brand: 'Samsung', model: 'S24R650', serialNumber: 'SM-M-001', assignedTo: 'Maria Lopez', department: 'Contabilidad', status: 'active', purchaseDate: '2024-01-20', lastRevision: '2024-01-20', notes: '24 pulgadas' },
  { id: '7', type: 'computer', brand: 'Lenovo', model: 'ThinkCentre M70q', serialNumber: 'LN-2024-003', assignedTo: 'Pedro Garcia', department: 'IT', status: 'maintenance', purchaseDate: '2023-11-10', lastRevision: '2024-03-15', notes: 'En revision tecnica' },
];

export const initialMovements: Movement[] = [
  { id: '1', type: 'install', tonerModel: 'CF258A', printerName: 'HP LaserJet Pro M404', date: '2024-03-15', user: 'Carlos Mendez', notes: 'Instalacion de toner nuevo', quantity: 1 },
  { id: '2', type: 'restock', tonerModel: 'TN-760', printerName: '-', date: '2024-03-14', user: 'Ana Garcia', notes: 'Reabastecimiento desde proveedor', quantity: 5 },
  { id: '3', type: 'remove', tonerModel: 'MLT-D111S', printerName: 'Samsung Xpress M2070W', date: '2024-03-12', user: 'Carlos Mendez', notes: 'Retiro por agotamiento', quantity: 1 },
  { id: '4', type: 'install', tonerModel: '057', printerName: 'Canon imageCLASS MF269dw', date: '2024-03-10', user: 'Pedro Lopez', notes: 'Cambio programado', quantity: 1 },
  { id: '5', type: 'restock', tonerModel: 'W2020A', printerName: '-', date: '2024-03-08', user: 'Ana Garcia', notes: 'Pedido #4521', quantity: 4 },
];

export const initialAlerts: Alert[] = [
  { id: '1', type: 'low_stock', message: 'Stock bajo: TN-760 (2 unidades, minimo: 3)', severity: 'high', date: '2024-03-15', resolved: false },
  { id: '2', type: 'toner_low', message: 'Nivel bajo de toner: Samsung Xpress M2070W (15%)', severity: 'high', date: '2024-03-14', resolved: false },
  { id: '3', type: 'maintenance_due', message: 'Mantenimiento proximo: Samsung Xpress M2070W', severity: 'medium', date: '2024-03-13', resolved: false },
  { id: '4', type: 'low_stock', message: 'Stock bajo: MLT-D111S (1 unidad, minimo: 2)', severity: 'high', date: '2024-03-12', resolved: false },
  { id: '5', type: 'pc_off_hours', message: 'PC encendida fuera de horario: DL-2024-001 (Administracion)', severity: 'medium', date: '2024-03-15', resolved: false, entityId: '1' },
  { id: '6', type: 'pc_off_hours', message: 'PC encendida fuera de horario: HP-2024-002 (Contabilidad)', severity: 'medium', date: '2024-03-14', resolved: false, entityId: '2' },
  { id: '7', type: 'equipment_revision', message: 'Revision tecnica necesaria: Lenovo ThinkCentre M70q (IT)', severity: 'medium', date: '2024-03-15', resolved: false, entityId: '7' },
];

export const initialMonitoredPCs: MonitoredPC[] = [
  { id: '1', hostname: 'ADMIN-PC01', ip: '192.168.1.101', department: 'Administracion', user: 'Juan Perez', status: 'off_hours', lastSeen: '2024-03-15 22:30', os: 'Windows 11 Pro', meshId: 'mesh-001' },
  { id: '2', hostname: 'CONT-PC02', ip: '192.168.1.102', department: 'Contabilidad', user: 'Maria Lopez', status: 'off_hours', lastSeen: '2024-03-15 21:45', os: 'Windows 11 Pro', meshId: 'mesh-002' },
  { id: '3', hostname: 'RRHH-PC03', ip: '192.168.1.103', department: 'RRHH', user: 'Ana Garcia', status: 'online', lastSeen: '2024-03-15 17:30', os: 'Windows 10 Pro', meshId: 'mesh-003' },
  { id: '4', hostname: 'IT-PC04', ip: '192.168.1.104', department: 'IT', user: 'Pedro Garcia', status: 'online', lastSeen: '2024-03-15 18:00', os: 'Windows 11 Pro', meshId: 'mesh-004' },
  { id: '5', hostname: 'MKT-PC05', ip: '192.168.1.105', department: 'Marketing', user: 'Laura Martinez', status: 'offline', lastSeen: '2024-03-15 17:00', os: 'Windows 11 Pro', meshId: 'mesh-005' },
  { id: '6', hostname: 'DIR-PC06', ip: '192.168.1.106', department: 'Direccion', user: 'Roberto Sanchez', status: 'online', lastSeen: '2024-03-15 17:45', os: 'Windows 11 Pro', meshId: 'mesh-006' },
  { id: '7', hostname: 'REC-PC07', ip: '192.168.1.107', department: 'Recepcion', user: 'Carmen Diaz', status: 'offline', lastSeen: '2024-03-15 16:30', os: 'Windows 10 Pro', meshId: 'mesh-007' },
];