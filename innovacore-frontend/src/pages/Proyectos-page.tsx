import { useEffect, useState } from "react";
import { getProyectos } from "../actions/get-proyectos";
import type { Proyecto } from "../interfaces/proyecto.interface";

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    try {
      const data = await getProyectos();
      setProyectos(data);
    } catch (error) {
      console.error("Error cargando proyectos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (valor: string) => {
    return `badge badge-${valor.toLowerCase().replace("_", "-")}`;
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Gestión de Proyectos</h1>
      <p className="page-subtitle">Administra todos los proyectos de la organización</p>

      <div className="table-container">
        <div className="table-header">
          <h2>Listado de Proyectos</h2>
          <button className="btn-secondary">+ Nuevo Proyecto</button>
        </div>

        {loading ? (
          <div className="loading">Cargando proyectos...</div>
        ) : proyectos.length === 0 ? (
          <div className="empty-state">
            <h3>No hay proyectos registrados</h3>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Avance</th>
                <th>Fechas</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><strong>{p.nombreProyecto}</strong></td>
                  <td>{p.cliente?.nombreCliente || "Sin cliente"}</td>
                  <td>
                    <span className={getBadgeClass(p.estadoProyecto)}>
                      {p.estadoProyecto}
                    </span>
                  </td>
                  <td>
                    <span className={getBadgeClass(p.prioridad)}>
                      {p.prioridad}
                    </span>
                  </td>
                  <td>{p.porcentajeAvance}%</td>
                  <td style={{ fontSize: "12px" }}>
                    {p.fechaInicio} <br /> a {p.fechaFin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}