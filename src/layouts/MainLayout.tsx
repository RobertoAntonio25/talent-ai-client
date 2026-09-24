import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Sparkles,
  LayoutDashboard,
  Settings as SettingsIcon,
  LogIn,
} from "lucide-react";

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                T
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Talent-AI
                </span>
              </div>
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

          {/* Perfil / Acceso Rápido */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-inner">
                  RL
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">
                    Roberto López
                  </span>
                  <span className="text-[10px] text-blue-400 font-medium">
                    Frontend Dev
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Cambiar de cuenta o cerrar sesión"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 🚀 CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
