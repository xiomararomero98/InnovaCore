interface KpiCardProps {
  title: string;
  value: number | string;
  description?: string;
  unit?: string;
  tipo?: "proyectos" | "recursos" | "exito" | "alerta";
  onClick?: () => void;
}

export default function KpiCard(props: KpiCardProps) {
  const {
    title,
    value,
    description,
    unit,
    tipo = "proyectos",
    onClick,
  } = props;

  const isClickable = Boolean(onClick);

  return (
    <div
      className={`kpi-card ${tipo} ${isClickable ? "clickable-card" : ""}`}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(event) => {
        if (isClickable && (event.key === "Enter" || event.key === " ")) {
          onClick?.();
        }
      }}
    >
      <div className="kpi-title">{title}</div>

      <div className="kpi-value">
        {value}
        {unit === "%" && <span style={{ fontSize: "20px" }}>%</span>}
      </div>

      {description && <div className="kpi-description">{description}</div>}

      {isClickable && <div className="row-hint">Click para ver detalle</div>}
    </div>
  );
}