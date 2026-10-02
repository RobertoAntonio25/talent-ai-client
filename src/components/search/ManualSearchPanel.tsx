// src/components/search/ManualSearchPanel.tsx
// Botón "Buscar ofertas ahora" + estado del último rastreo (para /buscar).
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { useManualSearch } from "../../hooks/useManualSearch";

export default function ManualSearchPanel({
  search,
}: {
  search: ReturnType<typeof useManualSearch>;
}) {
  const { isSearching, searchSuccess, searchError, lastSearchLabel, runSearch } =
    search;

  return (
    <div>
      {searchSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{searchSuccess}</span>
            <Link to="/dashboard" className="ml-2 font-bold underline hover:text-emerald-200">
              Ver en Panel de empleo →
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

      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl shadow-xl shadow-black/40 overflow-hidden backdrop-blur-sm">
        <div className="p-6 bg-slate-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-aplika-lima-400" />
            <span>Último rastreo realizado: {lastSearchLabel}</span>
          </div>
          <button
            onClick={() => void runSearch()}
            disabled={isSearching}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-aplika-night-950 shadow-lg transition-all w-full sm:w-auto active:scale-95 cursor-pointer disabled:cursor-not-allowed bg-aplika-lima-500 hover:bg-aplika-lima-400 shadow-aplika-lima-500/25 hover:shadow-aplika-lima-500/40 disabled:opacity-60"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Rastreando y analizando con IA…</span>
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
