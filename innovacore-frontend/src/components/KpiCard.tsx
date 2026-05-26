interface KpiCardProps {
  title: string;
  value: number | string;
  description?: string;
  unit?: string;
  tipo?: "proyectos" | "recursos" | "exito" | "alerta";
}

export default function KpiCard(props: KpiCardProps) {
  const { title, value, description, unit, tipo = "proyectos" } = props;

  return (
    <div className={`kpi-card ${tipo}`}>
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">
        {value}
        {unit === "%" && <span style={{ fontSize: "20px" }}>%</span>}
      </div>
      {description && <div className="kpi-description">{description}</div>}
    </div>
  );
}