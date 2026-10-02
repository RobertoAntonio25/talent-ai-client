// src/pages/Search.tsx
// Buscar ofertas: preferencias de búsqueda (se guardan en el back) +
// rastreo manual JSearch + IA. El botón rápido del header llega con
// ?autostart=1 para lanzar la búsqueda al entrar.
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import SearchPreferencesSection from "../components/settings/SearchPreferencesSection";
import ManualSearchPanel from "../components/search/ManualSearchPanel";
import { useManualSearch } from "../hooks/useManualSearch";

export default function Search() {
  const search = useManualSearch();
  const [params, setParams] = useSearchParams();
  const autoStarted = useRef(false);

  useEffect(() => {
    if (params.get("autostart") === "1" && !autoStarted.current) {
      autoStarted.current = true;
      setParams({}, { replace: true });
      void search.runSearch();
    }
    // Solo al montar (el botón rápido del header).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-3xl mx-auto w-full font-sans animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Buscar ofertas
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Ajusta tus preferencias y lanza un rastreo con IA cuando quieras.
        </p>
      </div>

      <ManualSearchPanel search={search} />

      <div className="mt-6 bg-slate-900/70 border border-slate-800 rounded-3xl shadow-xl shadow-black/40 overflow-hidden backdrop-blur-sm">
        <SearchPreferencesSection />
      </div>
    </div>
  );
}
