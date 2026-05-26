import type { Usuario } from "../interfaces/usuario.interface";

export default function Header() {
  // Obtener usuario del localStorage
  const usuarioStr = localStorage.getItem("usuario");
  const usuario: Usuario | null = usuarioStr ? JSON.parse(usuarioStr) : null;

  const inicial = usuario?.nombre?.charAt(0).toUpperCase() || "U";

  return (
    <header className="header">
      <div className="header-greeting">
        Bienvenido(a), <strong>{usuario?.nombre || "Usuario"}</strong>
      </div>
      <div className="header-user">
        <span>{usuario?.correo || "usuario@innovacore.cl"}</span>
        <div className="user-avatar">{inicial}</div>
      </div>
    </header>
  );
}