import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getUsuarioActual, getRolUsuario } from "../utils/auth";
import { actualizarUsuario, resetearContrasenaUsuario } from "../actions/get-usuarios";

type CambioContrasenaForm = {
  nuevaContrasena: string;
  confirmarContrasena: string;
};

const initialForm: CambioContrasenaForm = {
  nuevaContrasena: "",
  confirmarContrasena: "",
};

export default function PerfilUsuarioPage() {
  const navigate = useNavigate();
  const usuario = getUsuarioActual();
  const rol = getRolUsuario();

  const [form, setForm] = useState<CambioContrasenaForm>(initialForm);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [apellido, setApellido] = useState(usuario?.apellido || "");
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState("");
  const [mensajePerfil, setMensajePerfil] = useState("");

  if (!usuario) {
    navigate("/login");
    return null;
  }

  const handleChangeContrasena = (ev: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMensaje("");
  };

  const handleCambiarContrasena = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setError("");
    setMensaje("");

    if (form.nuevaContrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (form.nuevaContrasena !== form.confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setGuardando(true);
      await resetearContrasenaUsuario(usuario.id, form.nuevaContrasena);

      // Actualizar localStorage con datos frescos
      const usuarioActualizado = { ...usuario };
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));

      setMensaje("✅ Contraseña actualizada correctamente.");
      setForm(initialForm);
    } catch {
      setError("No se pudo actualizar la contraseña. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarPerfil = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setErrorPerfil("");
    setMensajePerfil("");

    if (!nombre.trim() || !apellido.trim()) {
      setErrorPerfil("Nombre y apellido son obligatorios.");
      return;
    }

    try {
      setGuardandoPerfil(true);
      const actualizado = await actualizarUsuario(usuario.id, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: usuario.correo,
        estado: usuario.estado ?? 1,
        idEmpleado: usuario.idEmpleado ?? null,
        rol: usuario.rol ? { nombreRol: usuario.rol.nombreRol as any } : undefined,
      });

      // Persist updated name in localStorage
      const usuarioActualizado = { ...usuario, nombre: actualizado.nombre, apellido: actualizado.apellido };
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));

      setMensajePerfil("✅ Datos actualizados correctamente.");
      setEditandoNombre(false);
    } catch {
      setErrorPerfil("No se pudo actualizar el perfil.");
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const inicial = nombre?.charAt(0).toUpperCase() || "U";

  const labelRol: Record<string, string> = {
    ADMINISTRADOR: "Administrador",
    GESTOR_PROYECTOS: "Gestor de Proyectos",
    COLABORADOR: "Colaborador",
    DIRECTIVO: "Directivo",
  };

  return (
    <div className="page-container">
      <button className="btn-secondary btn-auto" onClick={() => navigate("/dashboard")}>
        ← Volver al dashboard
      </button>

      <h1 className="page-title">Mi perfil</h1>
      <p className="page-subtitle">
        Administra tus datos personales y tu contraseña de acceso.
      </p>

      {/* Tarjeta de identidad */}
      <div className="table-container" style={{ maxWidth: 700 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div
            className="user-avatar"
            style={{ width: 64, height: 64, fontSize: 28, flexShrink: 0 }}
          >
            {inicial}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>
              {nombre} {apellido}
            </h2>
            <p style={{ margin: "4px 0 0", color: "var(--gris-oscuro)" }}>
              {usuario.correo}
            </p>
            <span
              className={`badge badge-${rol?.toLowerCase().replace("_", "-") || "colaborador"}`}
              style={{ marginTop: 6, display: "inline-block" }}
            >
              {labelRol[rol || ""] || rol}
            </span>
          </div>
        </div>

        {/* Editar nombre */}
        {!editandoNombre ? (
          <div className="form-actions" style={{ justifyContent: "flex-start" }}>
            <button
              className="btn-secondary btn-auto"
              onClick={() => {
                setEditandoNombre(true);
                setErrorPerfil("");
                setMensajePerfil("");
              }}
            >
              ✏️ Editar nombre y apellido
            </button>
          </div>
        ) : (
          <form onSubmit={handleGuardarPerfil} className="form-panel">
            <h3 className="form-title">Editar datos personales</h3>

            {errorPerfil && <div className="error-message">{errorPerfil}</div>}
            {mensajePerfil && <div className="success-message">{mensajePerfil}</div>}

            <div className="form-grid">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn-primary btn-auto"
                type="submit"
                disabled={guardandoPerfil}
              >
                {guardandoPerfil ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                className="btn-secondary"
                type="button"
                onClick={() => {
                  setEditandoNombre(false);
                  setNombre(usuario.nombre || "");
                  setApellido(usuario.apellido || "");
                  setErrorPerfil("");
                  setMensajePerfil("");
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {mensajePerfil && !editandoNombre && (
          <div className="success-message" style={{ marginTop: 12 }}>
            {mensajePerfil}
          </div>
        )}
      </div>

      {/* Cambio de contraseña */}
      <div className="table-container" style={{ maxWidth: 700, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Cambiar contraseña</h2>
        <p className="page-subtitle" style={{ marginBottom: 20 }}>
          Ingresa tu nueva contraseña. Mínimo 6 caracteres.
        </p>

        {error && <div className="error-message">{error}</div>}
        {mensaje && <div className="success-message">{mensaje}</div>}

        <form onSubmit={handleCambiarContrasena}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nueva contraseña</label>
              <input
                type="password"
                name="nuevaContrasena"
                value={form.nuevaContrasena}
                onChange={handleChangeContrasena}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                name="confirmarContrasena"
                value={form.confirmarContrasena}
                onChange={handleChangeContrasena}
                placeholder="Repite la contraseña"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn-primary btn-auto"
              type="submit"
              disabled={guardando}
            >
              {guardando ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </div>
        </form>
      </div>

      {/* Info de cuenta */}
      <div className="table-container" style={{ maxWidth: 700, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Información de cuenta</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Correo de acceso</label>
            <input value={usuario.correo} disabled />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <input
              value={usuario.estado === 0 ? "INACTIVO" : "ACTIVO"}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Rol en el sistema</label>
            <input value={labelRol[rol || ""] || rol || "-"} disabled />
          </div>
        </div>
        <p className="page-subtitle" style={{ marginTop: 12 }}>
          Para cambiar tu correo o rol, contacta al administrador del sistema.
        </p>
      </div>
    </div>
  );
}