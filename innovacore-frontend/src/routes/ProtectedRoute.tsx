import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

type RolUsuario =
  | "ADMINISTRADOR"
  | "GESTOR_PROYECTOS"
  | "COLABORADOR"
  | "DIRECTIVO";

const getUsuario = () => {
  const usuarioStorage = localStorage.getItem("usuario");
  if (!usuarioStorage) return null;
  try {
    return JSON.parse(usuarioStorage);
  } catch (error) {
    console.error("Error leyendo usuario desde localStorage:", error);
    localStorage.removeItem("usuario");
    return null;
  }
};

const getRolUsuario = (): string | null => {
  const usuario = getUsuario();
  if (!usuario) return null;
  return (
    usuario.rol?.nombreRol ||
    usuario.rol?.nombre ||
    usuario.nombreRol ||
    usuario.rol ||
    null
  );
};

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const usuario = getUsuario();
  if (!usuario) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RoleRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: RolUsuario[];
}) {
  const usuario = getUsuario();
  if (!usuario) return <Navigate to="/login" replace />;

  const rolUsuario = getRolUsuario();
  if (!rolUsuario || !allowedRoles.includes(rolUsuario as RolUsuario)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <>{children}</>;
}