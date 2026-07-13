import { useState, useEffect, useCallback } from "react";
import { getComentariosByTarea, crearComentario, eliminarComentario } from "../actions/get-comentarios";
import type { ComentarioTarea } from "../actions/get-comentarios";
import { getUsuarioActual, getRolUsuario } from "../utils/auth";

interface Props {
  idTarea: number;
  nombreTarea: string;
  idsEmpleadosAsignados?: number[];
  idsEmpleadosProyecto?: number[];
  esPropietario?: boolean; // true cuando el colaborador ve sus propias tareas en Mi Panel
}

export default function ComentariosTarea({ idTarea, nombreTarea, idsEmpleadosAsignados = [], idsEmpleadosProyecto = [], esPropietario = false }: Props) {
  const [comentarios, setComentarios] = useState<ComentarioTarea[]>([]);
  const [contenido, setContenido] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const usuario = getUsuarioActual();
  const rol = getRolUsuario();

  // Reglas de acceso:
  // ADMINISTRADOR y GESTOR_PROYECTOS → pueden comentar cualquier tarea
  // COLABORADOR → solo puede comentar si está asignado a la tarea
  // DIRECTIVO → solo lectura
  const puedeComentar = (() => {
    if (!usuario || !rol) return false;
    if (rol === "ADMINISTRADOR" || rol === "GESTOR_PROYECTOS") return true;
    if (rol === "COLABORADOR") return esPropietario || idsEmpleadosAsignados.includes(usuario.idEmpleado) || idsEmpleadosProyecto.includes(usuario.idEmpleado);
    return false; // DIRECTIVO
  })();

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getComentariosByTarea(idTarea);
      setComentarios(data);
    } catch {
      setError("No se pudieron cargar los comentarios.");
    } finally {
      setLoading(false);
    }
  }, [idTarea]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const handleEnviar = async () => {
    if (!contenido.trim() || !usuario || !puedeComentar) return;
    try {
      setEnviando(true);
      setError("");
      await crearComentario(
        idTarea,
        usuario.id,
        `${usuario.nombre} ${usuario.apellido}`,
        contenido.trim()
      );
      setContenido("");
      await cargar();
    } catch {
      setError("No se pudo enviar el comentario.");
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (idComentario: number) => {
    if (!usuario) return;
    if (!window.confirm("¿Eliminar este comentario?")) return;
    try {
      await eliminarComentario(idTarea, idComentario, usuario.id);
      await cargar();
    } catch {
      setError("No se pudo eliminar el comentario.");
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-CL", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="comentarios-tarea">
      <h4 className="comentarios-titulo">
        💬 Comentarios — {nombreTarea}
      </h4>

      {error && <div className="error-message">{error}</div>}

      {/* Lista de comentarios */}
      <div className="comentarios-lista">
        {loading ? (
          <p className="loading-inline">Cargando comentarios...</p>
        ) : comentarios.length === 0 ? (
          <p className="comentarios-vacio">
            {puedeComentar ? "Aún no hay comentarios. ¡Sé el primero!" : "Aún no hay comentarios."}
          </p>
        ) : (
          comentarios.map((c) => (
            <div key={c.id} className={`comentario-item ${c.idUsuario === usuario?.id ? "comentario-propio" : ""}`}>
              <div className="comentario-header">
                <div className="comentario-avatar">
                  {c.nombreUsuario.charAt(0).toUpperCase()}
                </div>
                <div className="comentario-meta">
                  <strong>{c.nombreUsuario}</strong>
                  <span>{formatFecha(c.fechaCreacion)}</span>
                </div>
                {c.idUsuario === usuario?.id && (
                  <button
                    className="comentario-eliminar"
                    onClick={() => handleEliminar(c.id)}
                    title="Eliminar comentario"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="comentario-contenido">{c.contenido}</p>
            </div>
          ))
        )}
      </div>

      {/* Formulario — solo si puede comentar */}
      {puedeComentar ? (
        <div className="comentario-nuevo">
          <textarea
            className="comentario-input"
            placeholder="Escribe un comentario..."
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            rows={3}
            maxLength={2000}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) void handleEnviar();
            }}
          />
          <div className="comentario-footer">
            <span className="comentario-chars">{contenido.length}/2000 — Ctrl+Enter para enviar</span>
            <button
              className="btn-primary btn-auto"
              onClick={handleEnviar}
              disabled={enviando || !contenido.trim()}
            >
              {enviando ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </div>
      ) : (
        <div className="comentario-nuevo">
          <p className="comentario-vacio">
            {rol === "DIRECTIVO"
              ? "Solo lectura — el rol Directivo no puede comentar."
              : "No estás asignado a esta tarea, no puedes comentar."}
          </p>
        </div>
      )}
    </div>
  );
}