import { api } from "./api";

export interface Asignacion {
  id: number;
  empleado: {
    id: number;
    nombre: string;
    apellido: string;
    cargo?: string;
    disponibilidad: string;
  };
  idProyecto: number;
  idTarea?: number;
  horasAsignadas: number;
  rolEnProyecto: string;
  estado: string; // ACTIVA, FINALIZADA, CANCELADA
  fechaAsignacion: string;
}

export interface AsignacionMultipleRequest {
  empleadosIds: number[];
  horasAsignadas: number;
  rolEnProyecto: string;
}

export async function getAsignacionesByProyecto(idProyecto: number): Promise<Asignacion[]> {
  const response = await api.get(`/recursos-api/asignaciones/proyecto/${idProyecto}`);
  return response.data;
}

export async function getAsignacionesByTarea(idTarea: number): Promise<Asignacion[]> {
  const response = await api.get(`/recursos-api/asignaciones/tarea/${idTarea}`);
  return response.data;
}

export async function getAsignacionesByEmpleado(idEmpleado: number): Promise<Asignacion[]> {
  const response = await api.get(`/recursos-api/asignaciones/empleado/${idEmpleado}`);
  return response.data;
}

export async function asignarEmpleadosAProyecto(
  idProyecto: number,
  request: AsignacionMultipleRequest
): Promise<Asignacion[]> {
  const response = await api.post(
    `/recursos-api/asignaciones/proyecto/${idProyecto}/multiple`,
    request
  );
  return response.data;
}

export async function asignarEmpleadosATarea(
  idProyecto: number,
  idTarea: number,
  request: AsignacionMultipleRequest
): Promise<Asignacion[]> {
  const response = await api.post(
    `/recursos-api/asignaciones/proyecto/${idProyecto}/tarea/${idTarea}/multiple`,
    request
  );
  return response.data;
}

export async function finalizarAsignacion(id: number): Promise<Asignacion> {
  const response = await api.put(`/recursos-api/asignaciones/${id}/finalizar`);
  return response.data;
}