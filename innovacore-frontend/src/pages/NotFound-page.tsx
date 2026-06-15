import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <h1 className="page-title">404 - Página no encontrada</h1>
      <p className="page-subtitle">
        La ruta que intentas visitar no existe o fue movida.
      </p>

      <button className="btn-primary btn-auto" onClick={() => navigate("/dashboard")}>
        Volver al dashboard
      </button>
    </div>
  );
}