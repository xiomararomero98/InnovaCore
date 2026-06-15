import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKpis } from "../actions/get-kpis";
import type { Kpi } from "../interfaces/kpi.interface";
import KpiCard from "../components/KpiCard";
import { tieneRol } from "../utils/auth";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarKpis = useCallback(async () => {
    try {
      const data = await getKpis();
      setKpis(data);
    } catch (error) {
      console.error("Error cargando KPIs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarKpis();
  }, [cargarKpis]);

  const getTipoCard = (
    kpi: Kpi
  ): "proyectos" | "recursos" | "exito" | "alerta" => {
    if (kpi.nombre.toLowerCase().includes("atrasado")) return "alerta";
    if (kpi.nombre.toLowerCase().includes("completada")) return "exito";
    if (kpi.tipo === "RECURSOS") return "recursos";

    return "proyectos";
  };

  const getAccionKpi = (kpi: Kpi): (() => void) | undefined => {
    if (
      kpi.tipo === "PROYECTOS" &&
      tieneRol(["ADMINISTRADOR", "GESTOR_PROYECTOS", "DIRECTIVO"])
    ) {
      return () => navigate("/proyectos");
    }

    if (
      kpi.tipo === "RECURSOS" &&
      tieneRol(["ADMINISTRADOR", "GESTOR_PROYECTOS"])
    ) {
      return () => navigate("/recursos");
    }

    return undefined;
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">
        Vista general del estado de la organización
      </p>

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
              onClick={getAccionKpi(kpi)}
            />
          ))}
        </div>
      )}
    </div>
  );
}