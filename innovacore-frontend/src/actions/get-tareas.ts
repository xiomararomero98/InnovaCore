import { api } from "./api";
import type { Tarea } from "../interfaces/tarea.interface";

export async function getTareas(): Promise<Tarea[]> {
  const response = await api.get("/proyectos-api/tareas");
  return response.data;
}

export async function getTareasByProyecto(idProyecto: number): Promise<Tarea[]> {
  const response = await api.get(`/proyectos-api/tareas/proyecto/${idProyecto}`);
  return response.data;
}

export async function getTareaById(id: number): Promise<Tarea> {
  const response = await api.get(`/proyectos-api/tareas/${id}`);
  return response.data;
}

export async function crearTarea(tarea: Partial<Tarea>): Promise<Tarea> {
  const response = await api.post("/proyectos-api/tareas", tarea);
  return response.data;
}

export async function actualizarTarea(
  id: number,
  tarea: Partial<Tarea>
): Promise<Tarea> {
  const response = await api.put(`/proyectos-api/tareas/${id}`, tarea);
  return response.data;
}

export async function cambiarEstadoTarea(
  id: number,
  nuevoEstado: string
): Promise<Tarea> {
  const response = await api.put(
    `/proyectos-api/tareas/${id}/estado/${nuevoEstado}`
  );
  return response.data;
}

export async function eliminarTarea(id: number): Promise<void> {
  await api.delete(`/proyectos-api/tareas/${id}`);
}