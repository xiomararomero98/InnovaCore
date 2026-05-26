import { useEffect, useState } from "react";
import { getEmpleados } from "../actions/get-empleados";
import type { Empleado } from "../interfaces/empleado.interface";

export default function RecursosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      const data = await getEmpleados();
      setEmpleados(data);
    } catch (error) {
      console.error("Error cargando empleados:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (valor: string) => {
    return `badge badge-${valor.toLowerCase()}`;
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Gestión de Recursos</h1>
      <p className="page-subtitle">Empleados y profesionales de la organización</p>

      <div className="table-container">
        <div className="table-header">
          <h2>Equipo de trabajo</h2>
        </div>

        {loading ? (
          <div className="loading">Cargando empleados...</div>
        ) : empleados.length === 0 ? (
          <div className="empty-state">
            <h3>No hay empleados registrados</h3>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre completo</th>
                <th>Correo</th>
                <th>Cargo</th>
                <th>Especialidad</th>
                <th>Disponibilidad</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td><strong>{e.nombre} {e.apellido}</strong></td>
                  <td>{e.correo}</td>
                  <td>{e.cargo || "-"}</td>
                  <td>{e.especialidad || "-"}</td>
                  <td>
                    <span className={getBadgeClass(e.disponibilidad)}>
                      {e.disponibilidad}
                    </span>
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