import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../actions/login";

function LogoSVG() {
  return (
    <svg width="56" height="56" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="60,4 104,28 104,76 60,100 16,76 16,28" fill="#2F80ED" />
      <polygon points="60,20 88,36 88,68 60,84 32,68 32,36" fill="#1E3A5F" />
      <circle cx="60" cy="52" r="10" fill="#56CCF2" />
      <line x1="60" y1="20" x2="60" y2="42" stroke="#56CCF2" strokeWidth="3" strokeLinecap="round"/>
      <line x1="60" y1="62" x2="60" y2="84" stroke="#56CCF2" strokeWidth="3" strokeLinecap="round"/>
      <line x1="88" y1="36" x2="70" y2="46" stroke="#56CCF2" strokeWidth="3" strokeLinecap="round"/>
      <line x1="50" y1="58" x2="32" y2="68" stroke="#56CCF2" strokeWidth="3" strokeLinecap="round"/>
      <line x1="32" y1="36" x2="50" y2="46" stroke="#56CCF2" strokeWidth="3" strokeLinecap="round"/>
      <line x1="70" y1="58" x2="88" y2="68" stroke="#56CCF2" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="60" cy="20" r="5" fill="#56CCF2" opacity="0.8"/>
      <circle cx="88" cy="36" r="5" fill="#56CCF2" opacity="0.8"/>
      <circle cx="88" cy="68" r="5" fill="#56CCF2" opacity="0.8"/>
      <circle cx="60" cy="84" r="5" fill="#56CCF2" opacity="0.8"/>
      <circle cx="32" cy="68" r="5" fill="#56CCF2" opacity="0.8"/>
      <circle cx="32" cy="36" r="5" fill="#56CCF2" opacity="0.8"/>
    </svg>
  );
}

function IlustracionProyectos() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="20" width="58" height="100" rx="6" fill="rgba(255,255,255,0.15)"/>
      <rect x="70" y="20" width="58" height="100" rx="6" fill="rgba(255,255,255,0.15)"/>
      <rect x="140" y="20" width="58" height="100" rx="6" fill="rgba(255,255,255,0.15)"/>
      <rect x="0" y="20" width="58" height="18" rx="6" fill="rgba(255,255,255,0.3)"/>
      <rect x="70" y="20" width="58" height="18" rx="6" fill="rgba(255,255,255,0.3)"/>
      <rect x="140" y="20" width="58" height="18" rx="6" fill="rgba(255,255,255,0.3)"/>
      <text x="29" y="33" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="white" fontWeight="600">Pendiente</text>
      <text x="99" y="33" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="white" fontWeight="600">En curso</text>
      <text x="169" y="33" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="white" fontWeight="600">Listo</text>
      <rect x="6" y="46" width="46" height="24" rx="4" fill="white" opacity="0.9"/>
      <rect x="6" y="76" width="46" height="24" rx="4" fill="white" opacity="0.9"/>
      <rect x="76" y="46" width="46" height="24" rx="4" fill="white" opacity="0.9"/>
      <rect x="146" y="46" width="46" height="24" rx="4" fill="white" opacity="0.9"/>
      <rect x="146" y="76" width="46" height="24" rx="4" fill="white" opacity="0.9"/>
      <line x1="12" y1="54" x2="44" y2="54" stroke="#2F80ED" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="60" x2="36" y2="60" stroke="#B5D4F4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="84" x2="44" y2="84" stroke="#2F80ED" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="90" x2="36" y2="90" stroke="#B5D4F4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="82" y1="54" x2="114" y2="54" stroke="#56CCF2" strokeWidth="2" strokeLinecap="round"/>
      <line x1="82" y1="60" x2="104" y2="60" stroke="#9FE1CB" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="152" y1="54" x2="184" y2="54" stroke="#27AE60" strokeWidth="2" strokeLinecap="round"/>
      <line x1="152" y1="60" x2="174" y2="60" stroke="#C0DD97" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="152" y1="84" x2="184" y2="84" stroke="#27AE60" strokeWidth="2" strokeLinecap="round"/>
      <line x1="152" y1="90" x2="174" y2="90" stroke="#C0DD97" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="0" y="132" width="198" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
      <rect x="0" y="132" width="124" height="8" rx="4" fill="white"/>
      <text x="0" y="152" fontFamily="Segoe UI,sans-serif" fontSize="11" fill="rgba(255,255,255,0.9)">Avance automático del proyecto: 63%</text>
    </svg>
  );
}

function IlustracionRecursos() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="68" r="22" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.5"/>
      <circle cx="100" cy="58" r="9" fill="white" opacity="0.9"/>
      <ellipse cx="100" cy="80" rx="14" ry="10" fill="white" opacity="0.9"/>
      <circle cx="36" cy="52" r="16" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1"/>
      <circle cx="164" cy="52" r="16" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1"/>
      <circle cx="30" cy="110" r="16" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1"/>
      <circle cx="170" cy="110" r="16" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1"/>
      <circle cx="36" cy="46" r="6" fill="white" opacity="0.8"/>
      <ellipse cx="36" cy="60" rx="10" ry="7" fill="white" opacity="0.8"/>
      <circle cx="164" cy="46" r="6" fill="white" opacity="0.8"/>
      <ellipse cx="164" cy="60" rx="10" ry="7" fill="white" opacity="0.8"/>
      <circle cx="30" cy="104" r="6" fill="white" opacity="0.8"/>
      <ellipse cx="30" cy="118" rx="10" ry="7" fill="white" opacity="0.8"/>
      <circle cx="170" cy="104" r="6" fill="white" opacity="0.8"/>
      <ellipse cx="170" cy="118" rx="10" ry="7" fill="white" opacity="0.8"/>
      <line x1="78" y1="64" x2="52" y2="56" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="4,3"/>
      <line x1="122" y1="64" x2="148" y2="56" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="4,3"/>
      <line x1="84" y1="80" x2="46" y2="100" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4,3"/>
      <line x1="116" y1="80" x2="154" y2="100" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4,3"/>
      <rect x="20" y="138" width="72" height="16" rx="8" fill="rgba(255,255,255,0.3)"/>
      <text x="56" y="150" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="white" fontWeight="600">DISPONIBLE</text>
      <rect x="108" y="138" width="72" height="16" rx="8" fill="rgba(255,255,255,0.15)"/>
      <text x="144" y="150" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="rgba(255,255,255,0.8)" fontWeight="600">OCUPADO</text>
    </svg>
  );
}

function IlustracionAnalitica() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="200" height="110" rx="6" fill="rgba(255,255,255,0.12)"/>
      <line x1="24" y1="10" x2="24" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
      <line x1="24" y1="96" x2="194" y2="96" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
      <line x1="24" y1="76" x2="194" y2="76" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="3,3"/>
      <line x1="24" y1="56" x2="194" y2="56" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="3,3"/>
      <line x1="24" y1="36" x2="194" y2="36" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="3,3"/>
      <polygon points="24,92 58,82 92,68 126,54 160,44 194,30 194,96 24,96" fill="rgba(255,255,255,0.08)"/>
      <polyline points="24,92 58,82 92,68 126,54 160,44 194,30" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="24,88 58,78 92,72 126,64 160,58 194,50" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3"/>
      <circle cx="24" cy="92" r="3.5" fill="white"/>
      <circle cx="58" cy="82" r="3.5" fill="white"/>
      <circle cx="92" cy="68" r="3.5" fill="white"/>
      <circle cx="126" cy="54" r="3.5" fill="white"/>
      <circle cx="160" cy="44" r="3.5" fill="white"/>
      <circle cx="194" cy="30" r="5" fill="white" stroke="rgba(255,255,255,0.4)" strokeWidth="3"/>
      <rect x="0" y="118" width="60" height="36" rx="6" fill="rgba(255,255,255,0.2)"/>
      <text x="30" y="134" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="18" fontWeight="700" fill="white">4</text>
      <text x="30" y="148" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="rgba(255,255,255,0.8)">proyectos</text>
      <rect x="70" y="118" width="60" height="36" rx="6" fill="rgba(255,255,255,0.2)"/>
      <text x="100" y="134" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="18" fontWeight="700" fill="white">75%</text>
      <text x="100" y="148" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="rgba(255,255,255,0.8)">avance</text>
      <rect x="140" y="118" width="60" height="36" rx="6" fill="rgba(255,255,255,0.2)"/>
      <text x="170" y="134" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="18" fontWeight="700" fill="white">13</text>
      <text x="170" y="148" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="rgba(255,255,255,0.8)">tareas</text>
    </svg>
  );
}

function IlustracionRoles() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100,10 L128,24 L128,60 Q128,84 100,94 Q72,84 72,60 L72,24 Z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.5"/>
      <path d="M100,20 L120,30 L120,60 Q120,76 100,84 Q80,76 80,60 L80,30 Z" fill="rgba(255,255,255,0.15)"/>
      <rect x="90" y="52" width="20" height="16" rx="3" fill="white" opacity="0.9"/>
      <path d="M94,52 L94,46 Q94,40 100,40 Q106,40 106,46 L106,52" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="100" cy="59" r="2.5" fill="rgba(100,80,180,0.8)"/>
      <rect x="0" y="18" width="58" height="20" rx="10" fill="rgba(255,255,255,0.35)"/>
      <text x="29" y="32" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="white" fontWeight="700">ADMIN</text>
      <rect x="0" y="46" width="58" height="20" rx="10" fill="rgba(255,255,255,0.25)"/>
      <text x="29" y="60" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="white" fontWeight="600">GESTOR</text>
      <rect x="142" y="18" width="58" height="20" rx="10" fill="rgba(255,255,255,0.25)"/>
      <text x="171" y="32" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="white" fontWeight="600">DIRECTIVO</text>
      <rect x="142" y="46" width="58" height="20" rx="10" fill="rgba(255,255,255,0.2)"/>
      <text x="171" y="60" textAnchor="middle" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="rgba(255,255,255,0.85)" fontWeight="600">COLABORADOR</text>
      <line x1="58" y1="28" x2="72" y2="42" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3,2"/>
      <line x1="58" y1="56" x2="72" y2="58" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="3,2"/>
      <line x1="142" y1="28" x2="128" y2="42" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3,2"/>
      <line x1="142" y1="56" x2="128" y2="58" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="3,2"/>
      <rect x="0" y="108" width="200" height="48" rx="6" fill="rgba(255,255,255,0.15)"/>
      <text x="10" y="124" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="white" fontWeight="600">Acceso controlado por rol:</text>
      <text x="10" y="138" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="rgba(255,255,255,0.85)">· Admin: total  · Gestor: proyectos y recursos</text>
      <text x="10" y="150" fontFamily="Segoe UI,sans-serif" fontSize="9" fill="rgba(255,255,255,0.85)">· Directivo: lectura  · Colaborador: mis tareas</text>
    </svg>
  );
}

const slides = [
  {
    titulo: "Gestión de Proyectos",
    descripcion: "Crea y administra proyectos con seguimiento automático de avance y estado según el progreso real de las tareas.",
    bg: "linear-gradient(135deg, #1E3A5F 0%, #2F80ED 100%)",
    ilustracion: <IlustracionProyectos />,
  },
  {
    titulo: "Gestión de Recursos",
    descripcion: "Administra tu equipo, asigna empleados a proyectos y tareas, y monitorea su disponibilidad en tiempo real.",
    bg: "linear-gradient(135deg, #0F6E56 0%, #56CCF2 100%)",
    ilustracion: <IlustracionRecursos />,
  },
  {
    titulo: "Analítica en Tiempo Real",
    descripcion: "Visualiza KPIs clave: proyectos activos, avance promedio, recursos disponibles y tareas completadas.",
    bg: "linear-gradient(135deg, #1a5c38 0%, #27AE60 100%)",
    ilustracion: <IlustracionAnalitica />,
  },
  {
    titulo: "Control de Acceso por Roles",
    descripcion: "Administrador, Gestor, Directivo y Colaborador. Cada rol accede solo a lo que necesita.",
    bg: "linear-gradient(135deg, #26215C 0%, #7F77DD 100%)",
    ilustracion: <IlustracionRoles />,
  },
];

export default function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slideActual, setSlideActual] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSlideActual((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(intervalo);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const usuario = await login({ correo, contrasena });
      localStorage.setItem("usuario", JSON.stringify(usuario));
      navigate("/dashboard");
    } catch (err) {
      setError("Credenciales inválidas. Intenta nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const slide = slides[slideActual];

  return (
    <div className="login-split-container">
      <div className="login-split-left">
        <div className="login-box">
          <div className="login-logo">
            <LogoSVG />
            <h1>InnovaCore</h1>
            <p>Plataforma de Gestión de Proyectos</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="usuario@innovacore.cl" required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
          <div className="login-footer-note">
            <span>🔒</span>
            <span>¿Eres nuevo? Solicita tus credenciales a tu administrador.</span>
          </div>
        </div>
      </div>

      <div className="login-split-right" style={{ background: slide.bg }}>
        <div className="carousel-dots">
          {slides.map((_, i) => (
            <button key={i} className={`carousel-dot ${i === slideActual ? "carousel-dot-active" : ""}`} onClick={() => setSlideActual(i)} />
          ))}
        </div>
        <div className="carousel-slide" key={slideActual}>
          <div className="carousel-ilustracion">{slide.ilustracion}</div>
          <h2 className="carousel-titulo">{slide.titulo}</h2>
          <p className="carousel-descripcion">{slide.descripcion}</p>
        </div>
        <div className="carousel-progress">
          <div className="carousel-progress-bar" key={slideActual} />
        </div>
        <div className="carousel-branding">
          <strong>InnovaCore</strong> · Sistema de gestión empresarial
        </div>
      </div>
    </div>
  );
}