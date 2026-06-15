import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  getEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
} from "../actions/get-empleados";
import {
  getClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from "../actions/get-clientes";
import type { Empleado } from "../interfaces/empleado.interface";
import type { ClienteSimple } from "../interfaces/cliente.interface";

// ============================================================
// TIPOS DE FORMULARIO
// ============================================================
type EmpleadoForm = {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  cargo: string;
  especialidad: string;
  disponibilidad: string;
};

type ClienteForm = {
  id?: number;
  nombreCliente: string;
  rubro: string;
  correoContacto: string;
  telefono: string;
};

const initialEmpleadoForm: EmpleadoForm = {
  nombre: "",
  apellido: "",
  correo: "",
  cargo: "",
  especialidad: "",
  disponibilidad: "DISPONIBLE",
};

const initialClienteForm: ClienteForm = {
  nombreCliente: "",
  rubro: "",
  correoContacto: "",
  telefono: "",
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function RecursosPage() {
  const navigate = useNavigate();

  // Tab activo: "empleados" | "clientes"
  const [tab, setTab] = useState<"empleados" | "clientes">("empleados");

  // ── Empleados ──
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [mostrarFormEmpleado, setMostrarFormEmpleado] = useState(false);
  const [formEmpleado, setFormEmpleado] = useState<EmpleadoForm>(initialEmpleadoForm);
  const [guardandoEmpleado, setGuardandoEmpleado] = useState(false);
  const [errorEmpleado, setErrorEmpleado] = useState("");

  // ── Clientes ──
  const [clientes, setClientes] = useState<ClienteSimple[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [mostrarFormCliente, setMostrarFormCliente] = useState(false);
  const [formCliente, setFormCliente] = useState<ClienteForm>(initialClienteForm);
  const [guardandoCliente, setGuardandoCliente] = useState(false);
  const [errorCliente, setErrorCliente] = useState("");

  // ── Carga inicial ──
  const cargarEmpleados = useCallback(async () => {
    try {
      setLoadingEmpleados(true);
      setEmpleados(await getEmpleados());
    } catch {
      setErrorEmpleado("No se pudieron cargar los empleados.");
    } finally {
      setLoadingEmpleados(false);
    }
  }, []);

  const cargarClientes = useCallback(async () => {
    try {
      setLoadingClientes(true);
      setClientes(await getClientes());
    } catch {
      setErrorCliente("No se pudieron cargar los clientes.");
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  useEffect(() => {
    cargarEmpleados();
    cargarClientes();
  }, [cargarEmpleados, cargarClientes]);

  // ============================================================
  // EMPLEADOS — handlers
  // ============================================================
  const abrirCrearEmpleado = () => {
    setFormEmpleado(initialEmpleadoForm);
    setErrorEmpleado("");
    setMostrarFormEmpleado(true);
  };

  const abrirEditarEmpleado = (e: Empleado) => {
    setFormEmpleado({
      id: e.id,
      nombre: e.nombre,
      apellido: e.apellido,
      correo: e.correo,
      cargo: e.cargo || "",
      especialidad: e.especialidad || "",
      disponibilidad: e.disponibilidad,
    });
    setErrorEmpleado("");
    setMostrarFormEmpleado(true);
  };

  const cerrarFormEmpleado = () => {
    setMostrarFormEmpleado(false);
    setFormEmpleado(initialEmpleadoForm);
    setErrorEmpleado("");
  };

  const handleChangeEmpleado = (
    ev: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = ev.target;
    setFormEmpleado((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitEmpleado = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    try {
      setGuardandoEmpleado(true);
      setErrorEmpleado("");
      const payload: Partial<Empleado> = {
        nombre: formEmpleado.nombre,
        apellido: formEmpleado.apellido,
        correo: formEmpleado.correo,
        cargo: formEmpleado.cargo,
        especialidad: formEmpleado.especialidad,
        disponibilidad: formEmpleado.disponibilidad,
      };
      if (formEmpleado.id) {
        await actualizarEmpleado(formEmpleado.id, payload);
      } else {
        await crearEmpleado(payload);
      }
      cerrarFormEmpleado();
      await cargarEmpleados();
    } catch {
      setErrorEmpleado("No se pudo guardar el empleado.");
    } finally {
      setGuardandoEmpleado(false);
    }
  };

  const handleEliminarEmpleado = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este empleado?")) return;
    try {
      setErrorEmpleado("");
      await eliminarEmpleado(id);
      await cargarEmpleados();
    } catch {
      setErrorEmpleado("No se pudo eliminar el empleado.");
    }
  };

  // ============================================================
  // CLIENTES — handlers
  // ============================================================
  const abrirCrearCliente = () => {
    setFormCliente(initialClienteForm);
    setErrorCliente("");
    setMostrarFormCliente(true);
  };

  const abrirEditarCliente = (c: ClienteSimple) => {
    setFormCliente({
      id: c.id,
      nombreCliente: c.nombreCliente,
      rubro: c.rubro || "",
      correoContacto: c.correoContacto || "",
      telefono: c.telefono || "",
    });
    setErrorCliente("");
    setMostrarFormCliente(true);
  };

  const cerrarFormCliente = () => {
    setMostrarFormCliente(false);
    setFormCliente(initialClienteForm);
    setErrorCliente("");
  };

  const handleChangeCliente = (ev: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.target;
    setFormCliente((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitCliente = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    try {
      setGuardandoCliente(true);
      setErrorCliente("");
      const payload: Partial<ClienteSimple> = {
        nombreCliente: formCliente.nombreCliente,
        rubro: formCliente.rubro,
        correoContacto: formCliente.correoContacto,
        telefono: formCliente.telefono,
      };
      if (formCliente.id) {
        await actualizarCliente(formCliente.id, payload);
      } else {
        await crearCliente(payload);
      }
      cerrarFormCliente();
      await cargarClientes();
    } catch {
      setErrorCliente("No se pudo guardar el cliente.");
    } finally {
      setGuardandoCliente(false);
    }
  };

  const handleEliminarCliente = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;
    try {
      setErrorCliente("");
      await eliminarCliente(id);
      await cargarClientes();
    } catch {
      setErrorCliente(
        "No se pudo eliminar el cliente. Puede tener proyectos asociados."
      );
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================
  const getBadgeClass = (valor: string) =>
    `badge badge-${valor.toLowerCase()}`;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="page-container">
      <button
        className="btn-secondary btn-auto"
        onClick={() => navigate("/dashboard")}
      >
        ← Volver al dashboard
      </button>

      <h1 className="page-title">Gestión de Recursos</h1>
      <p className="page-subtitle">
        Administra empleados y clientes de la organización.
      </p>

      {/* TABS */}
      <div className="tabs">
        <button
          className={`tab-btn ${tab === "empleados" ? "tab-active" : ""}`}
          onClick={() => setTab("empleados")}
        >
          👥 Empleados
        </button>
        <button
          className={`tab-btn ${tab === "clientes" ? "tab-active" : ""}`}
          onClick={() => setTab("clientes")}
        >
          🏢 Clientes
        </button>
      </div>

      {/* ════════════════════════════════════════
          TAB EMPLEADOS
      ════════════════════════════════════════ */}
      {tab === "empleados" && (
        <div className="table-container">
          <div className="table-header">
            <h2>Equipo de trabajo</h2>
            <button className="btn-secondary" onClick={abrirCrearEmpleado}>
              + Nuevo Empleado
            </button>
          </div>

          {errorEmpleado && (
            <div className="error-message">{errorEmpleado}</div>
          )}

          {mostrarFormEmpleado && (
            <form className="form-panel" onSubmit={handleSubmitEmpleado}>
              <h3 className="form-title">
                {formEmpleado.id ? "Editar empleado" : "Nuevo empleado"}
              </h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    name="nombre"
                    value={formEmpleado.nombre}
                    onChange={handleChangeEmpleado}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Apellido</label>
                  <input
                    name="apellido"
                    value={formEmpleado.apellido}
                    onChange={handleChangeEmpleado}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Correo</label>
                  <input
                    name="correo"
                    type="email"
                    value={formEmpleado.correo}
                    onChange={handleChangeEmpleado}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cargo</label>
                  <input
                    name="cargo"
                    value={formEmpleado.cargo}
                    onChange={handleChangeEmpleado}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Especialidad</label>
                  <input
                    name="especialidad"
                    value={formEmpleado.especialidad}
                    onChange={handleChangeEmpleado}
                  />
                </div>

                <div className="form-group">
                  <label>Disponibilidad</label>
                  <select
                    name="disponibilidad"
                    value={formEmpleado.disponibilidad}
                    onChange={handleChangeEmpleado}
                  >
                    <option value="DISPONIBLE">DISPONIBLE</option>
                    <option value="OCUPADO">OCUPADO</option>
                    <option value="NO_DISPONIBLE">NO DISPONIBLE</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn-primary btn-auto"
                  type="submit"
                  disabled={guardandoEmpleado}
                >
                  {guardandoEmpleado ? "Guardando..." : "Guardar"}
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={cerrarFormEmpleado}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {loadingEmpleados ? (
            <div className="loading">Cargando empleados...</div>
          ) : empleados.length === 0 ? (
            <div className="empty-state">
              <h3>No hay empleados registrados</h3>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre completo</th>
                  <th>Correo</th>
                  <th>Cargo</th>
                  <th>Especialidad</th>
                  <th>Disponibilidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((e) => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>
                      <strong>
                        {e.nombre} {e.apellido}
                      </strong>
                    </td>
                    <td>{e.correo}</td>
                    <td>{e.cargo}</td>
                    <td>{e.especialidad || "-"}</td>
                    <td>
                      <span className={getBadgeClass(e.disponibilidad)}>
                        {e.disponibilidad}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-secondary"
                          onClick={() => abrirEditarEmpleado(e)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleEliminarEmpleado(e.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          TAB CLIENTES
      ════════════════════════════════════════ */}
      {tab === "clientes" && (
        <div className="table-container">
          <div className="table-header">
            <h2>Clientes</h2>
            <button className="btn-secondary" onClick={abrirCrearCliente}>
              + Nuevo Cliente
            </button>
          </div>

          {errorCliente && (
            <div className="error-message">{errorCliente}</div>
          )}

          {mostrarFormCliente && (
            <form className="form-panel" onSubmit={handleSubmitCliente}>
              <h3 className="form-title">
                {formCliente.id ? "Editar cliente" : "Nuevo cliente"}
              </h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre del cliente</label>
                  <input
                    name="nombreCliente"
                    value={formCliente.nombreCliente}
                    onChange={handleChangeCliente}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Rubro</label>
                  <input
                    name="rubro"
                    value={formCliente.rubro}
                    onChange={handleChangeCliente}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Correo de contacto</label>
                  <input
                    name="correoContacto"
                    type="email"
                    value={formCliente.correoContacto}
                    onChange={handleChangeCliente}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    name="telefono"
                    value={formCliente.telefono}
                    onChange={handleChangeCliente}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn-primary btn-auto"
                  type="submit"
                  disabled={guardandoCliente}
                >
                  {guardandoCliente ? "Guardando..." : "Guardar"}
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={cerrarFormCliente}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {loadingClientes ? (
            <div className="loading">Cargando clientes...</div>
          ) : clientes.length === 0 ? (
            <div className="empty-state">
              <h3>No hay clientes registrados</h3>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Rubro</th>
                  <th>Correo contacto</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>
                      <strong>{c.nombreCliente}</strong>
                    </td>
                    <td>{c.rubro || "-"}</td>
                    <td>{c.correoContacto || "-"}</td>
                    <td>{c.telefono || "-"}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-secondary"
                          onClick={() => abrirEditarCliente(c)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleEliminarCliente(c.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}