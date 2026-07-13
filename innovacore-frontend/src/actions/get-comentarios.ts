import { api } from "./api";

export interface ComentarioTarea {
  id: number;
  contenido: string;
  idUsuario: number;
  nombreUsuario: string;
  fechaCreacion: string;
}

export async function getComentariosByTarea(idTarea: number): Promise<ComentarioTarea[]> {
  const res = await api.get(`/proyectos-api/tareas/${idTarea}/comentarios`);
  return res.data;
}

export async function crearComentario(
  idTarea: number,
  idUsuario: number,
  nombreUsuario: string,
  contenido: string
): Promise<ComentarioTarea> {
  const res = await api.post(`/proyectos-api/tareas/${idTarea}/comentarios`, {
    idUsuario,
    nombreUsuario,
    contenido,
  });
  return res.data;
}

export async function eliminarComentario(
  idTarea: number,
  idComentario: number,
  idUsuario: number
): Promise<void> {
  await api.delete(`/proyectos-api/tareas/${idTarea}/comentarios/${idComentario}?idUsuario=${idUsuario}`);
}