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

const labelRol: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  GESTOR_PROYECTOS: "Gestor de Proyectos",
  COLABORADOR: "Colaborador",
  DIRECTIVO: "Directivo",
};

const colorRol: Record<string, string> = {
  ADMINISTRADOR:    "#1B5CC8",
  GESTOR_PROYECTOS: "#7C3AED",
  COLABORADOR:      "#16A34A",
  DIRECTIVO:        "#B45309",
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
      const usuarioActualizado = { ...usuario };
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
      setMensaje("Contraseña actualizada correctamente.");
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
      const usuarioActualizado = {
        ...usuario,
        nombre: actualizado.nombre,
        apellido: actualizado.apellido,
      };
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
      setMensajePerfil("Datos actualizados correctamente.");
      setEditandoNombre(false);
    } catch {
      setErrorPerfil("No se pudo actualizar el perfil.");
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const inicial = nombre?.charAt(0).toUpperCase() || "U";
  const rolColor = colorRol[rol || ""] || "#1B5CC8";
  const rolLabel = labelRol[rol || ""] || rol || "-";
  const estadoActivo = usuario.estado !== 0;

  return (
    <div className="page-container">
      {/* Back */}
      <button
        className="btn-secondary btn-auto"
        onClick={() => navigate("/dashboard")}
        style={{ marginBottom: 24 }}
      >
        ← Volver al dashboard
      </button>

      {/* ── HERO BENTO ── */}
      <div className="perfil-hero-bento">

        {/* Tarjeta identidad — ocupa 2 cols */}
        <div className="perfil-card perfil-card-identity">
          <div className="perfil-avatar-wrap">
            <div className="perfil-avatar-large">
              {inicial}
            </div>
            <div
              className="perfil-rol-dot"
              style={{ background: rolColor }}
              title={rolLabel}
            />
          </div>

          <div className="perfil-identity-info">
            <p className="perfil-eyebrow">Cuenta activa</p>
            <h2 className="perfil-nombre">
              {nombre} {apellido}
            </h2>
            <p className="perfil-correo">{usuario.correo}</p>
            <span
              className="perfil-badge-rol"
              style={{ background: `${rolColor}18`, color: rolColor, borderColor: `${rolColor}30` }}
            >
              {rolLabel}
            </span>
          </div>

          <div className="perfil-status-pill">
            <span className={`perfil-status-dot ${estadoActivo ? "dot-active" : "dot-inactive"}`} />
            {estadoActivo ? "Activo" : "Inactivo"}
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="perfil-card perfil-card-stat">
          <p className="perfil-stat-label">Rol en sistema</p>
          <p className="perfil-stat-value" style={{ color: rolColor }}>{rolLabel}</p>
        </div>

        <div className="perfil-card perfil-card-stat">
          <p className="perfil-stat-label">Correo de acceso</p>
          <p className="perfil-stat-value perfil-stat-email">{usuario.correo}</p>
        </div>

      </div>

      {/* ── GRID INFERIOR ── */}
      <div className="perfil-bottom-grid">

        {/* Editar nombre */}
        <div className="perfil-card">
          <div className="perfil-section-header">
            <div className="perfil-section-icon">✏️</div>
            <div>
              <h3 className="perfil-section-title">Datos personales</h3>
              <p className="perfil-section-sub">Actualiza tu nombre visible en el sistema</p>
            </div>
          </div>

          {mensajePerfil && !editandoNombre && (
            <div className="success-message">{mensajePerfil}</div>
          )}

          {!editandoNombre ? (
            <div className="perfil-display-row">
              <div className="perfil-display-field">
                <span className="perfil-field-label">Nombre</span>
                <span className="perfil-field-value">{nombre}</span>
              </div>
              <div className="perfil-display-field">
                <span className="perfil-field-label">Apellido</span>
                <span className="perfil-field-value">{apellido}</span>
              </div>
              <button
                className="btn-secondary btn-auto"
                style={{ marginTop: 8 }}
                onClick={() => {
                  setEditandoNombre(true);
                  setErrorPerfil("");
                  setMensajePerfil("");
                }}
              >
                Editar nombre y apellido
              </button>
            </div>
          ) : (
            <form onSubmit={handleGuardarPerfil}>
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
                  className="btn-secondary btn-auto"
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
        </div>

        {/* Cambiar contraseña */}
        <div className="perfil-card">
          <div className="perfil-section-header">
            <div className="perfil-section-icon">🔑</div>
            <div>
              <h3 className="perfil-section-title">Cambiar contraseña</h3>
              <p className="perfil-section-sub">Mínimo 6 caracteres</p>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {mensaje && <div className="success-message">{mensaje}</div>}

          <form onSubmit={handleCambiarContrasena}>
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

        {/* Info de cuenta — read-only, visual diferente */}
        <div className="perfil-card perfil-card-info">
          <div className="perfil-section-header">
            <div className="perfil-section-icon">🛡️</div>
            <div>
              <h3 className="perfil-section-title">Información de cuenta</h3>
              <p className="perfil-section-sub">Gestionado por el administrador</p>
            </div>
          </div>

          <div className="perfil-info-grid">
            <div className="perfil-info-item">
              <span className="perfil-field-label">Correo de acceso</span>
              <span className="perfil-field-value">{usuario.correo}</span>
            </div>
            <div className="perfil-info-item">
              <span className="perfil-field-label">Estado</span>
              <span className={`badge ${estadoActivo ? "badge-disponible" : "badge-no_disponible"}`}>
                {estadoActivo ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="perfil-info-item">
              <span className="perfil-field-label">Rol en el sistema</span>
              <span className="perfil-field-value">{rolLabel}</span>
            </div>
          </div>

          <p className="perfil-info-note">
            Para cambiar tu correo o rol, contacta al administrador del sistema.
          </p>
        </div>

      </div>
    </div>
  );
}