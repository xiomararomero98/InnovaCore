import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProyectoById } from "../actions/get-proyectos";
import {
  cambiarEstadoTarea,
  crearTarea,
  eliminarTarea,
  getTareasByProyecto,
} from "../actions/get-tareas";
import {
  getAsignacionesByProyecto,
  getAsignacionesByTarea,
  asignarEmpleadosAProyecto,
  asignarEmpleadosATarea,
  finalizarAsignacion,
  type Asignacion,
} from "../actions/get-asignaciones";
import { getEmpleados } from "../actions/get-empleados";
import type { Proyecto } from "../interfaces/proyecto.interface";
import type { Tarea } from "../interfaces/tarea.interface";
import type { Empleado } from "../interfaces/empleado.interface";
import { puedeGestionarProyectos } from "../utils/auth";
import ComentariosTarea from "../components/ComentariosTarea";

type TareaForm = {
  nombreTarea: string;
  descripcion: string;
  fechaInicio: string;
  fechaLimite: string;
  prioridad: string;
  idResponsable: string;
};

const initialTareaForm: TareaForm = {
  nombreTarea: "",
  descripcion: "",
  fechaInicio: "",
  fechaLimite: "",
  prioridad: "MEDIA",
  idResponsable: "",
};

const estadosTarea = ["PENDIENTE", "EN_PROGRESO", "COMPLETADA", "CANCELADA"];

// ============================================================
// MODAL DE ASIGNACIÓN (reutilizable para proyecto y tarea)
// ============================================================
type AsignacionModalProps = {
  titulo: string;
  empleados: Empleado[];
  asignacionesActivas: Asignacion[];
  onGuardar: (empleadosIds: number[], horas: number, rol: string) => Promise<void>;
  onCerrar: () => void;
};

function AsignacionModal({
  titulo,
  empleados,
  asignacionesActivas,
  onGuardar,
  onCerrar,
}: AsignacionModalProps) {
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [horas, setHoras] = useState("8");
  const [rol, setRol] = useState("DESARROLLADOR");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const idsYaAsignados = asignacionesActivas
    .filter((a) => a.estado === "ACTIVA")
    .map((a) => a.empleado.id);

  const toggleEmpleado = (id: number, bloqueado: boolean) => {
    if (bloqueado) return;
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleGuardar = async () => {
    if (seleccionados.length === 0) {
      setError("Selecciona al menos un empleado.");
      return;
    }
    if (!horas || Number(horas) <= 0) {
      setError("Las horas deben ser mayores a 0.");
      return;
    }
    try {
      setGuardando(true);
      setError("");
      await onGuardar(seleccionados, Number(horas), rol);
      onCerrar();
    } catch (e: any) {
      setError(e?.response?.data?.message || "No se pudo realizar la asignación.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="form-title">{titulo}</h3>

        {error && <div className="error-message">{error}</div>}
      {mensajeExito && <div className="success-message">{mensajeExito}</div>}

        <div className="form-grid" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label>Horas asignadas</label>
            <input
              type="number"
              min="1"
              value={horas}
              onChange={(e) => setHoras(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Rol en el proyecto</label>
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="DESARROLLADOR">DESARROLLADOR</option>
              <option value="LIDER_TECNICO">LÍDER TÉCNICO</option>
              <option value="ANALISTA">ANALISTA</option>
              <option value="TESTER">TESTER</option>
              <option value="DISEÑADOR">DISEÑADOR</option>
            </select>
          </div>
        </div>

        <p style={{ fontWeight: 600, marginBottom: 8, color: "var(--azul-oscuro)" }}>
          Selecciona empleados:
        </p>

        <div className="empleados-lista">
          {empleados.map((e) => {
            const yaAsignado = idsYaAsignados.includes(e.id);
            const estaOcupado = e.disponibilidad === "OCUPADO" || e.disponibilidad === "NO_DISPONIBLE";
            const bloqueado = yaAsignado || estaOcupado;
            const marcado = seleccionados.includes(e.id);
            return (
              <label
                key={e.id}
                className={`empleado-item ${bloqueado ? "empleado-ya-asignado" : ""}`}
                style={estaOcupado && !yaAsignado ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
              >
                <input
                  type="checkbox"
                  checked={marcado}
                  disabled={bloqueado}
                  onChange={() => toggleEmpleado(e.id, bloqueado)}
                />
                <span>
                  <strong>{e.nombre} {e.apellido}</strong>
                  {" · "}{e.cargo}
                  {" · "}
                  <span className={`badge badge-${e.disponibilidad.toLowerCase()}`}>
                    {e.disponibilidad}
                  </span>
                  {yaAsignado && (
                    <span style={{ color: "var(--gris-oscuro)", fontSize: 11, marginLeft: 6 }}>
                      (ya asignado)
                    </span>
                  )}
                  {!yaAsignado && estaOcupado && (
                    <span style={{ color: "var(--rojo, #e53e3e)", fontSize: 11, marginLeft: 6 }}>
                      (sin disponibilidad — ≥40h)
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>

        <div className="form-actions" style={{ marginTop: 16 }}>
          <button
            className="btn-primary btn-auto"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? "Asignando..." : "Asignar"}
          </button>
          <button className="btn-secondary" onClick={onCerrar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================
export default function DetalleProyectoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const idProyecto = Number(id);
  const puedeGestionar = puedeGestionarProyectos();

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [asignacionesProyecto, setAsignacionesProyecto] = useState<Asignacion[]>([]);
  const [asignacionesTarea, setAsignacionesTarea] = useState<Record<number, Asignacion[]>>({});

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [form, setForm] = useState<TareaForm>(initialTareaForm);
  const [error, setError] = useState("");

  // Modal de asignación
  const [modalProyecto, setModalProyecto] = useState(false);
  const [modalTareaId, setModalTareaId] = useState<number | null>(null);
  const [mensajeExito, setMensajeExito] = useState("");

  const cargarDetalle = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [proyectoData, tareasData, empleadosData, asignProyecto] = await Promise.all([
        getProyectoById(idProyecto),
        getTareasByProyecto(idProyecto),
        getEmpleados(),
        getAsignacionesByProyecto(idProyecto),
      ]);

      setProyecto(proyectoData);
      setTareas(tareasData);
      setEmpleados(empleadosData);
      setAsignacionesProyecto(asignProyecto);

      // Cargar asignaciones por tarea
      const asignPorTarea: Record<number, Asignacion[]> = {};
      await Promise.all(
        tareasData.map(async (t) => {
          const asign = await getAsignacionesByTarea(t.id);
          asignPorTarea[t.id] = asign;
        })
      );
      setAsignacionesTarea(asignPorTarea);
    } catch (error) {
      console.error("Error cargando detalle del proyecto:", error);
      setError("No se pudo cargar el detalle del proyecto.");
    } finally {
      setLoading(false);
    }
  }, [idProyecto]);

  useEffect(() => {
    if (!Number.isNaN(idProyecto)) {
      cargarDetalle();
    }
  }, [idProyecto, cargarDetalle]);

  // ── Formulario tarea ──
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const limpiarFormulario = () => {
    setForm({
      ...initialTareaForm,
      idResponsable: empleados.length > 0 ? String(empleados[0].id) : "",
    });
    setMostrarFormulario(false);
  };

  const abrirFormulario = () => {
    setForm({
      ...initialTareaForm,
      idResponsable: empleados.length > 0 ? String(empleados[0].id) : "",
    });
    setMostrarFormulario(true);
  };

  const handleCrearTarea = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!puedeGestionar) { setError("No tienes permisos para crear tareas."); return; }
    try {
      setGuardando(true);
      setError("");
      await crearTarea({
        nombreTarea: form.nombreTarea,
        descripcion: form.descripcion,
        fechaInicio: form.fechaInicio,
        fechaLimite: form.fechaLimite,
        prioridad: form.prioridad,
        idResponsable: Number(form.idResponsable),
        proyecto: { id: idProyecto },
      });
      limpiarFormulario();
      await cargarDetalle();
    } catch (error) {
      setError("No se pudo crear la tarea. Revisa las fechas y el responsable.");
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (idTarea: number, nuevoEstado: string) => {
    if (!puedeGestionar) { setError("No tienes permisos para cambiar el estado de tareas."); return; }
    try {
      setError("");
      await cambiarEstadoTarea(idTarea, nuevoEstado);
      await cargarDetalle();
    } catch {
      setError("No se pudo cambiar el estado de la tarea.");
    }
  };

  const handleEliminarTarea = async (idTarea: number) => {
    if (!puedeGestionar) { setError("No tienes permisos para eliminar tareas."); return; }
    if (!window.confirm("¿Seguro que deseas eliminar esta tarea?")) return;
    try {
      setError("");
      await eliminarTarea(idTarea);
      await cargarDetalle();
    } catch {
      setError("No se pudo eliminar la tarea.");
    }
  };

  const handleFinalizarAsignacion = async (idAsignacion: number) => {
    if (!window.confirm("¿Confirmas que deseas retirar a este empleado del proyecto?")) return;
    try {
      await finalizarAsignacion(idAsignacion);
      setMensajeExito("Empleado retirado del proyecto correctamente.");
      setTimeout(() => setMensajeExito(""), 3000);
      await cargarDetalle();
    } catch {
      setError("No se pudo finalizar la asignación.");
    }
  };

  const getBadgeClass = (valor: string) =>
    `badge badge-${valor.toLowerCase().replace(/_/g, "-")}`;

  if (Number.isNaN(idProyecto)) {
    return <div className="page-container"><div className="error-message">El ID del proyecto no es válido.</div></div>;
  }
  if (loading) return <div className="loading">Cargando detalle del proyecto...</div>;
  if (!proyecto) return <div className="page-container"><div className="error-message">Proyecto no encontrado.</div></div>;

  const asignacionesActivas = asignacionesProyecto.filter((a) => a.estado === "ACTIVA");

  return (
    <div className="page-container">
      {/* Modal asignación a proyecto */}
      {modalProyecto && (
        <AsignacionModal
          titulo={`Asignar empleados a: ${proyecto.nombreProyecto}`}
          empleados={empleados}
          asignacionesActivas={asignacionesProyecto}
          onGuardar={(ids, horas, rol) =>
            asignarEmpleadosAProyecto(idProyecto, { empleadosIds: ids, horasAsignadas: horas, rolEnProyecto: rol })
              .then(() => cargarDetalle())
          }
          onCerrar={() => setModalProyecto(false)}
        />
      )}

      {/* Modal asignación a tarea */}
      {modalTareaId !== null && (
        <AsignacionModal
          titulo={`Asignar empleados a tarea: ${tareas.find((t) => t.id === modalTareaId)?.nombreTarea}`}
          empleados={empleados.filter((e) =>
            asignacionesProyecto.some((a) => a.empleado?.id === e.id && a.estado === "ACTIVA")
          )}
          asignacionesActivas={asignacionesTarea[modalTareaId] || []}
          onGuardar={(ids, horas, rol) =>
            asignarEmpleadosATarea(idProyecto, modalTareaId, { empleadosIds: ids, horasAsignadas: horas, rolEnProyecto: rol })
              .then(() => cargarDetalle())
          }
          onCerrar={() => setModalTareaId(null)}
        />
      )}

      <div className="form-actions">
        <button className="btn-secondary btn-auto" onClick={() => navigate("/proyectos")}>
          ← Volver a proyectos
        </button>
        <button className="btn-secondary btn-auto" onClick={() => navigate("/dashboard")}>
          Volver al dashboard
        </button>
      </div>

      <h1 className="page-title">{proyecto.nombreProyecto}</h1>
      <p className="page-subtitle">
        Detalle del proyecto, tareas y asignaciones de empleados.
      </p>

      {!puedeGestionar && (
        <div className="info-message">
          Estás en modo solo lectura. Puedes revisar las tareas, el avance y el estado del proyecto, pero no modificar información.
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Estado automático</div>
          <div className="kpi-value small-kpi">
            <span className={getBadgeClass(proyecto.estadoProyecto)}>{proyecto.estadoProyecto}</span>
          </div>
          <div className="kpi-description">Calculado según tareas y fecha fin</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Avance automático</div>
          <div className="kpi-value">{proyecto.porcentajeAvance}%</div>
          <div className="kpi-description">Promedio del avance real de las tareas</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Tareas registradas</div>
          <div className="kpi-value">{tareas.length}</div>
          <div className="kpi-description">Trabajo definido hasta este momento</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Empleados asignados</div>
          <div className="kpi-value">{asignacionesActivas.length}</div>
          <div className="kpi-description">Con asignación activa en este proyecto</div>
        </div>
      </div>

      {/* ════ ASIGNACIONES AL PROYECTO ════ */}
      <div className="table-container">
        <div className="table-header">
          <h2>Equipo del proyecto</h2>
          {puedeGestionar && (
            <button className="btn-secondary" onClick={() => setModalProyecto(true)}>
              + Asignar empleados
            </button>
          )}
        </div>

        {asignacionesProyecto.filter((a) => a.estado === "ACTIVA").length === 0 ? (
          <div className="empty-state">
            <h3>No hay empleados asignados a este proyecto</h3>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Rol</th>
                <th>Horas</th>
                <th>Estado asignación</th>
                {puedeGestionar && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {asignacionesProyecto.filter((a) => a.estado === "ACTIVA").map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.empleado.nombre} {a.empleado.apellido}</strong>
                    <div className="row-hint">{a.empleado.cargo}</div>
                  </td>
                  <td>{a.rolEnProyecto}</td>
                  <td>{a.horasAsignadas}h</td>
                  <td>
                    <span className={getBadgeClass(a.estado)}>{a.estado}</span>
                  </td>
                  {puedeGestionar && (
                    <td>
                      {a.estado === "ACTIVA" && (
                        <button
                          className="btn-secondary"
                          onClick={() => handleFinalizarAsignacion(a.id)}
                        >
                          Finalizar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ════ TAREAS ════ */}
      <div className="table-container">
        <div className="table-header">
          <h2>Tareas del proyecto</h2>
          {puedeGestionar && (
            <button
              className="btn-secondary"
              onClick={() => (mostrarFormulario ? limpiarFormulario() : abrirFormulario())}
            >
              {mostrarFormulario ? "Ocultar formulario" : "+ Nueva tarea"}
            </button>
          )}
        </div>

        {puedeGestionar && mostrarFormulario && (
          <form className="form-panel" onSubmit={handleCrearTarea}>
            <h3 className="form-title">Nueva tarea</h3>
            <div className="info-message">
              La tarea nace como PENDIENTE con 0% de avance. Al cambiar su estado, el backend recalcula automáticamente el avance.
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Nombre de la tarea</label>
                <input name="nombreTarea" value={form.nombreTarea} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Responsable</label>
                {empleados.length === 0 ? (
                  <p className="loading-inline">Cargando empleados...</p>
                ) : (
                  <select name="idResponsable" value={form.idResponsable} onChange={handleChange} required>
                    <option value="">Selecciona un responsable</option>
                    {empleados.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre} {e.apellido} — {e.cargo}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>Fecha inicio</label>
                <input name="fechaInicio" type="date" value={form.fechaInicio} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Fecha límite</label>
                <input name="fechaLimite" type="date" value={form.fechaLimite} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Prioridad</label>
                <select name="prioridad" value={form.prioridad} onChange={handleChange}>
                  <option value="BAJA">BAJA</option>
                  <option value="MEDIA">MEDIA</option>
                  <option value="ALTA">ALTA</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} />
            </div>

            <div className="form-actions">
              <button className="btn-primary btn-auto" type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar tarea"}
              </button>
              <button className="btn-secondary" type="button" onClick={limpiarFormulario}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {tareas.length === 0 ? (
          <div className="empty-state">
            <h3>Este proyecto todavía no tiene tareas</h3>
            <p>Agrega tareas para que el sistema pueda calcular el avance real.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tarea</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Avance</th>
                <th>Responsable</th>
                <th>Asignados</th>
                <th>Fechas</th>
                <th>Último cambio de estado</th>
                {puedeGestionar && <th>Cambiar estado</th>}
                {puedeGestionar && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {tareas.map((tarea) => {
                const asignTarea = asignacionesTarea[tarea.id] || [];
                const activasTarea = asignTarea.filter((a) => a.estado === "ACTIVA");
                const responsable = empleados.find((e) => e.id === tarea.idResponsable);

                return (
                  <tr key={tarea.id}>
                    <td>{tarea.id}</td>
                    <td>
                      <strong>{tarea.nombreTarea}</strong>
                      {tarea.descripcion && <div className="row-hint">{tarea.descripcion}</div>}
                    </td>
                    <td>
                      <span className={getBadgeClass(tarea.estadoTarea)}>{tarea.estadoTarea}</span>
                    </td>
                    <td>
                      <span className={getBadgeClass(tarea.prioridad)}>{tarea.prioridad}</span>
                    </td>
                    <td>{tarea.porcentajeAvance}%</td>
                    <td>
                      {responsable
                        ? `${responsable.nombre} ${responsable.apellido}`
                        : `#${tarea.idResponsable}`}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {activasTarea.length === 0 ? (
                          <span style={{ fontSize: 12, color: "var(--gris-oscuro)" }}>Sin asignar</span>
                        ) : (
                          activasTarea.map((a) => (
                            <span key={a.id} style={{ fontSize: 12 }}>
                              {a.empleado.nombre} {a.empleado.apellido} ({a.horasAsignadas}h)
                            </span>
                          ))
                        )}
                        {puedeGestionar && (
                          <button
                            className="btn-secondary"
                            style={{ fontSize: 11, padding: "2px 8px", marginTop: 4 }}
                            onClick={() => setModalTareaId(tarea.id)}
                          >
                            + Asignar
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="project-dates">
                      {tarea.fechaInicio} <br /> a {tarea.fechaLimite}
                    </td>
                    <td>
                      {tarea.fechaCambioEstado ? (
                        <div style={{ fontSize: 12 }}>
                          <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>
                            {new Date(tarea.fechaCambioEstado).toLocaleDateString("es-CL")}
                          </div>
                          <div style={{ color: "var(--text-muted)" }}>
                            {new Date(tarea.fechaCambioEstado).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          {tarea.estadoAnterior && (
                            <div style={{ marginTop: 4 }}>
                              <span className={`badge badge-${tarea.estadoAnterior.toLowerCase().replace(/_/g, "-")}`} style={{ fontSize: 10 }}>
                                {tarea.estadoAnterior}
                              </span>
                              <span style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 4px" }}>→</span>
                              <span className={`badge badge-${tarea.estadoTarea.toLowerCase().replace(/_/g, "-")}`} style={{ fontSize: 10 }}>
                                {tarea.estadoTarea}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Sin cambios aún</span>
                      )}
                    </td>
                    {puedeGestionar && (
                      <td>
                        <select
                          value={tarea.estadoTarea}
                          onChange={(e) => handleCambiarEstado(tarea.id, e.target.value)}
                        >
                          {estadosTarea.map((estado) => (
                            <option key={estado} value={estado}>{estado}</option>
                          ))}
                        </select>
                      </td>
                    )}
                    {puedeGestionar && (
                      <td>
                        <button className="btn-danger" onClick={() => handleEliminarTarea(tarea.id)}>
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── COMENTARIOS POR TAREA ── */}
      {tareas.length > 0 && (
        <div>
          {tareas.map((tarea) => {
            const asignTarea = asignacionesTarea[tarea.id] || [];
            const idsAsignados = asignTarea
              .filter((a) => a.estado === "ACTIVA")
              .map((a) => a.empleado.id);
            const idsProyecto = asignacionesProyecto
              .filter((a) => a.estado === "ACTIVA")
              .map((a) => a.empleado.id);
            return (
              <ComentariosTarea
                key={tarea.id}
                idTarea={tarea.id}
                nombreTarea={tarea.nombreTarea}
                idsEmpleadosAsignados={idsAsignados}
                idsEmpleadosProyecto={idsProyecto}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}