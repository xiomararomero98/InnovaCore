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
import { getClientes } from "../actions/get-clientes";
import { getGestores, type UsuarioSimple } from "../actions/get-usuarios";
import type { Proyecto } from "../interfaces/proyecto.interface";
import type { ClienteSimple } from "../interfaces/cliente.interface";
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
  idGestor: "",
  idCliente: "",
};

export default function ProyectosPage() {
  const navigate = useNavigate();
  const puedeGestionar = puedeGestionarProyectos();

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [clientes, setClientes] = useState<ClienteSimple[]>([]);
  const [gestores, setGestores] = useState<UsuarioSimple[]>([]);
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

  // Carga clientes y gestores una sola vez al montar
  useEffect(() => {
    cargarProyectos();

    if (puedeGestionar) {
      getClientes()
        .then(setClientes)
        .catch(() => console.error("No se pudieron cargar los clientes"));

      getGestores()
        .then((data) => {
          setGestores(data);
          // Pre-selecciona el primero si el form está vacío
          if (data.length > 0) {
            setForm((prev) =>
              prev.idGestor === "" ? { ...prev, idGestor: String(data[0].id) } : prev
            );
          }
        })
        .catch(() => console.error("No se pudieron cargar los gestores"));
    }
  }, [cargarProyectos, puedeGestionar]);

  const abrirFormularioCrear = () => {
    setForm({
      ...initialForm,
      idCliente: clientes.length > 0 ? String(clientes[0].id) : "",
      idGestor: gestores.length > 0 ? String(gestores[0].id) : "",
    });
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
      idCliente: String(proyecto.cliente?.id || ""),
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!puedeGestionar) {
      setError("No tienes permisos para guardar proyectos.");
      return;
    }

    if (!form.idCliente || !form.idGestor) {
      setError("Debes seleccionar un cliente y un gestor.");
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
      setError("No se pudo guardar el proyecto. Revisa que las fechas sean válidas.");
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

              {/* SELECTOR DE CLIENTE */}
              <div className="form-group">
                <label>Cliente</label>
                {clientes.length === 0 ? (
                  <p className="loading-inline">Cargando clientes...</p>
                ) : (
                  <select
                    name="idCliente"
                    value={form.idCliente}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombreCliente}
                        {c.rubro ? ` — ${c.rubro}` : ""}
                      </option>
                    ))}
                  </select>
                )}
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

              {/* SELECTOR DE GESTOR */}
              <div className="form-group">
                <label>Gestor responsable</label>
                {gestores.length === 0 ? (
                  <p className="loading-inline">Cargando gestores...</p>
                ) : (
                  <select
                    name="idGestor"
                    value={form.idGestor}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un gestor</option>
                    {gestores.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nombre} {g.apellido}
                        {g.rol ? ` (${g.rol.nombreRol})` : ""}
                      </option>
                    ))}
                  </select>
                )}
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