import { api } from "./api";

export interface UsuarioSimple {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol?: {
    id: number;
    nombreRol: string;
  };
}

export async function getUsuarios(): Promise<UsuarioSimple[]> {
  const response = await api.get("/seguridad/usuarios");
  return response.data;
}

// Devuelve solo ADMINISTRADOR y GESTOR_PROYECTOS para el selector de gestor
export async function getGestores(): Promise<UsuarioSimple[]> {
  const usuarios = await getUsuarios();
  return usuarios.filter(
    (u) =>
      u.rol?.nombreRol === "GESTOR_PROYECTOS" ||
      u.rol?.nombreRol === "ADMINISTRADOR"
  );
}