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
import type { Proyecto } from "../interfaces/proyecto.interface";
import type { Tarea } from "../interfaces/tarea.interface";
import { puedeGestionarProyectos } from "../utils/auth";

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
  idResponsable: "1",
};

const estadosTarea = ["PENDIENTE", "EN_PROGRESO", "COMPLETADA", "CANCELADA"];

export default function DetalleProyectoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const idProyecto = Number(id);
  const puedeGestionar = puedeGestionarProyectos();

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [form, setForm] = useState<TareaForm>(initialTareaForm);
  const [error, setError] = useState("");

  const cargarDetalle = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [proyectoData, tareasData] = await Promise.all([
        getProyectoById(idProyecto),
        getTareasByProyecto(idProyecto),
      ]);

      setProyecto(proyectoData);
      setTareas(tareasData);
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

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const limpiarFormulario = () => {
    setForm(initialTareaForm);
    setMostrarFormulario(false);
  };

  const handleCrearTarea = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!puedeGestionar) {
      setError("No tienes permisos para crear tareas.");
      return;
    }

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
        proyecto: {
          id: idProyecto,
        },
      });

      limpiarFormulario();
      await cargarDetalle();
    } catch (error) {
      console.error("Error creando tarea:", error);
      setError("No se pudo crear la tarea. Revisa las fechas y el responsable.");
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (idTarea: number, nuevoEstado: string) => {
    if (!puedeGestionar) {
      setError("No tienes permisos para cambiar el estado de tareas.");
      return;
    }

    try {
      setError("");
      await cambiarEstadoTarea(idTarea, nuevoEstado);
      await cargarDetalle();
    } catch (error) {
      console.error("Error cambiando estado de tarea:", error);
      setError("No se pudo cambiar el estado de la tarea.");
    }
  };

  const handleEliminarTarea = async (idTarea: number) => {
    if (!puedeGestionar) {
      setError("No tienes permisos para eliminar tareas.");
      return;
    }

    const confirmar = window.confirm("¿Seguro que deseas eliminar esta tarea?");
    if (!confirmar) return;

    try {
      setError("");
      await eliminarTarea(idTarea);
      await cargarDetalle();
    } catch (error) {
      console.error("Error eliminando tarea:", error);
      setError("No se pudo eliminar la tarea.");
    }
  };

  const getBadgeClass = (valor: string) => {
    return `badge badge-${valor.toLowerCase().replace("_", "-")}`;
  };

  if (Number.isNaN(idProyecto)) {
    return (
      <div className="page-container">
        <div className="error-message">El ID del proyecto no es válido.</div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Cargando detalle del proyecto...</div>;
  }

  if (!proyecto) {
    return (
      <div className="page-container">
        <div className="error-message">Proyecto no encontrado.</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="form-actions">
        <button
          className="btn-secondary btn-auto"
          onClick={() => navigate("/proyectos")}
        >
          ← Volver a proyectos
        </button>

        <button
          className="btn-secondary btn-auto"
          onClick={() => navigate("/dashboard")}
        >
          Volver al dashboard
        </button>
      </div>

      <h1 className="page-title">{proyecto.nombreProyecto}</h1>
      <p className="page-subtitle">
        Detalle del proyecto, tareas asociadas y recálculo automático del avance.
      </p>

      {!puedeGestionar && (
        <div className="info-message">
          Estás en modo solo lectura. Puedes revisar las tareas, el avance y el
          estado del proyecto, pero no modificar información.
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Estado automático</div>
          <div className="kpi-value small-kpi">
            <span className={getBadgeClass(proyecto.estadoProyecto)}>
              {proyecto.estadoProyecto}
            </span>
          </div>
          <div className="kpi-description">Calculado según tareas y fecha fin</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Avance automático</div>
          <div className="kpi-value">{proyecto.porcentajeAvance}%</div>
          <div className="kpi-description">
            Promedio del avance real de las tareas
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-title">Tareas registradas</div>
          <div className="kpi-value">{tareas.length}</div>
          <div className="kpi-description">
            Trabajo definido hasta este momento
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Tareas del proyecto</h2>

          {puedeGestionar && (
            <button
              className="btn-secondary"
              onClick={() => setMostrarFormulario((prev) => !prev)}
            >
              {mostrarFormulario ? "Ocultar formulario" : "+ Nueva tarea"}
            </button>
          )}
        </div>

        {puedeGestionar && mostrarFormulario && (
          <form className="form-panel" onSubmit={handleCrearTarea}>
            <h3 className="form-title">Nueva tarea</h3>

            <div className="info-message">
              La tarea nace como PENDIENTE con 0% de avance. Al cambiar su
              estado, el backend recalcula automáticamente el avance de la tarea
              y del proyecto.
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Nombre de la tarea</label>
                <input
                  name="nombreTarea"
                  value={form.nombreTarea}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>ID Responsable</label>
                <input
                  name="idResponsable"
                  type="number"
                  min="1"
                  value={form.idResponsable}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha inicio</label>
                <input
                  name="fechaInicio"
                  type="date"
                  value={form.fechaInicio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha límite</label>
                <input
                  name="fechaLimite"
                  type="date"
                  value={form.fechaLimite}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Prioridad</label>
                <select
                  name="prioridad"
                  value={form.prioridad}
                  onChange={handleChange}
                >
                  <option value="BAJA">BAJA</option>
                  <option value="MEDIA">MEDIA</option>
                  <option value="ALTA">ALTA</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button
                className="btn-primary btn-auto"
                type="submit"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar tarea"}
              </button>

              <button
                className="btn-secondary"
                type="button"
                onClick={limpiarFormulario}
              >
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
                <th>Fechas</th>
                {puedeGestionar && <th>Cambiar estado</th>}
                {puedeGestionar && <th>Acciones</th>}
              </tr>
            </thead>

            <tbody>
              {tareas.map((tarea) => (
                <tr key={tarea.id}>
                  <td>{tarea.id}</td>

                  <td>
                    <strong>{tarea.nombreTarea}</strong>
                    {tarea.descripcion && (
                      <div className="row-hint">{tarea.descripcion}</div>
                    )}
                  </td>

                  <td>
                    <span className={getBadgeClass(tarea.estadoTarea)}>
                      {tarea.estadoTarea}
                    </span>
                  </td>

                  <td>
                    <span className={getBadgeClass(tarea.prioridad)}>
                      {tarea.prioridad}
                    </span>
                  </td>

                  <td>{tarea.porcentajeAvance}%</td>
                  <td>{tarea.idResponsable}</td>

                  <td className="project-dates">
                    {tarea.fechaInicio} <br /> a {tarea.fechaLimite}
                  </td>

                  {puedeGestionar && (
                    <td>
                      <select
                        value={tarea.estadoTarea}
                        onChange={(event) =>
                          handleCambiarEstado(tarea.id, event.target.value)
                        }
                      >
                        {estadosTarea.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}

                  {puedeGestionar && (
                    <td>
                      <button
                        className="btn-danger"
                        onClick={() => handleEliminarTarea(tarea.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}