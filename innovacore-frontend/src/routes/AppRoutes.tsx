import { createBrowserRouter, Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import Layout from "../components/Layout";
import LoginPage from "../pages/Login-page";
import DashboardPage from "../pages/Dashboard-page";
import ProyectosPage from "../pages/Proyectos-page";
import RecursosPage from "../pages/Recursos-page";
import AnaliticaPage from "../pages/Analitica-page";
import DetalleProyectoPage from "../pages/DetalleProyecto-page";
import NoAutorizadoPage from "../pages/NoAutorizado-page";
import NotFoundPage from "../pages/NotFound-page";
import MiPanelEmpleadoPage from "../pages/MiPanelEmpleado-page";
import PerfilUsuarioPage from "../pages/PerfilUsuario-page";

type RolUsuario =
  | "ADMINISTRADOR"
  | "GESTOR_PROYECTOS"
  | "COLABORADOR"
  | "DIRECTIVO";

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

const getRolUsuario = (): string | null => {
  const usuario = getUsuario();

  if (!usuario) {
    return null;
  }

  return (
    usuario.rol?.nombreRol ||
    usuario.rol?.nombre ||
    usuario.nombreRol ||
    usuario.rol ||
    null
  );
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const usuario = getUsuario();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RoleRoute = ({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: RolUsuario[];
}) => {
  const usuario = getUsuario();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const rolUsuario = getRolUsuario();

  if (!rolUsuario || !allowedRoles.includes(rolUsuario as RolUsuario)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "mi-panel",
        element: (
          <RoleRoute allowedRoles={["COLABORADOR"]}>
            <MiPanelEmpleadoPage />
          </RoleRoute>
        ),
      },
      {
        path: "perfil",
        element: <PerfilUsuarioPage />,
      },
      {
        path: "proyectos",
        element: (
          <RoleRoute
            allowedRoles={["ADMINISTRADOR", "GESTOR_PROYECTOS", "DIRECTIVO"]}
          >
            <ProyectosPage />
          </RoleRoute>
        ),
      },
      {
        path: "proyectos/:id",
        element: (
          <RoleRoute
            allowedRoles={["ADMINISTRADOR", "GESTOR_PROYECTOS", "DIRECTIVO"]}
          >
            <DetalleProyectoPage />
          </RoleRoute>
        ),
      },
      {
        path: "recursos",
        element: (
          <RoleRoute allowedRoles={["ADMINISTRADOR", "GESTOR_PROYECTOS"]}>
            <RecursosPage />
          </RoleRoute>
        ),
      },
      {
        path: "analitica",
        element: (
          <RoleRoute allowedRoles={["ADMINISTRADOR", "DIRECTIVO"]}>
            <AnaliticaPage />
          </RoleRoute>
        ),
      },
      {
        path: "no-autorizado",
        element: <NoAutorizadoPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;