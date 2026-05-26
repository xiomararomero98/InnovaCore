import { api } from "./api";
import type { Proyecto } from "../interfaces/proyecto.interface";

export async function getProyectos(): Promise<Proyecto[]> {
  const response = await api.get("/proyectos-api/proyectos");
  return response.data;
}

export async function getProyectoById(id: number): Promise<Proyecto> {
  const response = await api.get(`/proyectos-api/proyectos/${id}`);
  return response.data;
}

export async function crearProyecto(proyecto: Partial<Proyecto>): Promise<Proyecto> {
  const response = await api.post("/proyectos-api/proyectos", proyecto);
  return response.data;
}

export async function actualizarProyecto(
  id: number,
  proyecto: Partial<Proyecto>
): Promise<Proyecto> {
  const response = await api.put(`/proyectos-api/proyectos/${id}`, proyecto);
  return response.data;
}

export async function eliminarProyecto(id: number): Promise<void> {
  await api.delete(`/proyectos-api/proyectos/${id}`);
}