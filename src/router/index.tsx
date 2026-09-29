/* eslint-disable react-refresh/only-export-components -- router config: exporta `router` (no componente) + wrappers lazy; Fast Refresh no aplica aquí */
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "../layouts/MainLayout";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AuthCallback from "../pages/AuthCallback";
import { ProtectedRoute, PublicOnlyRoute } from "./RouteGuards";
import { LazyFallback } from "../components/LazyFallback";
// 6.4: lazy para code-splitting. Dashboard trae dnd-kit + jspdf + html2canvas
// (~1.1MB juntos). Sin lazy, Landing/Login pagan ese peso en la primera carga.
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Settings = lazy(() => import("../pages/Settings"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "login",
        element: (
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        ),
      },
      {
        path: "auth/callback",
        element: (
          <PublicOnlyRoute>
            <AuthCallback />
          </PublicOnlyRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LazyFallback />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LazyFallback />}>
              <Settings />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
