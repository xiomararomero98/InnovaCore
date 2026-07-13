import { useCallback, useEffect, useMemo, useState } from "react";
import { getUsuarioActual } from "../utils/auth";

import {
  getAsignacionesByEmpleado,
  type Asignacion,
} from "../actions/get-asignaciones";

import { getProyectoById } from "../actions/get-proyectos";

import {
  getTareasByProyecto,
  cambiarEstadoTarea,
} from "../actions/get-tareas";

import type { Proyecto } from "../interfaces/proyecto.interface";
import type { Tarea } from "../interfaces/tarea.interface";
import ComentariosTarea from "../components/ComentariosTarea";

type EstadoTarea = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";

type TareaAsignada = {
  asignacion: Asignacion;
  tarea: Tarea;
  proyecto?: Proyecto;
};

type ProyectoAsignado = {
  idProyecto: number;
  proyecto?: Proyecto;
  horasTotales: number;
  rol: string;
  tieneAsignacionGeneral: boolean;
  cantidadTareas: number;
  fechaAsignacion?: string;
};

type AgrupacionHorasProyecto = {
  idProyecto: number;
  proyecto?: Proyecto;
  rol: string;
  horasProyectoCompleto: number;
  horasTareas: number;
  tieneAsignacionGeneral: boolean;
  cantidadTareas: number;
  fechaAsignacion?: string;
};

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

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "Sin fecha";
  return new Date(fecha).toLocaleDateString("es-CL");
};

const getBadgeClass = (valor?: string) => {
  if (!valor) return "badge";
  return `badge badge-${valor.toLowerCase()}`;
};

export default function MiPanelEmpleadoPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [proyectos, setProyectos] = useState<Record<number, Proyecto>>({});
  const [tareasAsignadas, setTareasAsignadas] = useState<TareaAsignada[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualizandoTarea, setActualizandoTarea] = useState<number | null>(
    null
  );
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const idEmpleado = obtenerIdEmpleadoDesdeSesion();

  const cargarPanel = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setMensaje("");

      if (!idEmpleado) {
        setError(
          "No se encontró el ID del empleado en la sesión actual. Revisa que el usuario colaborador tenga idEmpleado asociado."
        );
        return;
      }

      const asignacionesResponse = await getAsignacionesByEmpleado(idEmpleado);
      setAsignaciones(asignacionesResponse);

      const asignacionesActivasResponse = asignacionesResponse.filter(
        (asignacion) => asignacion.estado?.toUpperCase() === "ACTIVA"
      );

      const idsProyecto = Array.from(
        new Set(
          asignacionesActivasResponse.map(
            (asignacion) => asignacion.idProyecto
          )
        )
      );

      const proyectosResponse = await Promise.all(
        idsProyecto.map(async (idProyecto) => {
          const proyecto = await getProyectoById(idProyecto);
          return { idProyecto, proyecto };
        })
      );

      const proyectosMap: Record<number, Proyecto> = {};

      proyectosResponse.forEach(({ idProyecto, proyecto }) => {
        proyectosMap[idProyecto] = proyecto;
      });

      setProyectos(proyectosMap);

      const tareasPorProyecto = await Promise.all(
        idsProyecto.map(async (idProyecto) => {
          const tareas = await getTareasByProyecto(idProyecto);
          return {
            idProyecto,
            tareas,
          };
        })
      );

      const asignacionesConTarea = asignacionesActivasResponse.filter(
        (asignacion) =>
          asignacion.idTarea !== undefined && asignacion.idTarea !== null
      );

      const tareasRelacionadas: TareaAsignada[] = [];

      asignacionesConTarea.forEach((asignacion) => {
        const grupoProyecto = tareasPorProyecto.find(
          (grupo) => grupo.idProyecto === asignacion.idProyecto
        );

        const tareaEncontrada = grupoProyecto?.tareas.find(
          (tarea) => tarea.id === asignacion.idTarea
        );

        if (tareaEncontrada) {
          tareasRelacionadas.push({
            asignacion,
            tarea: tareaEncontrada,
            proyecto: proyectosMap[asignacion.idProyecto],
          });
        }
      });

      setTareasAsignadas(tareasRelacionadas);
    } catch (error) {
      console.error("Error cargando panel del colaborador:", error);
      setError(
        "No se pudo cargar el panel del colaborador. Revisa que los microservicios y el API Gateway estén levantados."
      );
    } finally {
      setLoading(false);
    }
  }, [idEmpleado]);

  useEffect(() => {
    cargarPanel();
  }, [cargarPanel]);

  const asignacionesActivas = useMemo(() => {
    return asignaciones.filter(
      (asignacion) => asignacion.estado?.toUpperCase() === "ACTIVA"
    );
  }, [asignaciones]);

  const empleado = asignaciones[0]?.empleado;

  const proyectosAsignados = useMemo<ProyectoAsignado[]>(() => {
    const agrupados = new Map<number, AgrupacionHorasProyecto>();

    asignacionesActivas.forEach((asignacion) => {
      const existente = agrupados.get(asignacion.idProyecto);

      if (!existente) {
        agrupados.set(asignacion.idProyecto, {
          idProyecto: asignacion.idProyecto,
          proyecto: proyectos[asignacion.idProyecto],
          rol: asignacion.rolEnProyecto,
          horasProyectoCompleto:
            asignacion.idTarea === undefined || asignacion.idTarea === null
              ? asignacion.horasAsignadas || 0
              : 0,
          horasTareas:
            asignacion.idTarea !== undefined && asignacion.idTarea !== null
              ? asignacion.horasAsignadas || 0
              : 0,
          tieneAsignacionGeneral:
            asignacion.idTarea === undefined || asignacion.idTarea === null,
          cantidadTareas:
            asignacion.idTarea !== undefined && asignacion.idTarea !== null
              ? 1
              : 0,
          fechaAsignacion: asignacion.fechaAsignacion,
        });

        return;
      }

      if (asignacion.idTarea === undefined || asignacion.idTarea === null) {
        existente.horasProyectoCompleto += asignacion.horasAsignadas || 0;
        existente.tieneAsignacionGeneral = true;
      } else {
        existente.horasTareas += asignacion.horasAsignadas || 0;
        existente.cantidadTareas += 1;
      }
    });

    return Array.from(agrupados.values()).map((item) => ({
      idProyecto: item.idProyecto,
      proyecto: item.proyecto,
      rol: item.rol,
      tieneAsignacionGeneral: item.tieneAsignacionGeneral,
      cantidadTareas: item.cantidadTareas,
      fechaAsignacion: item.fechaAsignacion,
      horasTotales: item.tieneAsignacionGeneral
        ? item.horasProyectoCompleto
        : item.horasTareas,
    }));
  }, [asignacionesActivas, proyectos]);

  const totalHorasAsignadas = useMemo(() => {
    return proyectosAsignados.reduce(
      (total, proyecto) => total + proyecto.horasTotales,
      0
    );
  }, [proyectosAsignados]);

  const tareasCompletadas = useMemo(() => {
    return tareasAsignadas.filter(
      ({ tarea }) => tarea.estadoTarea?.toUpperCase() === "COMPLETADA"
    ).length;
  }, [tareasAsignadas]);

  const handleCambiarEstadoTarea = async (
    idTarea: number,
    nuevoEstado: EstadoTarea
  ) => {
    try {
      setActualizandoTarea(idTarea);
      setError("");
      setMensaje("");

      await cambiarEstadoTarea(idTarea, nuevoEstado);

      setMensaje(
        "Estado de tarea actualizado correctamente. El avance del proyecto se recalculó automáticamente."
      );

      await cargarPanel();
    } catch (error) {
      console.error("Error cambiando estado de tarea:", error);
      setError("No se pudo actualizar el estado de la tarea.");
    } finally {
      setActualizandoTarea(null);
    }
  };

  if (loading) {
    return (
      <section className="page-container">
        <h1 className="page-title">Mi Panel</h1>
        <p className="page-subtitle">Cargando información del colaborador...</p>
      </section>
    );
  }

  if (error && asignaciones.length === 0) {
    return (
      <section className="page-container">
        <h1 className="page-title">Mi Panel</h1>
        <div className="error-message">{error}</div>
      </section>
    );
  }

  return (
    <section className="page-container">
      <div className="employee-hero">
        <div>
          <p className="employee-role">COLABORADOR</p>
          <h1 className="page-title">
            {empleado ? `${empleado.nombre} ${empleado.apellido}` : "Mi Panel"}
          </h1>
          <p className="page-subtitle">
            {empleado?.cargo || "Resumen personal de proyectos, tareas y horas"}
          </p>
        </div>

        <div className="employee-status">
          <span className={getBadgeClass(empleado?.disponibilidad)}>
            {empleado?.disponibilidad || "SIN DATOS"}
          </span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {mensaje && <div className="success-message">{mensaje}</div>}

      <div className="dashboard-grid">
        <div className="kpi-card exito">
          <div className="kpi-title">Disponibilidad</div>
          <div className="kpi-value" style={{ fontSize: "28px" }}>
            {empleado?.disponibilidad || "Sin datos"}
          </div>
          <div className="kpi-description">
            Calculada según asignaciones activas
          </div>
        </div>

        <div className={totalHorasAsignadas > 40 ? "kpi-card alerta" : "kpi-card proyectos"}>
          <div className="kpi-title">Horas consideradas</div>
          <div className="kpi-value">{totalHorasAsignadas}</div>
          <div className="kpi-description">
            {totalHorasAsignadas > 40
              ? `Sobrecarga: ${totalHorasAsignadas}/40h`
              : `${totalHorasAsignadas}/40h asignadas`}
          </div>
        </div>

        <div className="kpi-card recursos">
          <div className="kpi-title">Proyectos asignados</div>
          <div className="kpi-value">{proyectosAsignados.length}</div>
          <div className="kpi-description">
            Asignaciones activas: {asignacionesActivas.length}
          </div>
        </div>

        <div className="kpi-card alerta">
          <div className="kpi-title">Tareas completadas</div>
          <div className="kpi-value">
            {tareasCompletadas}/{tareasAsignadas.length}
          </div>
          <div className="kpi-description">Tareas asignadas directamente</div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div>
            <h2>Mis tareas asignadas</h2>
            <p>
              Actualiza el estado de tus tareas. Al completarlas, el proyecto
              recalcula su avance automáticamente.
            </p>
          </div>
        </div>

        {tareasAsignadas.length === 0 ? (
          <div className="empty-state">
            <h3>No tienes tareas asignadas directamente</h3>
            <p>
              Actualmente tienes asignaciones a nivel de proyecto, pero no a
              tareas específicas. El gestor debe asignarte desde el botón{" "}
              <strong>+ Asignar</strong> en una tarea.
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Tarea</th>
                <th>Estado</th>
                <th>Avance</th>
                <th>Prioridad</th>
                <th>Fechas</th>
                <th>Horas</th>
                <th>Actualizar estado</th>
              </tr>
            </thead>

            <tbody>
              {tareasAsignadas.map(({ asignacion, tarea, proyecto }) => {
                const idTarea = tarea.id || asignacion.idTarea;

                return (
                  <tr key={`${asignacion.id}-${idTarea}`}>
                    <td>
                      <strong>
                        {proyecto?.nombreProyecto ||
                          `Proyecto ${asignacion.idProyecto}`}
                      </strong>
                      <p className="row-hint">
                        Estado: {proyecto?.estadoProyecto || "-"} | Avance:{" "}
                        {proyecto?.porcentajeAvance ?? 0}%
                      </p>
                    </td>

                    <td>
                      <strong>{tarea.nombreTarea}</strong>
                      <p className="row-hint">
                        Rol: {asignacion.rolEnProyecto}
                      </p>
                    </td>

                    <td>
                      <span className={getBadgeClass(tarea.estadoTarea)}>
                        {tarea.estadoTarea}
                      </span>
                    </td>

                    <td>{tarea.porcentajeAvance}%</td>

                    <td>
                      <span className={getBadgeClass(tarea.prioridad)}>
                        {tarea.prioridad}
                      </span>
                    </td>

                    <td>
                      {formatearFecha(tarea.fechaInicio)} a{" "}
                      {formatearFecha(tarea.fechaLimite)}
                    </td>

                    <td>{asignacion.horasAsignadas}h</td>

                    <td>
                      {idTarea ? (
                        <select
                          value={tarea.estadoTarea}
                          disabled={actualizandoTarea === idTarea}
                          onChange={(event) =>
                            handleCambiarEstadoTarea(
                              idTarea,
                              event.target.value as EstadoTarea
                            )
                          }
                        >
                          <option value="PENDIENTE">PENDIENTE</option>
                          <option value="EN_PROGRESO">EN PROGRESO</option>
                          <option value="COMPLETADA">COMPLETADA</option>
                        </select>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* COMENTARIOS POR TAREA */}
      {tareasAsignadas.length > 0 && (
        <div>
          {tareasAsignadas.map(({ tarea, asignacion }) => {
            const idTarea = tarea.id || asignacion.idTarea;
            if (!idTarea) return null;
            return (
              <ComentariosTarea
                key={idTarea}
                idTarea={idTarea}
                nombreTarea={tarea.nombreTarea || `Tarea #${idTarea}`}
                esPropietario={true}
              />
            );
          })}
        </div>
      )}

      <div className="table-container">
        <div className="table-header">
          <div>
            <h2>Mis proyectos asignados</h2>
            <p>
              Proyectos donde participas. Las horas no se duplican si existe
              asignación al proyecto completo y también a tareas del mismo
              proyecto.
            </p>
          </div>
        </div>

        {proyectosAsignados.length === 0 ? (
          <div className="empty-state">
            <h3>No tienes proyectos asignados</h3>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Rol</th>
                <th>Horas consideradas</th>
                <th>Tareas asignadas</th>
                <th>Asignación general</th>
                <th>Estado proyecto</th>
                <th>Avance</th>
                <th>Fecha asignación</th>
              </tr>
            </thead>

            <tbody>
              {proyectosAsignados.map((item) => (
                <tr key={item.idProyecto}>
                  <td>
                    <strong>
                      {item.proyecto?.nombreProyecto ||
                        `Proyecto ${item.idProyecto}`}
                    </strong>
                    <p className="row-hint">ID: {item.idProyecto}</p>
                  </td>

                  <td>{item.rol}</td>

                  <td>{item.horasTotales}h</td>

                  <td>{item.cantidadTareas}</td>

                  <td>{item.tieneAsignacionGeneral ? "Sí" : "No"}</td>

                  <td>
                    <span className={getBadgeClass(item.proyecto?.estadoProyecto)}>
                      {item.proyecto?.estadoProyecto || "-"}
                    </span>
                  </td>

                  <td>{item.proyecto?.porcentajeAvance ?? 0}%</td>

                  <td>{formatearFecha(item.fechaAsignacion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}