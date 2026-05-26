import { api } from "./api";
import type { LoginRequest, Usuario } from "../interfaces/usuario.interface";

export async function login(credentials: LoginRequest): Promise<Usuario> {
  const response = await api.post("/seguridad/usuarios/login", credentials);
  return response.data;
}