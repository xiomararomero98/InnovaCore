import { api } from "./api";
import type { Empleado } from "../interfaces/empleado.interface";

export async function getEmpleados(): Promise<Empleado[]> {
  const response = await api.get("/recursos-api/empleados");
  return response.data;
}

export async function crearEmpleado(empleado: Partial<Empleado>): Promise<Empleado> {
  const response = await api.post("/recursos-api/empleados", empleado);
  return response.data;
}

export async function actualizarEmpleado(id: number, empleado: Partial<Empleado>): Promise<Empleado> {
  const response = await api.put(`/recursos-api/empleados/${id}`, empleado);
  return response.data;
}

export async function eliminarEmpleado(id: number): Promise<void> {
  await api.delete(`/recursos-api/empleados/${id}`);
}