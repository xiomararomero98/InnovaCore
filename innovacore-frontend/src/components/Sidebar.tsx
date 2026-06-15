import { NavLink, useNavigate } from "react-router-dom";

type RolUsuario =
  | "ADMINISTRADOR"
  | "GESTOR_PROYECTOS"
  | "COLABORADOR"
  | "DIRECTIVO";

type MenuItem = {
  label: string;
  path: string;
  roles: RolUsuario[];
};

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    roles: ["ADMINISTRADOR", "GESTOR_PROYECTOS", "COLABORADOR", "DIRECTIVO"],
  },
  {
    label: "Mi Panel",
    path: "/mi-panel",
    roles: ["COLABORADOR"],
  },
  {
    label: "Proyectos",
    path: "/proyectos",
    roles: ["ADMINISTRADOR", "GESTOR_PROYECTOS", "DIRECTIVO"],
  },
  {
    label: "Recursos",
    path: "/recursos",
    roles: ["ADMINISTRADOR", "GESTOR_PROYECTOS"],
  },
  {
    label: "Analítica",
    path: "/analitica",
    roles: ["ADMINISTRADOR", "DIRECTIVO"],
  },
  {
    label: "Mi Perfil",
    path: "/perfil",
    roles: ["ADMINISTRADOR", "GESTOR_PROYECTOS", "COLABORADOR", "DIRECTIVO"],
  },
];

const getUsuario = () => {
  const usuarioStorage = localStorage.getItem("usuario");

  if (!usuarioStorage) {
    return null;
  }

  try {
    return JSON.parse(usuarioStorage);
  } catch (error) {
    console.error("Error leyendo usuario desde localStorage:", error);
    localStorage.removeItem("usuario");
    return null;
  }
};

const getRolUsuario = (): RolUsuario | null => {
  const usuario = getUsuario();

  if (!usuario) {
    return null;
  }

  const rol =
    usuario.rol?.nombreRol ||
    usuario.rol?.nombre ||
    usuario.nombreRol ||
    usuario.rol ||
    null;

  return rol as RolUsuario | null;
};

export default function Sidebar() {
  const navigate = useNavigate();
  const rolUsuario = getRolUsuario();

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const menuVisible = menuItems.filter(
    (item) => rolUsuario && item.roles.includes(rolUsuario)
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>InnovaCore</h1>
        <span>Solutions</span>
      </div>

      <ul className="sidebar-menu">
        {menuVisible.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        {rolUsuario && <p className="sidebar-role">{rolUsuario}</p>}

        <button className="btn-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>

        <p>InnovaCore v1.0</p>
      </div>
    </aside>
  );
}