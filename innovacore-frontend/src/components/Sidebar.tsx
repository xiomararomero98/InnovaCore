import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>InnovaCore</h1>
        <span>Solutions</span>
      </div>

      <ul className="sidebar-menu">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
             Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/proyectos" className={({ isActive }) => (isActive ? "active" : "")}>
             Proyectos
          </NavLink>
        </li>
        <li>
          <NavLink to="/recursos" className={({ isActive }) => (isActive ? "active" : "")}>
             Recursos
          </NavLink>
        </li>
        <li>
          <NavLink to="/analitica" className={({ isActive }) => (isActive ? "active" : "")}>
             Analítica
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
        <p>InnovaCore v1.0</p>
      </div>
    </aside>
  );
}