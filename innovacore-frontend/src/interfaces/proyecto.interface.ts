export interface Cliente {
  id: number;
  nombreCliente: string;
  rubro?: string;
  correoContacto?: string;
  telefono?: string;
}

export interface Proyecto {
  id: number;
  nombreProyecto: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  estadoProyecto: string;
  prioridad: string;
  porcentajeAvance: number;
  idGestor: number;
  cliente?: Cliente;
}