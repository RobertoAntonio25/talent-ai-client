import { useState } from "react";
import {
  Search,
  Loader2,
  Bot,
  CalendarClock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Toggle from "../components/ui/Toggle";

export default function Settings() {
  // --- ESTADOS ---
  const [autoSearch, setAutoSearch] = useState(false);
  const [frequency, setFrequency] = useState("diario");
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuccess, setSearchSuccess] = useState(false);

  // --- LÓGICA DE SIMULACIÓN ---
  const handleSearchNow = () => {
    setIsSearching(true);
    setSearchSuccess(false);

    setTimeout(() => {
      setIsSearching(false);
      setSearchSuccess(true);
      setTimeout(() => setSearchSuccess(false), 4000);
    }, 2500);
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
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>
            ¡Búsqueda completada con éxito! Se detectaron y sincronizaron 3
            nuevas ofertas relevantes para tu perfil en el Tablero Kanban.
          </span>
        </div>
      )}

      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl shadow-xl shadow-black/40 overflow-hidden backdrop-blur-sm divide-y divide-slate-800/80">
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
            <span>Último rastreo realizado: Hoy a las 10:45 AM</span>
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
                <span>Rastreando la web con IA...</span>
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
