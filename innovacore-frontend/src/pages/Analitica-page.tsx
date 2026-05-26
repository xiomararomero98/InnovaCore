import { useEffect, useState } from "react";
import { getKpis, getDashboard } from "../actions/get-kpis";
import type { Kpi, Dashboard } from "../interfaces/kpi.interface";
import KpiCard from "../components/KpiCard";

export default function AnaliticaPage() {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
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
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Analítica</h1>
      <p className="page-subtitle">Indicadores clave de desempeño en tiempo real</p>

      {loading ? (
        <div className="loading">Cargando analítica...</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="kpi-grid">
            {kpis.map((kpi, index) => (
              <KpiCard
                key={index}
                title={kpi.nombre}
                value={kpi.valor}
                description={kpi.descripcion}
                unit={kpi.unidad}
                tipo={kpi.tipo === "RECURSOS" ? "recursos" : "proyectos"}
              />
            ))}
          </div>

          {/* Dashboard general */}
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
                  <tr><td rowSpan={4}><strong>Proyectos</strong></td><td>Total de proyectos</td><td>{dashboard.totalProyectos}</td></tr>
                  <tr><td>Proyectos activos</td><td>{dashboard.proyectosActivos}</td></tr>
                  <tr><td>Proyectos atrasados</td><td>{dashboard.proyectosAtrasados}</td></tr>
                  <tr><td>Proyectos finalizados</td><td>{dashboard.proyectosFinalizados}</td></tr>

                  <tr><td rowSpan={3}><strong>Recursos</strong></td><td>Total de empleados</td><td>{dashboard.totalEmpleados}</td></tr>
                  <tr><td>Disponibles</td><td>{dashboard.empleadosDisponibles}</td></tr>
                  <tr><td>Ocupados</td><td>{dashboard.empleadosOcupados}</td></tr>

                  <tr><td rowSpan={3}><strong>Tareas</strong></td><td>Total de tareas</td><td>{dashboard.totalTareas}</td></tr>
                  <tr><td>Completadas</td><td>{dashboard.tareasCompletadas}</td></tr>
                  <tr><td>Pendientes</td><td>{dashboard.tareasPendientes}</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}