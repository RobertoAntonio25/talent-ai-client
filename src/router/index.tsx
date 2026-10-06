import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AuthCallback from "../pages/AuthCallback";
import Dashboard from "../pages/Dashboard";
import Settings from "../pages/Settings";
import Profile from "../pages/Profile";
import { ProtectedRoute, PublicOnlyRoute } from "./RouteGuards";

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
        // #140: ruta pública directa, fuera de PublicOnlyRoute.
        // Con token viejo en localStorage el guard redirigía a /dashboard
        // antes de que AuthCallback procesara ?code=/?error=.
        path: "auth/callback",
        element: <AuthCallback />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
