import { api } from "./api";
import type { Empleado } from "../interfaces/empleado.interface";

export async function getEmpleados(): Promise<Empleado[]> {
  const response = await api.get("/recursos-api/empleados");
  return response.data;
}