export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  estado?: string;
}