// Tipos para el Sistema de Control de Tóner y Equipamientos

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  permissions: string[];
  active: boolean;
  createdAt: string;
}

export interface Printer {
  id: string;
  name: string;
  location: string;
  model: string;
  department: string;
  status: 'active' | 'maintenance' | 'inactive';
  lastMaintenance: string;
  tonerLevel: number;
  tonerModel: string;
  pagesPrinted: number;
  assignedTo?: string;
}

export interface TonerInventory {
  id: string;
  model: string;
  color: 'black' | 'cyan' | 'magenta' | 'yellow';
  quantity: number;
  minStock: number;
  maxStock: number;
  location: string;
  lastRestocked: string;
  compatiblePrinters: string[];
  unitCost: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
}

export interface Purchase {
  id: string;
  supplierId: string;
  date: string;
  items: PurchaseItem[];
  total: number;
  status: 'pending' | 'received' | 'cancelled';
  notes: string;
}

export interface PurchaseItem {
  tonerModel: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Equipment {
  id: string;
  type: 'computer' | 'printer' | 'mouse' | 'keyboard' | 'monitor' | 'other';
  brand: string;
  model: string;
  serialNumber: string;
  assignedTo: string;
  department: string;
  status: 'active' | 'maintenance' | 'retired';
  purchaseDate: string;
  lastRevision: string;
  notes: string;
}

export interface Movement {
  id: string;
  type: 'install' | 'remove' | 'restock' | 'dispose';
  tonerModel: string;
  printerName: string;
  date: string;
  user: string;
  notes: string;
  quantity: number;
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'maintenance_due' | 'toner_low' | 'pc_off_hours' | 'equipment_revision';
  message: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  resolved: boolean;
  entityId?: string;
}

export interface MonitoredPC {
  id: string;
  hostname: string;
  ip: string;
  department: string;
  user: string;
  status: 'online' | 'offline' | 'off_hours';
  lastSeen: string;
  os: string;
  meshId: string;
}