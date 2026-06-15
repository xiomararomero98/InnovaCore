import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  actualizarProyecto,
  crearProyecto,
  eliminarProyecto,
  getProyectos,
} from "../actions/get-proyectos";
import type { Proyecto } from "../interfaces/proyecto.interface";
import { puedeGestionarProyectos } from "../utils/auth";

type ProyectoForm = {
  id?: number;
  nombreProyecto: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  prioridad: string;
  idGestor: string;
  idCliente: string;
};

const initialForm: ProyectoForm = {
  nombreProyecto: "",
  descripcion: "",
  fechaInicio: "",
  fechaFin: "",
  prioridad: "MEDIA",
  idGestor: "1",
  idCliente: "1",
};

export default function ProyectosPage() {
  const navigate = useNavigate();
  const puedeGestionar = puedeGestionarProyectos();

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [form, setForm] = useState<ProyectoForm>(initialForm);
  const [error, setError] = useState("");

  const cargarProyectos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProyectos();
      setProyectos(data);
    } catch (error) {
      console.error("Error cargando proyectos:", error);
      setError("No se pudieron cargar los proyectos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarProyectos();
  }, [cargarProyectos]);

  const abrirFormularioCrear = () => {
    setForm(initialForm);
    setError("");
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (proyecto: Proyecto) => {
    setForm({
      id: proyecto.id,
      nombreProyecto: proyecto.nombreProyecto,
      descripcion: proyecto.descripcion || "",
      fechaInicio: proyecto.fechaInicio,
      fechaFin: proyecto.fechaFin,
      prioridad: proyecto.prioridad,
      idGestor: String(proyecto.idGestor),
      idCliente: String(proyecto.cliente?.id || 1),
    });

    setError("");
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setForm(initialForm);
    setError("");
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!puedeGestionar) {
      setError("No tienes permisos para guardar proyectos.");
      return;
    }

    try {
      setGuardando(true);
      setError("");

      const proyectoPayload: Partial<Proyecto> = {
        nombreProyecto: form.nombreProyecto,
        descripcion: form.descripcion,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        prioridad: form.prioridad,
        idGestor: Number(form.idGestor),
        cliente: {
          id: Number(form.idCliente),
          nombreCliente: "",
        },
      };

      if (form.id) {
        await actualizarProyecto(form.id, proyectoPayload);
      } else {
        await crearProyecto(proyectoPayload);
      }

      cerrarFormulario();
      await cargarProyectos();
    } catch (error) {
      console.error("Error guardando proyecto:", error);
      setError(
        "No se pudo guardar el proyecto. Revisa que el ID Cliente exista y que las fechas sean válidas."
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!puedeGestionar) {
      setError("No tienes permisos para eliminar proyectos.");
      return;
    }

    const confirmar = window.confirm("¿Seguro que deseas eliminar este proyecto?");
    if (!confirmar) return;

    try {
      setError("");
      await eliminarProyecto(id);
      await cargarProyectos();
    } catch (error) {
      console.error("Error eliminando proyecto:", error);
      setError("No se pudo eliminar el proyecto.");
    }
  };

  const getBadgeClass = (valor: string) => {
    return `badge badge-${valor.toLowerCase().replace("_", "-")}`;
  };

  return (
    <div className="page-container">
      <button
        className="btn-secondary btn-auto"
        onClick={() => navigate("/dashboard")}
      >
        ← Volver al dashboard
      </button>

      <h1 className="page-title">Gestión de Proyectos</h1>
      <p className="page-subtitle">
        Administra los proyectos de la organización. El estado y el avance se
        calculan automáticamente según las tareas asociadas.
      </p>

      {!puedeGestionar && (
        <div className="info-message">
          Estás en modo solo lectura. Puedes revisar el avance, estado y tareas
          del proyecto, pero no crear, editar ni eliminar registros.
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <div className="table-header">
          <h2>Listado de Proyectos</h2>

          {puedeGestionar && (
            <button className="btn-secondary" onClick={abrirFormularioCrear}>
              + Nuevo Proyecto
            </button>
          )}
        </div>

        {puedeGestionar && mostrarFormulario && (
          <form className="form-panel" onSubmit={handleSubmit}>
            <h3 className="form-title">
              {form.id ? "Editar proyecto" : "Nuevo proyecto"}
            </h3>

            <div className="info-message">
              El avance y el estado del proyecto no se ingresan manualmente. El
              sistema los recalcula automáticamente según el estado real de sus
              tareas.
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Nombre del proyecto</label>
                <input
                  name="nombreProyecto"
                  value={form.nombreProyecto}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>ID Cliente</label>
                <input
                  name="idCliente"
                  type="number"
                  min="1"
                  value={form.idCliente}
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
                <label>Fecha fin</label>
                <input
                  name="fechaFin"
                  type="date"
                  value={form.fechaFin}
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

              <div className="form-group">
                <label>ID Gestor</label>
                <input
                  name="idGestor"
                  type="number"
                  min="1"
                  value={form.idGestor}
                  onChange={handleChange}
                  required
                />
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
                {guardando ? "Guardando..." : "Guardar"}
              </button>

              <button
                className="btn-secondary"
                type="button"
                onClick={cerrarFormulario}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="loading">Cargando proyectos...</div>
        ) : proyectos.length === 0 ? (
          <div className="empty-state">
            <h3>No hay proyectos registrados</h3>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Cliente</th>
                <th>Estado automático</th>
                <th>Prioridad</th>
                <th>Avance automático</th>
                <th>Fechas</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {proyectos.map((p) => (
                <tr
                  key={p.id}
                  className="clickable-row"
                  onClick={() => navigate(`/proyectos/${p.id}`)}
                >
                  <td>{p.id}</td>

                  <td>
                    <strong>{p.nombreProyecto}</strong>
                  </td>

                  <td>{p.cliente?.nombreCliente || "Sin cliente"}</td>

                  <td>
                    <span className={getBadgeClass(p.estadoProyecto)}>
                      {p.estadoProyecto}
                    </span>
                  </td>

                  <td>
                    <span className={getBadgeClass(p.prioridad)}>
                      {p.prioridad}
                    </span>
                  </td>

                  <td>{p.porcentajeAvance}%</td>

                  <td className="project-dates">
                    {p.fechaInicio} <br /> a {p.fechaFin}
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-secondary"
                        onClick={(event) => {
                          event.stopPropagation();

                          if (puedeGestionar) {
                            abrirFormularioEditar(p);
                          } else {
                            navigate(`/proyectos/${p.id}`);
                          }
                        }}
                      >
                        {puedeGestionar ? "Editar" : "Ver detalle"}
                      </button>

                      {puedeGestionar && (
                        <button
                          className="btn-danger"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleEliminar(p.id);
                          }}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}