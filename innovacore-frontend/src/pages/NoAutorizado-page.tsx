import { useNavigate } from "react-router-dom";

export default function NoAutorizadoPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <h1 className="page-title">Acceso no autorizado</h1>
      <p className="page-subtitle">
        No tienes permisos para acceder a esta sección del sistema.
      </p>

      <button className="btn-primary btn-auto" onClick={() => navigate("/dashboard")}>
        Volver al dashboard
      </button>
    </div>
  );
}