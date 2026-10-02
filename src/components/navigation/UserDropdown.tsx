// src/components/navigation/UserDropdown.tsx
// Fase 2c (issue edu84gp/Aplika-Jobs#148): el menú vuelve a ser un menú.
// Solo opciones básicas: ver perfil, gestionar CV base, configuración
// avanzada y cerrar sesión. Las preferencias de búsqueda viven únicamente
// en Settings (Fase 2b). Sin caché local de prefs: el back es la fuente
// de verdad (se limpian `aplikaPreferences`/`talentPreferences` legacy).
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ChevronDown,
  FileText,
  Loader2,
  LogOut,
  Settings as SettingsIcon,
  Trash2,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCv } from "../../hooks/useCv";

export default function UserDropdown() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cv, isUploading, uploadError, upload, clear } = useCv();

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [cvMsg, setCvMsg] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Fase 2c: la caché de prefs se elimina (el back es la fuente de verdad).
  useEffect(() => {
    localStorage.removeItem("aplikaPreferences");
    localStorage.removeItem("talentPreferences");
  }, []);

  // Cerrar al hacer click fuera o con Escape (solo mientras está abierto).
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const c = containerRef.current;
      const t = e.target;
      if (c && t instanceof Node && !c.contains(t)) setIsOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
    "U";
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Usuario";

  const handleToggleOpen = () => {
    setIsOpen((o) => !o);
    setCvMsg(null);
    setIsConfirmingDelete(false);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCvMsg(null);
    try {
      const uploaded = await upload(file);
      setCvMsg(`✓ CV actualizado (${uploaded.skills.length} habilidades).`);
    } catch {
      // El motivo real queda en uploadError (hook useCv).
    }
  };

  const handleDeleteCv = () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    clear();
    setIsConfirmingDelete(false);
    setCvMsg("CV eliminado de este dispositivo.");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const close = () => setIsOpen(false);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggleOpen}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-xl px-3 py-1.5 transition-colors cursor-pointer"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-aplika-lima-500 to-aplika-lima-600 flex items-center justify-center font-bold text-xs text-aplika-night-950 shadow-inner flex-shrink-0">
          {initials}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-200 leading-tight max-w-[130px] truncate">
            {fullName}
          </span>
          <span className="text-[10px] text-aplika-lima-400 font-medium max-w-[130px] truncate">
            {user?.email ?? "Sesión activa"}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-aplika-lima-500 to-aplika-lima-600 flex items-center justify-center font-bold text-sm text-aplika-night-950 shadow-inner flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{fullName}</p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email ?? "Sin correo"}
              </p>
              <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sesión Activa
              </span>
            </div>
          </div>

          <nav className="px-2 py-2 border-b border-slate-800" aria-label="Cuenta">
            <Link
              to="/profile"
              onClick={close}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              Ver perfil
            </Link>
            <Link
              to="/profile?seccion=cv"
              onClick={close}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Ver/gestionar CV base
            </Link>
            <Link
              to="/settings"
              onClick={close}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
              Configuración avanzada
            </Link>
          </nav>

          <div className="px-4 py-3.5 border-b border-slate-800">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-2">
              CV base
            </p>
            <p className={`text-xs mb-2.5 ${cv ? "text-emerald-400" : "text-slate-500"}`}>
              {cv ? `✓ Cargado (${cv.skills.length} habilidades)` : "Sin CV cargado"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {isUploading ? "Subiendo…" : "Subir PDF"}
              </button>
              <button
                type="button"
                onClick={handleDeleteCv}
                disabled={!cv || isUploading}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold border transition-colors disabled:opacity-60 cursor-pointer ${
                  isConfirmingDelete
                    ? "text-white bg-red-600/80 hover:bg-red-600 border-red-500/50"
                    : "text-red-400 bg-slate-800 hover:bg-slate-700 border-slate-700"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isConfirmingDelete ? "¿Confirmar?" : "Eliminar"}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => void handleFileChange(e)}
            />
            {uploadError && (
              <p className="mt-2 text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {uploadError}
              </p>
            )}
            {cvMsg && !uploadError && (
              <p className="mt-2 text-[11px] text-emerald-400">{cvMsg}</p>
            )}
          </div>

          <div className="px-2 py-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
