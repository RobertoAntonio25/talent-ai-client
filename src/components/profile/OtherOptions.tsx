// src/components/profile/OtherOptions.tsx
// Accesos recomendados + nota de persistencia.
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function OtherOptions() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <section aria-label="Otras opciones">
      <h2 className="font-bold text-white text-sm sm:text-base">Otras opciones</h2>
      <p className="text-xs sm:text-sm text-slate-400 mt-0.5 mb-4">
        Accesos directos y estado de tu cuenta.
      </p>
      <div className="grid gap-2 max-w-md">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          <LayoutDashboard className="w-4 h-4 text-aplika-lima-400" />
          Ir al Panel de empleo
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          <SettingsIcon className="w-4 h-4 text-aplika-lima-400" />
          Configuración
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 bg-slate-800 hover:bg-red-500/10 border border-slate-700 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </section>
  );
}
