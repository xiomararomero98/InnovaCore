import { api } from "./api";

export type NombreRol =
  | "ADMINISTRADOR"
  | "GESTOR_PROYECTOS"
  | "COLABORADOR"
  | "DIRECTIVO";

export interface RolSimple {
  id?: number;
  nombreRol: NombreRol | string;
  descripcion?: string;
}

export interface UsuarioSimple {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  estado?: number;
  idEmpleado?: number | null;
  fechaCreacion?: string;
  rol?: RolSimple;
}

export interface CrearUsuarioRequest {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  estado?: number;
  idEmpleado?: number | null;
  rol: {
    nombreRol: NombreRol;
  };
}

export interface ActualizarUsuarioRequest {
  nombre: string;
  apellido: string;
  correo: string;
  estado?: number;
  idEmpleado?: number | null;
  rol?: {
    nombreRol: NombreRol;
  };
  contrasena?: string;
}

export async function getUsuarios(): Promise<UsuarioSimple[]> {
  const response = await api.get("/seguridad/usuarios");
  return response.data;
}

export async function getUsuarioById(id: number): Promise<UsuarioSimple> {
  const response = await api.get(`/seguridad/usuarios/${id}`);
  return response.data;
}

export async function getUsuarioByCorreo(
  correo: string
): Promise<UsuarioSimple> {
  const response = await api.get("/seguridad/usuarios/correo", {
    params: { correo },
  });

  return response.data;
}

export async function getUsuarioByEmpleado(
  idEmpleado: number
): Promise<UsuarioSimple> {
  const response = await api.get(`/seguridad/usuarios/empleado/${idEmpleado}`);
  return response.data;
}

export async function buscarUsuarioByEmpleado(
  idEmpleado: number
): Promise<UsuarioSimple | null> {
  try {
    return await getUsuarioByEmpleado(idEmpleado);
  } catch (error) {
    console.warn("Empleado sin usuario asociado:", error);
    return null;
  }
}

export async function crearUsuario(
  usuario: CrearUsuarioRequest
): Promise<UsuarioSimple> {
  const response = await api.post("/seguridad/usuarios", {
    ...usuario,
    estado: usuario.estado ?? 1,
  });

  return response.data;
}

export async function actualizarUsuario(
  id: number,
  usuario: ActualizarUsuarioRequest
): Promise<UsuarioSimple> {
  const response = await api.put(`/seguridad/usuarios/${id}`, usuario);
  return response.data;
}

export async function resetearContrasenaUsuario(
  idUsuario: number,
  nuevaContrasena: string
): Promise<UsuarioSimple> {
  const response = await api.patch(
    `/seguridad/usuarios/${idUsuario}/reset-password`,
    {
      nuevaContrasena,
    }
  );

  return response.data;
}

export async function activarUsuario(idUsuario: number): Promise<UsuarioSimple> {
  const response = await api.put(`/seguridad/usuarios/${idUsuario}/activar`);
  return response.data;
}

export async function desactivarUsuario(
  idUsuario: number
): Promise<UsuarioSimple> {
  const response = await api.put(`/seguridad/usuarios/${idUsuario}/desactivar`);
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

export async function buscarUsuarioByEmpleadoOCorreo(
  idEmpleado: number,
  correo: string
): Promise<UsuarioSimple | null> {
  try {
    return await getUsuarioByEmpleado(idEmpleado);
  } catch {
    try {
      return await getUsuarioByCorreo(correo);
    } catch (error) {
      console.warn("Empleado sin usuario asociado por idEmpleado ni correo:", error);
      return null;
    }
  }
}