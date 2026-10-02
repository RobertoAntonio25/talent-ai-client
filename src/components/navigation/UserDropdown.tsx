// src/components/navigation/UserDropdown.tsx
// Fase 5 (Opción C): menú desplegable del avatar en el Navbar.
// Permite ver el perfil, ajustar las preferencias de búsqueda (rol, ciudad y
// modalidad remota) y gestionar el CV base sin salir de la vista actual.
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  LogOut,
  MapPin,
  Settings as SettingsIcon,
  Target,
  Trash2,
  Upload,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCv } from "../../hooks/useCv";
import { ApiError } from "../../services/apiClient";
import { getPreferences, updatePreferences } from "../../services/profileService";
import Toggle from "../ui/Toggle";

const PREFS_STORAGE_KEY = "aplikaPreferences";
// Clave anterior (pre-rebrand Talent AI → Aplika): solo se lee para migrar datos existentes.
const LEGACY_PREFS_STORAGE_KEY = "talentPreferences";

interface SearchPreferences {
  targetRole: string;
  targetCity: string;
  wantsRemote: boolean;
  updatedAt?: string;
}

function loadStoredPreferences(): SearchPreferences | null {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SearchPreferences;
    // Migración rebrand: rescatar las preferencias guardadas con la clave antigua.
    const legacyRaw = localStorage.getItem(LEGACY_PREFS_STORAGE_KEY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw) as SearchPreferences;
      localStorage.setItem(PREFS_STORAGE_KEY, legacyRaw);
      localStorage.removeItem(LEGACY_PREFS_STORAGE_KEY);
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export default function UserDropdown() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cv, isUploading, uploadError, upload, clear } = useCv();

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedTimerRef = useRef<number | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  // Preferencias: lo guardado en este dispositivo; si no hay nada aún, se
  // siembran con lo que la IA ya extrajo del CV (rol objetivo y ubicación).
  const [prefs, setPrefs] = useState<SearchPreferences>(
    () =>
      loadStoredPreferences() ?? {
        targetRole: cv?.targetRole ?? "",
        targetCity: cv?.contact?.location ?? "",
        wantsRemote: false,
      },
  );
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [cvMsg, setCvMsg] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Cerrar el menú al hacer click/tap fuera del contenedor, o con Escape.
  // Los listeners solo existen mientras el menú está abierto.
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const container = containerRef.current;
      const target = event.target;
      if (container && target instanceof Node && !container.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
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

  // Limpieza del temporizador del feedback al desmontar el componente.
  useEffect(() => {
    return () => {
      if (savedTimerRef.current !== null) {
        window.clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  // Fase 6.2: el backend es la fuente de verdad; localStorage queda como cache.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const server = await getPreferences();
        if (cancelled || !server.hasProfile) return; // sin perfil: se siembra del CV (comportamiento actual)
        const next: SearchPreferences = {
          targetRole: server.targetRole ?? "",
          targetCity: server.targetCity ?? "",
          wantsRemote: server.wantsRemote ?? false,
        };
        setPrefs(next);
        localStorage.setItem(
          PREFS_STORAGE_KEY,
          JSON.stringify({ ...next, updatedAt: new Date().toISOString() }),
        );
      } catch {
        // Sin conexión: seguimos con la cache local (degradación elegante).
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
    "U";
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Usuario";

  const handleToggleOpen = () => {
    setIsOpen((open) => !open);
    // Cada apertura arranca con feedback limpio.
    setSaveMsg(null);
    setSaveError(null);
    setCvMsg(null);
    setIsConfirmingDelete(false);
  };

  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    setSaveError(null);
    setSaveMsg(null);

    const cacheLocal: SearchPreferences = { ...prefs, updatedAt: new Date().toISOString() };

    try {
      const updated = await updatePreferences({
        // undefined = "no tocar ese campo"; el back exige al menos uno (wantsRemote va siempre).
        targetRole: prefs.targetRole.trim() || undefined,
        targetCity: prefs.targetCity.trim() || undefined,
        wantsRemote: prefs.wantsRemote,
      });

      const synced: SearchPreferences = {
        targetRole: updated.targetRole ?? "",
        targetCity: updated.targetCity ?? "",
        wantsRemote: updated.wantsRemote ?? false,
        updatedAt: new Date().toISOString(),
      };
      setPrefs(synced);
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(synced));
      setSaveMsg("Preferencias guardadas y sincronizadas con tu perfil.");
    } catch (e) {
      // No perdemos lo escrito: queda en cache local, pero avisamos de que no sincronizó.
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(cacheLocal));
      setSaveError(
        e instanceof ApiError
          ? e.message
          : "No se pudieron sincronizar las preferencias. Revisa tu conexión.",
      );
    } finally {
      setIsSavingPrefs(false);
      if (savedTimerRef.current !== null) window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = window.setTimeout(() => {
        setSaveMsg(null);
        setSaveError(null);
      }, 4000);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // Permite volver a elegir el mismo archivo.
    if (!file) return;
    setCvMsg(null);
    try {
      const uploaded = await upload(file);
      setCvMsg(
        `✓ CV actualizado (${uploaded.skills.length} habilidades extraídas).`,
      );
    } catch {
      // El motivo real queda en uploadError (estado del hook useCv).
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

  return (
    <div ref={containerRef} className="relative">
      {/* Disparador: avatar con iniciales (siempre visible) + nombre y correo */}
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
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Panel del menú. Sin role="menu" porque contiene campos de formulario
          (ARIA desaconseja menu en paneles con inputs/switch). */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* 1. Cabecera: perfil + estado de sesión */}
          <div className="px-4 py-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-aplika-lima-500 to-aplika-lima-600 flex items-center justify-center font-bold text-sm text-aplika-night-950 shadow-inner flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {fullName}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email ?? "Sin correo"}
              </p>
              <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sesión Activa
              </span>
            </div>
          </div>

          {/* 2. Preferencias de búsqueda */}
          <div className="px-4 py-3.5 border-b border-slate-800">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-3">
              <Target className="w-3.5 h-3.5 text-aplika-lima-400" />
              Preferencias de Búsqueda de Empleo
            </p>

            <label className="block mb-2.5">
              <span className="text-[11px] text-slate-400 font-medium">
                Rol deseado
              </span>
              <input
                type="text"
                value={prefs.targetRole}
                onChange={(event) =>
                  setPrefs({ ...prefs, targetRole: event.target.value })
                }
                placeholder="Frontend Developer"
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500"
              />
            </label>

            <label className="block mb-3">
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <MapPin className="w-3 h-3" />
                Ciudad / Ubicación
              </span>
              <input
                type="text"
                value={prefs.targetCity}
                onChange={(event) =>
                  setPrefs({ ...prefs, targetCity: event.target.value })
                }
                placeholder="Madrid, España"
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500"
              />
            </label>

            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs text-slate-300 font-medium">
                Modalidad remota
              </span>
              <Toggle
                enabled={prefs.wantsRemote}
                onChange={(enabled) =>
                  setPrefs({ ...prefs, wantsRemote: enabled })
                }
              />
            </div>

            <button
              type="button"
              onClick={() => void handleSavePreferences()}
              disabled={isSavingPrefs}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 shadow-lg shadow-aplika-lima-500/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingPrefs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Guardar Preferencias
            </button>

            {saveMsg && (
              <p className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {saveMsg}
              </p>
            )}
            {saveError && (
              <p className="mt-2 text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {saveError}
              </p>
            )}
            <p className="mt-2 text-[10px] text-slate-500 leading-relaxed">
              Se sincronizan con tu perfil. El motor de búsqueda las usará en la
              próxima búsqueda (cron diario o búsqueda manual).
            </p>
          </div>

          {/* 3. Gestión del CV base */}
          <div className="px-4 py-3.5 border-b border-slate-800">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-3">
              <FileText className="w-3.5 h-3.5 text-aplika-lima-400" />
              Gestión de CV Base
            </p>

            <p
              className={`text-xs mb-2.5 ${
                cv ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {cv
                ? `✓ CV Cargado (${cv.skills.length} habilidades extraídas)`
                : "Sin CV cargado"}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                {isUploading ? "Subiendo…" : "Reemplazar CV"}
              </button>

              <button
                type="button"
                onClick={handleDeleteCv}
                disabled={!cv || isUploading}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold border transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
                  isConfirmingDelete
                    ? "text-white bg-red-600/80 hover:bg-red-600 border-red-500/50"
                    : "text-red-400 bg-slate-800 hover:bg-slate-700 border-slate-700"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isConfirmingDelete ? "¿Confirmar?" : "Eliminar CV"}
              </button>
            </div>

            {/* Input real de archivo, oculto tras el botón "Reemplazar CV" */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => void handleFileChange(event)}
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

          {/* 4. Cuenta: configuración avanzada + cierre de sesión */}
          <div className="px-2 py-2">
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
              Configuración avanzada
            </Link>
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
