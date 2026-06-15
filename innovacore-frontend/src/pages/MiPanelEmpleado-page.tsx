import { useEffect, useMemo, useState } from "react";
import { getUsuarioActual } from "../utils/auth";
import {
  getAsignacionesByEmpleado,
  type Asignacion,
} from "../actions/get-asignaciones";

const obtenerIdEmpleadoDesdeSesion = (): number | null => {
  const usuario = getUsuarioActual();

  if (!usuario) {
    return null;
  }

  const posiblesIds = [
    usuario.idEmpleado,
    usuario.empleadoId,
    usuario.empleado?.id,
    usuario.empleado?.idEmpleado,
    usuario.idUsuario,
    usuario.id,
  ];

  const idEncontrado = posiblesIds.find(
    (id) => id !== undefined && id !== null && !Number.isNaN(Number(id))
  );

  if (idEncontrado === undefined || idEncontrado === null) {
    return null;
  }

  return Number(idEncontrado);
};

const formatearFecha = (fecha: string) => {
  if (!fecha) {
    return "Sin fecha";
  }

  return new Date(fecha).toLocaleDateString("es-CL");
};

export default function MiPanelEmpleadoPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const idEmpleado = obtenerIdEmpleadoDesdeSesion();

  useEffect(() => {
    const cargarAsignaciones = async () => {
      try {
        setLoading(true);
        setError("");

        if (!idEmpleado) {
          setError(
            "No se encontró el ID del empleado en la sesión actual. Revisa que el usuario colaborador tenga un id asociado."
          );
          return;
        }

        const response = await getAsignacionesByEmpleado(idEmpleado);
        setAsignaciones(response);
      } catch (error) {
        console.error("Error cargando panel del colaborador:", error);
        setError(
          "No se pudo cargar el panel del colaborador. Revisa que ms-recursos y el API Gateway estén levantados."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarAsignaciones();
  }, [idEmpleado]);

  const asignacionesActivas = useMemo(() => {
    return asignaciones.filter(
      (asignacion) => asignacion.estado?.toUpperCase() === "ACTIVA"
    );
  }, [asignaciones]);

  const totalHorasAsignadas = useMemo(() => {
    return asignacionesActivas.reduce(
      (total, asignacion) => total + asignacion.horasAsignadas,
      0
    );
  }, [asignacionesActivas]);

  const totalProyectosAsignados = useMemo(() => {
    return new Set(asignacionesActivas.map((asignacion) => asignacion.idProyecto))
      .size;
  }, [asignacionesActivas]);

  const totalTareasAsignadas = useMemo(() => {
    return new Set(
      asignacionesActivas
        .map((asignacion) => asignacion.idTarea)
        .filter((idTarea) => idTarea !== undefined && idTarea !== null)
    ).size;
  }, [asignacionesActivas]);

  const empleado = asignaciones[0]?.empleado;

  if (loading) {
    return (
      <section className="page-section">
        <h1>Mi Panel</h1>
        <p>Cargando información del colaborador...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-section">
        <h1>Mi Panel</h1>
        <div className="alert-error">{error}</div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h1>Mi Panel</h1>
          <p>
            Resumen personal de asignaciones, proyectos, tareas y horas activas.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="kpi-card recursos">
          <div className="kpi-title">Colaborador</div>
          <div className="kpi-value" style={{ fontSize: "24px" }}>
            {empleado
              ? `${empleado.nombre} ${empleado.apellido}`
              : "Colaborador"}
          </div>
          <div className="kpi-description">
            {empleado?.cargo || "Cargo no informado"}
          </div>
        </div>

        <div className="kpi-card exito">
          <div className="kpi-title">Disponibilidad</div>
          <div className="kpi-value" style={{ fontSize: "28px" }}>
            {empleado?.disponibilidad || "Sin datos"}
          </div>
          <div className="kpi-description">
            Calculada según asignaciones activas
          </div>
        </div>

        <div className="kpi-card proyectos">
          <div className="kpi-title">Horas asignadas</div>
          <div className="kpi-value">{totalHorasAsignadas}</div>
          <div className="kpi-description">Horas activas actuales</div>
        </div>

        <div className="kpi-card alerta">
          <div className="kpi-title">Tareas asignadas</div>
          <div className="kpi-value">{totalTareasAsignadas}</div>
          <div className="kpi-description">
            Proyectos asignados: {totalProyectosAsignados}
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h2>Mis asignaciones</h2>
          <p>Listado de proyectos y tareas asignadas al colaborador.</p>
        </div>

        {asignaciones.length === 0 ? (
          <p>No tienes asignaciones registradas.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID Proyecto</th>
                <th>ID Tarea</th>
                <th>Rol</th>
                <th>Horas</th>
                <th>Estado</th>
                <th>Fecha asignación</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((asignacion) => (
                <tr key={asignacion.id}>
                  <td>{asignacion.idProyecto}</td>
                  <td>{asignacion.idTarea ?? "Proyecto completo"}</td>
                  <td>{asignacion.rolEnProyecto}</td>
                  <td>{asignacion.horasAsignadas}</td>
                  <td>{asignacion.estado}</td>
                  <td>{formatearFecha(asignacion.fechaAsignacion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}