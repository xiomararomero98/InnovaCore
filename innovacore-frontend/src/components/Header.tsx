import { useNavigate } from "react-router-dom";
import type { Usuario } from "../interfaces/usuario.interface";

export default function Header() {
  const navigate = useNavigate();
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
        <button
          className="user-avatar"
          onClick={() => navigate("/perfil")}
          title="Ver mi perfil"
          style={{ cursor: "pointer", border: "none", background: "none", padding: 0 }}
        >
          {inicial}
        </button>
      </div>
    </header>
  );
}