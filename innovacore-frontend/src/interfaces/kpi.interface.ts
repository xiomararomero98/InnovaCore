export interface Kpi {
  nombre: string;
  descripcion: string;
  valor: number;
  unidad: string;
  tipo: string;
}

export interface Dashboard {
  totalProyectos: number;
  proyectosActivos: number;
  proyectosAtrasados: number;
  proyectosFinalizados: number;
  porcentajeAvancePromedio: number;
  totalEmpleados: number;
  empleadosDisponibles: number;
  empleadosOcupados: number;
  porcentajeUtilizacionRecursos: number;
  totalTareas: number;
  tareasCompletadas: number;
  tareasPendientes: number;
}