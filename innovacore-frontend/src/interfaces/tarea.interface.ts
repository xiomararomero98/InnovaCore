export interface ProyectoResumen {
  id: number;
  nombreProyecto?: string;
}

export interface Tarea {
  id: number;
  nombreTarea: string;
  descripcion?: string;
  fechaInicio: string;
  fechaLimite: string;
  estadoTarea: string;
  prioridad: string;
  porcentajeAvance: number;
  fechaCreacion?: string;
  fechaCambioEstado?: string;
  estadoAnterior?: string;
  idResponsable: number;
  proyecto?: ProyectoResumen;
}