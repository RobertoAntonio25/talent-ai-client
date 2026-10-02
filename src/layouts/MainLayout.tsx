import { Outlet, Link, useLocation } from "react-router-dom";

import {
  Sparkles,
  LayoutDashboard,
  Settings as SettingsIcon,
} from "lucide-react";
import UserDropdown from "../components/navigation/UserDropdown";

export default function MainLayout() {
  const location = useLocation();

  const isFullPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  if (isFullPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* 🌟 BARRA DE NAVEGACIÓN SUPERIOR SAAS */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center space-x-3 group"
              title="Ir al inicio (Landing)"
            >
              <img
                src="/logo-aplika-horizontal-blanco.svg"
                alt="Aplika"
                className="h-12 w-auto group-hover:scale-105 transition-transform"
              />
            </Link>

            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-3 h-3 mr-1 text-blue-400" />
              IA Activa
            </span>
          </div>

          {/* Navegación Principal */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                location.pathname === "/dashboard"
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tablero Kanban</span>
            </Link>

            <Link
              to="/settings"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                location.pathname === "/settings"
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Configuración IA</span>
            </Link>
          </nav>

          {/* Perfil / Acceso Rápido (Fase 5: dropdown de usuario) */}
          <div className="flex items-center gap-3">
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* 🚀 CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
