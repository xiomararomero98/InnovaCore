import {
  useCallback,
  useEffect,
  useMemo,
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

import {
  getAsignacionesByEmpleado,
  finalizarAsignacion,
  type Asignacion,
} from "../actions/get-asignaciones";

import { getProyectoById } from "../actions/get-proyectos";
import { getTareasByProyecto } from "../actions/get-tareas";

import {
  buscarUsuarioByEmpleadoOCorreo,
  crearUsuario,
  actualizarUsuario,
  resetearContrasenaUsuario,
  activarUsuario,
  desactivarUsuario,
  type NombreRol,
  type UsuarioSimple,
} from "../actions/get-usuarios";

import type { Empleado } from "../interfaces/empleado.interface";
import type { ClienteSimple } from "../interfaces/cliente.interface";

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

type CredencialesForm = {
  rol: NombreRol;
  contrasenaTemporal: string;
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

const initialCredencialesForm: CredencialesForm = {
  rol: "COLABORADOR",
  contrasenaTemporal: "",
};

const rolesSistema: NombreRol[] = [
  "COLABORADOR",
  "GESTOR_PROYECTOS",
  "ADMINISTRADOR",
  "DIRECTIVO",
];

export default function RecursosPage() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<"empleados" | "clientes">("empleados");

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [mostrarFormEmpleado, setMostrarFormEmpleado] = useState(false);
  const [formEmpleado, setFormEmpleado] =
    useState<EmpleadoForm>(initialEmpleadoForm);
  const [guardandoEmpleado, setGuardandoEmpleado] = useState(false);
  const [errorEmpleado, setErrorEmpleado] = useState("");

  const [empleadoSeleccionado, setEmpleadoSeleccionado] =
    useState<Empleado | null>(null);
  const [usuarioEmpleado, setUsuarioEmpleado] =
    useState<UsuarioSimple | null>(null);
  const [asignacionesEmpleado, setAsignacionesEmpleado] = useState<
    Asignacion[]
  >([]);
  const [nombresProyectos, setNombresProyectos] = useState<
    Record<number, string>
  >({});
  const [nombresTareas, setNombresTareas] = useState<Record<number, string>>(
    {}
  );
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [errorCredenciales, setErrorCredenciales] = useState("");
  const [mensajeCredenciales, setMensajeCredenciales] = useState("");
  const [credencialesForm, setCredencialesForm] =
    useState<CredencialesForm>(initialCredencialesForm);
  const [guardandoCredenciales, setGuardandoCredenciales] = useState(false);

  const [clientes, setClientes] = useState<ClienteSimple[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [mostrarFormCliente, setMostrarFormCliente] = useState(false);
  const [formCliente, setFormCliente] =
    useState<ClienteForm>(initialClienteForm);
  const [guardandoCliente, setGuardandoCliente] = useState(false);
  const [errorCliente, setErrorCliente] = useState("");

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

  const cargarNombresAsignaciones = async (asignaciones: Asignacion[]) => {
    const idsProyecto = Array.from(
      new Set(asignaciones.map((a) => a.idProyecto))
    );

    const proyectosResponse = await Promise.all(
      idsProyecto.map(async (idProyecto) => {
        try {
          const proyecto = await getProyectoById(idProyecto);
          return {
            idProyecto,
            nombre: proyecto.nombreProyecto,
          };
        } catch {
          return {
            idProyecto,
            nombre: `Proyecto ${idProyecto}`,
          };
        }
      })
    );

    const proyectosMap: Record<number, string> = {};

    proyectosResponse.forEach((p) => {
      proyectosMap[p.idProyecto] = p.nombre;
    });

    setNombresProyectos(proyectosMap);

    const tareasResponse = await Promise.all(
      idsProyecto.map(async (idProyecto) => {
        try {
          return await getTareasByProyecto(idProyecto);
        } catch {
          return [];
        }
      })
    );

    const tareasMap: Record<number, string> = {};

    tareasResponse.flat().forEach((tarea) => {
      if (tarea.id) {
        tareasMap[tarea.id] = tarea.nombreTarea;
      }
    });

    setNombresTareas(tareasMap);
  };

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

      if (empleadoSeleccionado?.id === id) {
        setEmpleadoSeleccionado(null);
        setUsuarioEmpleado(null);
        setAsignacionesEmpleado([]);
        setNombresProyectos({});
        setNombresTareas({});
      }

      await cargarEmpleados();
    } catch {
      setErrorEmpleado("No se pudo eliminar el empleado.");
    }
  };

  const cargarPerfilEmpleado = useCallback(async (empleado: Empleado) => {
    try {
      setLoadingPerfil(true);
      setErrorCredenciales("");
      setMensajeCredenciales("");
      setEmpleadoSeleccionado(empleado);

      const [usuario, asignaciones] = await Promise.all([
        buscarUsuarioByEmpleadoOCorreo(empleado.id, empleado.correo),
        getAsignacionesByEmpleado(empleado.id),
      ]);

      setUsuarioEmpleado(usuario);
      setAsignacionesEmpleado(asignaciones);
      await cargarNombresAsignaciones(asignaciones);

      setCredencialesForm({
        rol:
          (usuario?.rol?.nombreRol as NombreRol | undefined) || "COLABORADOR",
        contrasenaTemporal: "",
      });
    } catch (error) {
      console.error("Error cargando perfil del empleado:", error);
      setErrorCredenciales("No se pudo cargar el perfil del empleado.");
    } finally {
      setLoadingPerfil(false);
    }
  }, []);

  const cerrarPerfilEmpleado = () => {
    setEmpleadoSeleccionado(null);
    setUsuarioEmpleado(null);
    setAsignacionesEmpleado([]);
    setNombresProyectos({});
    setNombresTareas({});
    setErrorCredenciales("");
    setMensajeCredenciales("");
    setCredencialesForm(initialCredencialesForm);
  };

  const handleChangeCredenciales = (
    ev: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = ev.target;
    setCredencialesForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCrearCredenciales = async () => {
    if (!empleadoSeleccionado) return;

    if (!credencialesForm.contrasenaTemporal.trim()) {
      setErrorCredenciales("Debes ingresar una contraseña temporal.");
      return;
    }

    try {
      setGuardandoCredenciales(true);
      setErrorCredenciales("");
      setMensajeCredenciales("");

      const usuarioCreado = await crearUsuario({
        nombre: empleadoSeleccionado.nombre,
        apellido: empleadoSeleccionado.apellido,
        correo: empleadoSeleccionado.correo,
        contrasena: credencialesForm.contrasenaTemporal,
        estado: 1,
        idEmpleado: empleadoSeleccionado.id,
        rol: {
          nombreRol: credencialesForm.rol,
        },
      });

      setUsuarioEmpleado(usuarioCreado);
      setMensajeCredenciales(
        "Credenciales creadas correctamente. Este usuario ya puede iniciar sesión."
      );
      setCredencialesForm((prev) => ({
        ...prev,
        contrasenaTemporal: "",
      }));
    } catch (error) {
      console.error("Error creando credenciales:", error);
      setErrorCredenciales(
        "No se pudieron crear las credenciales. Revisa si el correo o empleado ya tiene usuario."
      );
    } finally {
      setGuardandoCredenciales(false);
    }
  };

  const handleActualizarRol = async () => {
    if (!usuarioEmpleado || !empleadoSeleccionado) return;

    try {
      setGuardandoCredenciales(true);
      setErrorCredenciales("");
      setMensajeCredenciales("");

      const usuarioActualizado = await actualizarUsuario(usuarioEmpleado.id, {
        nombre: empleadoSeleccionado.nombre,
        apellido: empleadoSeleccionado.apellido,
        correo: empleadoSeleccionado.correo,
        estado: usuarioEmpleado.estado ?? 1,
        idEmpleado: empleadoSeleccionado.id,
        rol: {
          nombreRol: credencialesForm.rol,
        },
      });

      setUsuarioEmpleado(usuarioActualizado);
      setMensajeCredenciales("Rol actualizado correctamente.");
    } catch (error) {
      console.error("Error actualizando rol:", error);
      setErrorCredenciales("No se pudo actualizar el rol del usuario.");
    } finally {
      setGuardandoCredenciales(false);
    }
  };

  const handleResetearContrasena = async () => {
    if (!usuarioEmpleado) return;

    if (!credencialesForm.contrasenaTemporal.trim()) {
      setErrorCredenciales("Debes ingresar una nueva contraseña temporal.");
      return;
    }

    try {
      setGuardandoCredenciales(true);
      setErrorCredenciales("");
      setMensajeCredenciales("");

      const usuarioActualizado = await resetearContrasenaUsuario(
        usuarioEmpleado.id,
        credencialesForm.contrasenaTemporal
      );

      setUsuarioEmpleado(usuarioActualizado);
      setMensajeCredenciales("Contraseña temporal actualizada correctamente.");
      setCredencialesForm((prev) => ({
        ...prev,
        contrasenaTemporal: "",
      }));
    } catch (error) {
      console.error("Error reseteando contraseña:", error);
      setErrorCredenciales("No se pudo resetear la contraseña.");
    } finally {
      setGuardandoCredenciales(false);
    }
  };

  const handleCambiarEstadoUsuario = async () => {
    if (!usuarioEmpleado) return;

    try {
      setGuardandoCredenciales(true);
      setErrorCredenciales("");
      setMensajeCredenciales("");

      const usuarioActualizado =
        usuarioEmpleado.estado === 0
          ? await activarUsuario(usuarioEmpleado.id)
          : await desactivarUsuario(usuarioEmpleado.id);

      setUsuarioEmpleado(usuarioActualizado);
      setMensajeCredenciales(
        usuarioActualizado.estado === 1
          ? "Usuario activado correctamente."
          : "Usuario desactivado correctamente."
      );
    } catch (error) {
      console.error("Error cambiando estado del usuario:", error);
      setErrorCredenciales("No se pudo cambiar el estado del usuario.");
    } finally {
      setGuardandoCredenciales(false);
    }
  };

  const handleFinalizarAsignacion = async (idAsignacion: number) => {
    if (!empleadoSeleccionado) return;

    if (!window.confirm("¿Seguro que deseas quitar esta asignación activa?")) {
      return;
    }

    try {
      setErrorCredenciales("");
      setMensajeCredenciales("");

      await finalizarAsignacion(idAsignacion);

      setMensajeCredenciales("Asignación finalizada correctamente.");

      await cargarPerfilEmpleado(empleadoSeleccionado);
      await cargarEmpleados();
    } catch (error) {
      console.error("Error finalizando asignación:", error);
      setErrorCredenciales("No se pudo finalizar la asignación.");
    }
  };

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

  const getBadgeClass = (valor: string) =>
    `badge badge-${valor.toLowerCase()}`;

  const asignacionesActivas = useMemo(() => {
    return asignacionesEmpleado.filter(
      (a) => a.estado?.toUpperCase() === "ACTIVA"
    );
  }, [asignacionesEmpleado]);

  const horasActivas = useMemo(() => {
    const horasPorProyecto = new Map<
      number,
      {
        horasProyectoCompleto: number;
        horasTareas: number;
        tieneAsignacionGeneral: boolean;
      }
    >();

    asignacionesActivas.forEach((a) => {
      const actual = horasPorProyecto.get(a.idProyecto) || {
        horasProyectoCompleto: 0,
        horasTareas: 0,
        tieneAsignacionGeneral: false,
      };

      if (a.idTarea === undefined || a.idTarea === null) {
        actual.horasProyectoCompleto += a.horasAsignadas || 0;
        actual.tieneAsignacionGeneral = true;
      } else {
        actual.horasTareas += a.horasAsignadas || 0;
      }

      horasPorProyecto.set(a.idProyecto, actual);
    });

    return Array.from(horasPorProyecto.values()).reduce((total, item) => {
      if (item.tieneAsignacionGeneral) {
        return total + item.horasProyectoCompleto;
      }

      return total + item.horasTareas;
    }, 0);
  }, [asignacionesActivas]);

  const proyectosAsignados = useMemo(() => {
    return new Set(asignacionesActivas.map((a) => a.idProyecto)).size;
  }, [asignacionesActivas]);

  const tareasAsignadas = useMemo(() => {
    return new Set(
      asignacionesActivas
        .map((a) => a.idTarea)
        .filter((idTarea) => idTarea !== null && idTarea !== undefined)
    ).size;
  }, [asignacionesActivas]);

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-CL");
  };

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
        Administra empleados, clientes, asignaciones y credenciales de acceso.
      </p>

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

      {tab === "empleados" && (
        <>
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
                            className="btn-primary"
                            onClick={() => cargarPerfilEmpleado(e)}
                          >
                            Ver perfil
                          </button>

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

          {empleadoSeleccionado && (
            <div className="table-container">
              <div className="table-header">
                <div>
                  <h2>
                    Perfil de {empleadoSeleccionado.nombre}{" "}
                    {empleadoSeleccionado.apellido}
                  </h2>
                  <p>
                    Datos laborales, credenciales de sistema y asignaciones
                    activas.
                  </p>
                </div>

                <button className="btn-secondary" onClick={cerrarPerfilEmpleado}>
                  Cerrar perfil
                </button>
              </div>

              {loadingPerfil ? (
                <div className="loading">Cargando perfil...</div>
              ) : (
                <>
                  {errorCredenciales && (
                    <div className="error-message">{errorCredenciales}</div>
                  )}

                  {mensajeCredenciales && (
                    <div className="success-message">
                      {mensajeCredenciales}
                    </div>
                  )}

                  <div className="dashboard-grid">
                    <div className="kpi-card recursos">
                      <div className="kpi-title">Cargo</div>
                      <div className="kpi-value" style={{ fontSize: "24px" }}>
                        {empleadoSeleccionado.cargo || "-"}
                      </div>
                      <div className="kpi-description">
                        {empleadoSeleccionado.especialidad || "Sin especialidad"}
                      </div>
                    </div>

                    <div className="kpi-card exito">
                      <div className="kpi-title">Disponibilidad</div>
                      <div className="kpi-value" style={{ fontSize: "26px" }}>
                        {empleadoSeleccionado.disponibilidad}
                      </div>
                      <div className="kpi-description">
                        Estado laboral del recurso
                      </div>
                    </div>

                    <div className={horasActivas > 40 ? "kpi-card alerta" : "kpi-card proyectos"}>
                      <div className="kpi-title">Horas consideradas</div>
                      <div className="kpi-value">{horasActivas}</div>
                      <div className="kpi-description">
                        {horasActivas > 40
                          ? `Sobrecarga: ${horasActivas}/40h`
                          : `${horasActivas}/40h asignadas`}
                      </div>
                    </div>

                    <div className="kpi-card alerta">
                      <div className="kpi-title">Asignaciones</div>
                      <div className="kpi-value">
                        {asignacionesActivas.length}
                      </div>
                      <div className="kpi-description">
                        Proyectos: {proyectosAsignados} | Tareas:{" "}
                        {tareasAsignadas}
                      </div>
                    </div>
                  </div>

                  <div className="form-panel">
                    <h3 className="form-title">Credenciales de sistema</h3>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Correo de acceso</label>
                        <input value={empleadoSeleccionado.correo} disabled />
                      </div>

                      <div className="form-group">
                        <label>Estado usuario</label>
                        <input
                          value={
                            usuarioEmpleado
                              ? usuarioEmpleado.estado === 0
                                ? "INACTIVO"
                                : "ACTIVO"
                              : "SIN USUARIO"
                          }
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label>Rol de acceso</label>
                        <select
                          name="rol"
                          value={credencialesForm.rol}
                          onChange={handleChangeCredenciales}
                        >
                          {rolesSistema.map((rol) => (
                            <option key={rol} value={rol}>
                              {rol}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>
                          {usuarioEmpleado
                            ? "Nueva contraseña temporal"
                            : "Contraseña temporal"}
                        </label>
                        <input
                          name="contrasenaTemporal"
                          type="text"
                          value={credencialesForm.contrasenaTemporal}
                          onChange={handleChangeCredenciales}
                          placeholder="Ej: Temporal123!"
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      {!usuarioEmpleado ? (
                        <button
                          className="btn-primary btn-auto"
                          type="button"
                          disabled={guardandoCredenciales}
                          onClick={handleCrearCredenciales}
                        >
                          {guardandoCredenciales
                            ? "Creando..."
                            : "Crear credenciales"}
                        </button>
                      ) : (
                        <>
                          <button
                            className="btn-primary btn-auto"
                            type="button"
                            disabled={guardandoCredenciales}
                            onClick={handleActualizarRol}
                          >
                            Actualizar rol
                          </button>

                          <button
                            className="btn-secondary"
                            type="button"
                            disabled={guardandoCredenciales}
                            onClick={handleResetearContrasena}
                          >
                            Resetear contraseña
                          </button>

                          <button
                            className={
                              usuarioEmpleado.estado === 0
                                ? "btn-primary"
                                : "btn-danger"
                            }
                            type="button"
                            disabled={guardandoCredenciales}
                            onClick={handleCambiarEstadoUsuario}
                          >
                            {usuarioEmpleado.estado === 0
                              ? "Activar usuario"
                              : "Desactivar usuario"}
                          </button>
                        </>
                      )}
                    </div>

                    {usuarioEmpleado && (
                      <p className="page-subtitle" style={{ marginTop: "12px" }}>
                        Este empleado ya tiene credenciales reales. Puede iniciar
                        sesión con su correo y la contraseña temporal definida o
                        reseteada.
                      </p>
                    )}
                  </div>

                  <div className="table-container">
                    <div className="table-header">
                      <h3>Asignaciones del empleado</h3>
                    </div>

                    {asignacionesEmpleado.length === 0 ? (
                      <div className="empty-state">
                        <h3>Este empleado no tiene asignaciones registradas</h3>
                      </div>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Proyecto</th>
                            <th>Tarea</th>
                            <th>Rol proyecto</th>
                            <th>Horas</th>
                            <th>Estado</th>
                            <th>Fecha asignación</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>

                        <tbody>
                          {asignacionesEmpleado.map((a) => (
                            <tr key={a.id}>
                              <td>
                                <strong>
                                  {nombresProyectos[a.idProyecto] ||
                                    `Proyecto ${a.idProyecto}`}
                                </strong>
                                <p className="row-hint">ID: {a.idProyecto}</p>
                              </td>

                              <td>
                                {a.idTarea ? (
                                  <>
                                    <strong>
                                      {nombresTareas[a.idTarea] ||
                                        `Tarea ${a.idTarea}`}
                                    </strong>
                                    <p className="row-hint">ID: {a.idTarea}</p>
                                  </>
                                ) : (
                                  "Proyecto completo"
                                )}
                              </td>

                              <td>{a.rolEnProyecto}</td>
                              <td>{a.horasAsignadas}h</td>

                              <td>
                                <span className={getBadgeClass(a.estado)}>
                                  {a.estado}
                                </span>
                              </td>

                              <td>{formatearFecha(a.fechaAsignacion)}</td>

                              <td>
                                {a.estado?.toUpperCase() === "ACTIVA" ? (
                                  <button
                                    className="btn-danger"
                                    type="button"
                                    onClick={() => handleFinalizarAsignacion(a.id)}
                                  >
                                    Quitar
                                  </button>
                                ) : (
                                  <span className="row-hint">Sin acciones</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {tab === "clientes" && (
        <div className="table-container">
          <div className="table-header">
            <h2>Clientes</h2>
            <button className="btn-secondary" onClick={abrirCrearCliente}>
              + Nuevo Cliente
            </button>
          </div>

          {errorCliente && <div className="error-message">{errorCliente}</div>}

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