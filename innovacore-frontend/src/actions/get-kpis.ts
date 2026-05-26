import { api } from "./api";
import type { Kpi, Dashboard } from "../interfaces/kpi.interface";

export async function getKpis(): Promise<Kpi[]> {
  const response = await api.get("/analitica/kpis");
  return response.data;
}

export async function getDashboard(): Promise<Dashboard> {
  const response = await api.get("/analitica/dashboard");
  return response.data;
}