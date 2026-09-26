export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: 'admin' | 'operador' | 'consulta';
  area: string;
  activo: boolean;
}

export interface Toner {
  id: number;
  marca: string;
  modelo: string;
  codigo: string;
  color: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  compatibleCon: string[];
  proveedorId: number;
  precioUnitario: number;
}

export interface Impresora {
  id: number;
  marca: string;
  modelo: string;
  numeroSerie: string;
  area: string;
  estado: 'disponible' | 'en_servicio' | 'fuera_servicio';
  tonerCompatible: string;
  ultimaFechaServicio: string;
  proximoServicio: string;
}

export interface Asignacion {
  id: number;
  tonerId: number;
  tonerNombre: string;
  impresoraId: number;
  impresoraModelo: string;
  area: string;
  responsableId: number;
  responsableNombre: string;
  fechaAsignacion: string;
  observaciones: string;
}

export interface ServicioTecnico {
  id: number;
  impresoraId: number;
  impresoraModelo: string;
  tipoServicio: 'preventivo' | 'correctivo' | 'instalacion';
  descripcion: string;
  tecnicoAsignado: string;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  fechaSolicitud: string;
  fechaEstimada: string;
  fechaCompletado?: string;
  costo: number;
  observaciones: string;
}

export interface Proveedor {
  id: number;
  razonSocial: string;
  cuit: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  marcas: string[];
}

export interface Comprobante {
  id: number;
  numero: string;
  tipo: 'factura' | 'recibo' | 'orden_compra';
  proveedorId: number;
  proveedorNombre: string;
  fecha: string;
  monto: number;
  concepto: string;
  estado: 'pendiente' | 'aprobado' | 'pagado' | 'rechazado';
  observaciones: string;
}

export interface Personal {
  id: number;
  nombre: string;
  apellido: string;
  legajo: string;
  area: string;
  cargo: string;
  email: string;
  telefono: string;
  activo: boolean;
}

export interface Area {
  id: number;
  nombre: string;
  ubicacion: string;
  responsable: string;
  cantidadImpresoras: number;
}
