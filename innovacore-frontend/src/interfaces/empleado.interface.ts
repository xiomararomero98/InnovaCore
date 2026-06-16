export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  cargo?: string;
  especialidad?: string;
  disponibilidad: string;
  estado?: number;
}