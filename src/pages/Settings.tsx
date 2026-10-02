// Configuración: búsqueda manual, preferencias y agente IA con menú lateral.
// El botón rápido del header llega con ?seccion=busqueda&autostart=1.
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import SettingsSidebar, { type SettingsSection } from "../components/settings/SettingsSidebar";
import AgentConfigSection from "../components/settings/AgentConfigSection";
import SearchPreferencesSection from "../components/settings/SearchPreferencesSection";
import ManualSearchPanel from "../components/search/ManualSearchPanel";
import { useManualSearch } from "../hooks/useManualSearch";

const VALID: SettingsSection[] = ["busqueda", "preferencias", "agente"];

export default function Settings() {
  const search = useManualSearch();
  const [params, setParams] = useSearchParams();
  const autoStarted = useRef(false);

  const raw = params.get("seccion");
  const active: SettingsSection = VALID.includes(raw as SettingsSection)
    ? (raw as SettingsSection)
    : "preferencias";

  const select = (s: SettingsSection) => setParams({ seccion: s });

  useEffect(() => {
    if (params.get("autostart") === "1" && !autoStarted.current) {
      autoStarted.current = true;
      setParams({ seccion: "busqueda" }, { replace: true });
      void search.runSearch();
    }
    // Solo al montar (botón rápido del header).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-5xl mx-auto w-full font-sans animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Configuración
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Busca ofertas, ajusta tus preferencias y configura el agente IA.
        </p>
      </div>
      <div className="grid sm:grid-cols-[220px_1fr] gap-4 items-start">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-2 backdrop-blur-sm">
          <SettingsSidebar active={active} onSelect={select} />
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl shadow-xl shadow-black/40 p-5 sm:p-6 backdrop-blur-sm">
          {active === "busqueda" && <ManualSearchPanel search={search} />}
          {active === "preferencias" && <SearchPreferencesSection />}
          {active === "agente" && <AgentConfigSection />}
        </div>
      </div>
    </div>
  );
}
