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