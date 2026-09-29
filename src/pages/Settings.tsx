import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Loader2,
  Bot,
  CalendarClock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileText,
} from "lucide-react";
import { useCv } from "../hooks/useCv";
import Toggle from "../components/ui/Toggle";
import { triggerManualSearch } from "../services/jobsService";

const LAST_SEARCH_KEY = "lastManualSearchAt";

function formatLastSearch(iso: string | null): string {
  if (!iso) return "Sin rastreos aún";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Sin rastreos aún";
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Settings() {
  // --- ESTADOS ---
  const [autoSearch, setAutoSearch] = useState(false);
  const [frequency, setFrequency] = useState("diario");
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuccess, setSearchSuccess] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  // 6.3: hora real del último rastreo (persistida), no texto quemado.
  const [lastSearchAt, setLastSearchAt] = useState<string | null>(() =>
    localStorage.getItem(LAST_SEARCH_KEY),
  );
  const { cv, isUploading, uploadError, upload } = useCv();

  // --- LÓGICA REAL (no simulación) ---
  const handleSearchNow = async () => {
    if (isSearching) return; // Evita doble click en paralelo
    setIsSearching(true);
    setSearchSuccess(null);
    setSearchError(null);
    try {
      const res = await triggerManualSearch();
      const total = res.data.meta.total;
      const nowIso = new Date().toISOString();
      localStorage.setItem(LAST_SEARCH_KEY, nowIso);
      setLastSearchAt(nowIso);
      setSearchSuccess(
        total === 0
          ? "Búsqueda completada, pero no se encontraron ofertas con tu perfil actual. Prueba a actualizar tu CV."
          : `¡Búsqueda completada! Se sincronizaron ${total} ofertas relevantes en el Tablero Kanban.`,
      );
    } catch (e) {
      setSearchError(
        e instanceof Error ? e.message : "Error al lanzar la búsqueda.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 w-full font-sans animate-in fade-in duration-300">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Configuración del Agente IA
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Automático
          </span>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Ajusta cómo y con qué frecuencia nuestro agente inteligente rastrea y
          postula a ofertas de empleo compatibles con tu perfil.
        </p>
      </div>

      {searchSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{searchSuccess}</span>
            <Link
              to="/dashboard"
              className="ml-2 font-bold underline hover:text-emerald-200"
            >
              Ver en Dashboard →
            </Link>
          </div>
        </div>
      )}
      {searchError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-300 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{searchError}</span>
        </div>
      )}

      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl shadow-xl shadow-black/40 overflow-hidden backdrop-blur-sm divide-y divide-slate-800/80">
        {/* SECCIÓN 0: Perfil / CV (Fase 5.4) */}
        <div className="p-6 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                Tu CV para la IA
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                La IA extrae tus skills y experiencia para el matching. PDF, máx
                10MB.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              {isUploading ? "Analizando…" : cv ? "Actualizar CV" : "Subir CV"}
              <input
                type="file"
                accept="application/pdf"
                disabled={isUploading}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file).catch(() => {});
                  e.target.value = "";
                }}
              />
            </label>
            {cv && !isUploading && (
              <span className="text-xs text-emerald-400">
                ✓ {cv.fullName} — {cv.skills.length} skills extraídas
              </span>
            )}
          </div>
          {isUploading && (
            <p className="text-xs text-blue-400">
              Analizando PDF con IA… puede tardar 1-2 min la primera vez (Render
              + Groq).
            </p>
          )}
          {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
        </div>

        {/* SECCIÓN 1: Búsqueda Automática (El Toggle) */}
        <div className="p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex-shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Búsqueda Automática
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Recomendado
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                La IA analiza ofertas compatibles y gestiona postulaciones en
                segundo plano.
              </p>
            </div>
          </div>
          <Toggle enabled={autoSearch} onChange={setAutoSearch} />
        </div>

        {/* SECCIÓN 2: Frecuencia (Selector) */}
        {autoSearch && (
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex-shrink-0">
                <CalendarClock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Frecuencia de rastreo
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  ¿Con qué intervalo debe el bot escanear nuevas oportunidades?
                </p>
              </div>
            </div>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer"
            >
              <option value="diario">Todos los días (Recomendado)</option>
              <option value="semanal">Una vez a la semana</option>
              <option value="mensual">Una vez al mes</option>
            </select>
          </div>
        )}

        {/* SECCIÓN 3: El Botón de Showtime */}
        <div className="p-6 bg-slate-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>
              Último rastreo realizado: {formatLastSearch(lastSearchAt)}
            </span>
          </div>

          <button
            onClick={handleSearchNow}
            disabled={isSearching}
            className={`
              flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition-all w-full sm:w-auto active:scale-95
              ${
                isSearching
                  ? "bg-blue-600/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25 hover:shadow-blue-500/40"
              }
            `}
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Rastreando... puede tardar 1-3 min</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Buscar Ofertas Ahora</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
