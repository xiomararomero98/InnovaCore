import { api } from "./api";
import type { ClienteSimple } from "../interfaces/cliente.interface";

export async function getClientes(): Promise<ClienteSimple[]> {
  const response = await api.get("/proyectos-api/clientes");
  return response.data;
}

export async function crearCliente(cliente: Partial<ClienteSimple>): Promise<ClienteSimple> {
  const response = await api.post("/proyectos-api/clientes", cliente);
  return response.data;
}

export async function actualizarCliente(id: number, cliente: Partial<ClienteSimple>): Promise<ClienteSimple> {
  const response = await api.put(`/proyectos-api/clientes/${id}`, cliente);
  return response.data;
}

export async function eliminarCliente(id: number): Promise<void> {
  await api.delete(`/proyectos-api/clientes/${id}`);
}