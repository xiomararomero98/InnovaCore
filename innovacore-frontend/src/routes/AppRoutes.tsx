import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import LoginPage from "../pages/Login-page";
import DashboardPage from "../pages/Dashboard-page";
import ProyectosPage from "../pages/Proyectos-page";
import RecursosPage from "../pages/Recursos-page";
import AnaliticaPage from "../pages/Analitica-page";

// Función para verificar si el usuario está logueado
const isAuthenticated = () => {
  return localStorage.getItem("usuario") !== null;
};

// Componente para proteger rutas privadas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
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
      { path: "dashboard", element: <DashboardPage /> },
      { path: "proyectos", element: <ProyectosPage /> },
      { path: "recursos", element: <RecursosPage /> },
      { path: "analitica", element: <AnaliticaPage /> },
    ],
  },
]);