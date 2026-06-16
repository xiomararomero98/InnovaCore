import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { getKpis, getDashboard } from "../actions/get-kpis";
import type { Kpi, Dashboard } from "../interfaces/kpi.interface";
import KpiCard from "../components/KpiCard";
import { tieneRol } from "../utils/auth";

type TipoCard = "proyectos" | "recursos" | "exito" | "alerta";

type ChartItem = {
  label: string;
  value: number;
  total: number;
  tipo: TipoCard;
};

type DashboardExtendido = Dashboard & {
  porcentajeAvancePromedio?: number;
  porcentajeUtilizacionRecursos?: number;
};

const limitarPorcentaje = (valor: number) => {
  if (Number.isNaN(valor)) return 0;
  return Math.min(Math.max(valor, 0), 100);
};

const calcularPorcentaje = (valor: number, total: number) => {
  if (!total || total <= 0) return 0;
  return limitarPorcentaje((valor / total) * 100);
};

function BarraAnalitica({ item }: { item: ChartItem }) {
  const porcentaje = calcularPorcentaje(item.value, item.total);

  return (
    <div className="analytics-bar-row">
      <div className="analytics-bar-info">
        <span>{item.label}</span>
        <strong>{item.value}</strong>
      </div>

      <div className="analytics-bar-track">
        <div
          className={`analytics-bar-fill analytics-${item.tipo}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      <span className="analytics-bar-percent">{porcentaje.toFixed(0)}%</span>
    </div>
  );
}

function GrupoGrafico({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: ChartItem[];
}) {
  return (
    <div className="analytics-card">
      <div className="analytics-card-header">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div className="analytics-bars">
        {items.map((item) => (
          <BarraAnalitica key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function AnaliticaPage() {
  const navigate = useNavigate();
  const reporteRef = useRef<HTMLDivElement>(null);

  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);

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

  const handleDescargarPDF = async () => {
    if (!reporteRef.current) return;

    try {
      setGenerandoPdf(true);

      const canvas = await html2canvas(reporteRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let yPosition = margin;
      let remainingHeight = imgHeight;

      pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
      remainingHeight -= pageHeight - margin * 2;

      while (remainingHeight > 0) {
        pdf.addPage();
        yPosition = margin - (imgHeight - remainingHeight);
        pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
        remainingHeight -= pageHeight - margin * 2;
      }

      const fecha = new Date().toISOString().slice(0, 10);
      pdf.save(`reporte-analitica-${fecha}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("No se pudo generar el PDF. Intenta nuevamente.");
    } finally {
      setGenerandoPdf(false);
    }
  };

  const getTipoCard = (kpi: Kpi): TipoCard => {
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

  const datosAnaliticos = useMemo(() => {
    if (!dashboard) return null;

    const data = dashboard as DashboardExtendido;

    const avancePromedio = limitarPorcentaje(
      Number(data.porcentajeAvancePromedio ?? 0)
    );

    const utilizacionRecursos = limitarPorcentaje(
      Number(
        data.porcentajeUtilizacionRecursos ??
          calcularPorcentaje(data.empleadosOcupados, data.totalEmpleados)
      )
    );

    const proyectosPlanificados = Math.max(
      data.totalProyectos -
        data.proyectosActivos -
        data.proyectosAtrasados -
        data.proyectosFinalizados,
      0
    );

    const empleadosOtros = Math.max(
      data.totalEmpleados - data.empleadosDisponibles - data.empleadosOcupados,
      0
    );

    const tareasOtras = Math.max(
      data.totalTareas - data.tareasCompletadas - data.tareasPendientes,
      0
    );

    return {
      avancePromedio,
      utilizacionRecursos,
      proyectos: [
        {
          label: "Activos",
          value: data.proyectosActivos,
          total: data.totalProyectos,
          tipo: "proyectos" as TipoCard,
        },
        {
          label: "Atrasados",
          value: data.proyectosAtrasados,
          total: data.totalProyectos,
          tipo: "alerta" as TipoCard,
        },
        {
          label: "Finalizados",
          value: data.proyectosFinalizados,
          total: data.totalProyectos,
          tipo: "exito" as TipoCard,
        },
        {
          label: "Planificados",
          value: proyectosPlanificados,
          total: data.totalProyectos,
          tipo: "recursos" as TipoCard,
        },
      ],
      recursos: [
        {
          label: "Disponibles",
          value: data.empleadosDisponibles,
          total: data.totalEmpleados,
          tipo: "exito" as TipoCard,
        },
        {
          label: "Ocupados",
          value: data.empleadosOcupados,
          total: data.totalEmpleados,
          tipo: "alerta" as TipoCard,
        },
        {
          label: "Otros",
          value: empleadosOtros,
          total: data.totalEmpleados,
          tipo: "recursos" as TipoCard,
        },
      ],
      tareas: [
        {
          label: "Completadas",
          value: data.tareasCompletadas,
          total: data.totalTareas,
          tipo: "exito" as TipoCard,
        },
        {
          label: "Pendientes",
          value: data.tareasPendientes,
          total: data.totalTareas,
          tipo: "alerta" as TipoCard,
        },
        {
          label: "En progreso / otras",
          value: tareasOtras,
          total: data.totalTareas,
          tipo: "proyectos" as TipoCard,
        },
      ],
    };
  }, [dashboard]);

  return (
    <div className="page-container">
      <div className="report-actions">
        <button
          className="btn-secondary btn-auto"
          onClick={() => navigate("/dashboard")}
        >
          ← Volver al dashboard
        </button>

        <button
          className="btn-primary btn-auto"
          onClick={handleDescargarPDF}
          disabled={generandoPdf || loading}
        >
          {generandoPdf ? "Generando PDF..." : "Descargar reporte PDF"}
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando analítica...</div>
      ) : (
        <div ref={reporteRef} className="analytics-report-area">
          <div className="analytics-hero">
            <div>
              <p className="analytics-eyebrow">Panel ejecutivo</p>
              <h1 className="page-title">Reporte de analítica</h1>
              <p className="page-subtitle">
                Indicadores clave de desempeño en tiempo real para apoyar la
                toma de decisiones.
              </p>
            </div>

            {datosAnaliticos && (
              <div className="analytics-hero-metric">
                <span>Avance promedio</span>
                <strong>{datosAnaliticos.avancePromedio.toFixed(1)}%</strong>
              </div>
            )}
          </div>

          <div className="report-meta">
            <strong>Reporte generado:</strong>{" "}
            {new Date().toLocaleDateString("es-CL")}{" "}
            {new Date().toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          <div className="kpi-grid">
            {kpis.map((kpi, index) => (
              <KpiCard
                key={`${kpi.nombre}-${index}`}
                title={kpi.nombre}
                value={kpi.valor}
                description={kpi.descripcion}
                unit={kpi.unidad}
                tipo={getTipoCard(kpi)}
                onClick={getAccionKpi(kpi)}
              />
            ))}
          </div>

          {dashboard && datosAnaliticos && (
            <>
              <div className="analytics-overview">
                <div className="analytics-card analytics-progress-card">
                  <div className="analytics-card-header">
                    <h3>Avance promedio de proyectos</h3>
                    <p>
                      Promedio calculado desde el avance automático de los
                      proyectos.
                    </p>
                  </div>

                  <div className="analytics-progress-main">
                    <div
                      className="analytics-gauge"
                      style={
                        {
                          "--progress": `${datosAnaliticos.avancePromedio}%`,
                        } as CSSProperties
                      }
                    >
                      <span>{datosAnaliticos.avancePromedio.toFixed(1)}%</span>
                    </div>

                    <div className="analytics-progress-copy">
                      <strong>
                        {datosAnaliticos.avancePromedio >= 70
                          ? "Buen avance general"
                          : datosAnaliticos.avancePromedio >= 40
                          ? "Avance moderado"
                          : "Avance bajo"}
                      </strong>
                      <p>
                        Este indicador permite detectar si los proyectos están
                        progresando según lo esperado.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="analytics-card analytics-progress-card">
                  <div className="analytics-card-header">
                    <h3>Utilización de recursos</h3>
                    <p>
                      Relación entre empleados ocupados y el total de recursos
                      registrados.
                    </p>
                  </div>

                  <div className="analytics-progress-main">
                    <div
                      className="analytics-gauge"
                      style={
                        {
                          "--progress": `${datosAnaliticos.utilizacionRecursos}%`,
                        } as CSSProperties
                      }
                    >
                      <span>
                        {datosAnaliticos.utilizacionRecursos.toFixed(1)}%
                      </span>
                    </div>

                    <div className="analytics-progress-copy">
                      <strong>
                        {datosAnaliticos.utilizacionRecursos >= 80
                          ? "Alta utilización"
                          : datosAnaliticos.utilizacionRecursos >= 40
                          ? "Utilización equilibrada"
                          : "Baja utilización"}
                      </strong>
                      <p>
                        Ayuda a visualizar carga laboral y disponibilidad del
                        equipo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="analytics-grid">
                <GrupoGrafico
                  title="Proyectos por estado"
                  description="Distribución de proyectos según su estado operativo."
                  items={datosAnaliticos.proyectos}
                />

                <GrupoGrafico
                  title="Recursos humanos"
                  description="Disponibilidad actual del equipo de trabajo."
                  items={datosAnaliticos.recursos}
                />

                <GrupoGrafico
                  title="Tareas"
                  description="Estado general de avance de las tareas registradas."
                  items={datosAnaliticos.tareas}
                />
              </div>

              <div className="table-container">
                <div className="table-header">
                  <div>
                    <h2>Resumen general</h2>
                    <p>
                      Detalle numérico de los indicadores usados en los gráficos.
                    </p>
                  </div>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}