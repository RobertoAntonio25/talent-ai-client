import { Outlet, Link, useLocation } from "react-router-dom";

import {
  Sparkles,
  LayoutDashboard,
  Search,
  Settings as SettingsIcon,
  User as UserIcon,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-aplika-lima-500 selection:text-aplika-night-950">
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

            {/* 🟣 Acento IA: badge reservado a lo "inteligente" (ver paleta en Landing) */}
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-3 h-3 mr-1 text-purple-400" />
              IA Activa
            </span>
          </div>

          {/* Navegación Principal */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                location.pathname === "/dashboard"
                  ? "bg-aplika-lima-500/15 text-aplika-lima-400 border border-aplika-lima-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Panel de empleo</span>
            </Link>

            <Link
              to="/settings"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                location.pathname === "/settings"
                  ? "bg-aplika-lima-500/15 text-aplika-lima-400 border border-aplika-lima-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Configuración</span>
            </Link>

            <Link
              to="/profile"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                location.pathname === "/profile"
                  ? "bg-aplika-lima-500/15 text-aplika-lima-400 border border-aplika-lima-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Mi perfil</span>
            </Link>
          </nav>

          {/* Perfil / Acceso Rápido (Fase 5: dropdown de usuario) */}
          <div className="flex items-center gap-2">
            <Link
              to="/settings?seccion=busqueda&autostart=1"
              title="Buscar ofertas ahora (JSearch + IA)"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 shadow-lg shadow-aplika-lima-500/20 transition-all active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Buscar ahora</span>
            </Link>
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
