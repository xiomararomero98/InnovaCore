import { useEffect, useState } from "react";
import { getKpis } from "../actions/get-kpis";
import type { Kpi } from "../interfaces/kpi.interface";
import KpiCard from "../components/KpiCard";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarKpis();
  }, []);

  const cargarKpis = async () => {
    try {
      const data = await getKpis();
      setKpis(data);
    } catch (error) {
      console.error("Error cargando KPIs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para determinar el tipo visual del card
  const getTipoCard = (kpi: Kpi): "proyectos" | "recursos" | "exito" | "alerta" => {
    if (kpi.nombre.toLowerCase().includes("atrasado")) return "alerta";
    if (kpi.nombre.toLowerCase().includes("completada")) return "exito";
    if (kpi.tipo === "RECURSOS") return "recursos";
    return "proyectos";
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Vista general del estado de la organización</p>

      {loading ? (
        <div className="loading">Cargando indicadores...</div>
      ) : kpis.length === 0 ? (
        <div className="empty-state">
          <h3>No hay datos disponibles</h3>
          <p>Asegúrate de que los microservicios estén en ejecución.</p>
        </div>
      ) : (
        <div className="kpi-grid">
          {kpis.map((kpi, index) => (
            <KpiCard
              key={index}
              title={kpi.nombre}
              value={kpi.valor}
              description={kpi.descripcion}
              unit={kpi.unidad}
              tipo={getTipoCard(kpi)}
            />
          ))}
        </div>
      )}
    </div>
  );
}