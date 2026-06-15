import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getKpis, getDashboard } from "../actions/get-kpis";
import type { Kpi, Dashboard } from "../interfaces/kpi.interface";
import KpiCard from "../components/KpiCard";
import { tieneRol } from "../utils/auth";

export default function AnaliticaPage() {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    try {
      const [kpisData, dashboardData] = await Promise.all([
        getKpis(),
        getDashboard(),
      ]);

      setKpis(kpisData);
      setDashboard(dashboardData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

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
      <button
        className="btn-secondary btn-auto"
        onClick={() => navigate("/dashboard")}
      >
        ← Volver al dashboard
      </button>

      <h1 className="page-title">Analítica</h1>
      <p className="page-subtitle">
        Indicadores clave de desempeño en tiempo real
      </p>

      {loading ? (
        <div className="loading">Cargando analítica...</div>
      ) : (
        <>
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

          {dashboard && (
            <div className="table-container">
              <div className="table-header">
                <h2>Resumen General</h2>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Métrica</th>
                    <th>Valor</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td rowSpan={4}>
                      <strong>Proyectos</strong>
                    </td>
                    <td>Total de proyectos</td>
                    <td>{dashboard.totalProyectos}</td>
                  </tr>
                  <tr>
                    <td>Proyectos activos</td>
                    <td>{dashboard.proyectosActivos}</td>
                  </tr>
                  <tr>
                    <td>Proyectos atrasados</td>
                    <td>{dashboard.proyectosAtrasados}</td>
                  </tr>
                  <tr>
                    <td>Proyectos finalizados</td>
                    <td>{dashboard.proyectosFinalizados}</td>
                  </tr>

                  <tr>
                    <td rowSpan={3}>
                      <strong>Recursos</strong>
                    </td>
                    <td>Total de empleados</td>
                    <td>{dashboard.totalEmpleados}</td>
                  </tr>
                  <tr>
                    <td>Disponibles</td>
                    <td>{dashboard.empleadosDisponibles}</td>
                  </tr>
                  <tr>
                    <td>Ocupados</td>
                    <td>{dashboard.empleadosOcupados}</td>
                  </tr>

                  <tr>
                    <td rowSpan={3}>
                      <strong>Tareas</strong>
                    </td>
                    <td>Total de tareas</td>
                    <td>{dashboard.totalTareas}</td>
                  </tr>
                  <tr>
                    <td>Completadas</td>
                    <td>{dashboard.tareasCompletadas}</td>
                  </tr>
                  <tr>
                    <td>Pendientes</td>
                    <td>{dashboard.tareasPendientes}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}