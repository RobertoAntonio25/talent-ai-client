// src/components/settings/SearchPreferencesSection.tsx
// Fase 2b (issue edu84gp/Aplika-Jobs#125, PLAN paso 9): sección "Preferencias
// de búsqueda" de Settings. Todo opcional ("Sin preferencia" por defecto);
// `null`/`[]` limpian la preferencia. Los básicos viven aquí y los avanzados
// en `SearchPreferencesFilters`; el estado, en `usePreferences`.
import { AlertCircle, Loader2, SlidersHorizontal } from "lucide-react";
import { usePreferences } from "../../hooks/usePreferences";
import {
  buildPreferencesPatch,
  EMPLOYMENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  FRESHNESS_OPTIONS,
  WORK_MODE_OPTIONS,
} from "../../models/preferences.model";
import SearchPreferencesFilters from "./SearchPreferencesFilters";

const inputCls =
  "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500";

function toggleInList<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export default function SearchPreferencesSection() {
  const {
    prefs,
    isLoading,
    isSaving,
    loadError,
    saveError,
    savedMsg,
    updateDraft,
    save,
    reload,
  } = usePreferences();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center gap-2 text-xs text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        Cargando tus preferencias…
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-aplika-lima-500/10 border border-aplika-lima-500/20 text-aplika-lima-400 rounded-2xl flex-shrink-0">
          <SlidersHorizontal className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm sm:text-base">
            Preferencias de búsqueda
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Todo opcional: afina qué ofertas rastrea el agente. Vacío = sin
            preferencia.
          </p>
        </div>
      </div>

      {loadError && (
        <p className="flex items-center gap-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {loadError}
          <button type="button" onClick={reload} className="ml-auto font-bold underline">
            Reintentar
          </button>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-[11px] text-slate-400 font-medium">
            Rol deseado (vacío = no cambiar)
          </span>
          <input
            type="text"
            value={prefs.targetRole ?? ""}
            onChange={(e) => updateDraft({ targetRole: e.target.value || null })}
            placeholder="Frontend Developer"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-[11px] text-slate-400 font-medium">
            Ciudad (vacío = no cambiar)
          </span>
          <input
            type="text"
            value={prefs.targetCity ?? ""}
            onChange={(e) => updateDraft({ targetCity: e.target.value || null })}
            placeholder="Madrid"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-[11px] text-slate-400 font-medium">
            Antigüedad de las ofertas
          </span>
          <select
            value={prefs.freshness ?? ""}
            onChange={(e) =>
              updateDraft({
                freshness: (e.target.value || null) as typeof prefs.freshness,
              })
            }
            className="mt-1 w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-aplika-lima-500 focus:border-aplika-lima-500 block p-2.5 outline-none cursor-pointer"
          >
            {FRESHNESS_OPTIONS.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="text-[11px] text-slate-400 font-medium mb-1.5">
          Modalidad (cualquiera = sin preferencia)
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {WORK_MODE_OPTIONS.map((o) => {
            const active = (prefs.workMode ?? "ANY") === o.value;
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  updateDraft({ workMode: active ? "ANY" : o.value })
                }
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                  active
                    ? "bg-aplika-lima-500/15 text-aplika-lima-300 border-aplika-lima-500/40"
                    : "bg-slate-950 text-slate-400 border-slate-700 hover:border-slate-500"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[11px] text-slate-400 font-medium mb-1.5">
          Jornada (vacío = todas)
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {EMPLOYMENT_OPTIONS.map((o) => {
            const active = prefs.employmentTypes.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  updateDraft({
                    employmentTypes: toggleInList(prefs.employmentTypes, o.value),
                  })
                }
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                  active
                    ? "bg-aplika-lima-500/15 text-aplika-lima-300 border-aplika-lima-500/40"
                    : "bg-slate-950 text-slate-400 border-slate-700 hover:border-slate-500"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[11px] text-slate-400 font-medium mb-1.5">
          Experiencia (vacío = todas)
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {EXPERIENCE_OPTIONS.map((o) => {
            const active = prefs.experienceLevel.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  updateDraft({
                    experienceLevel: toggleInList(prefs.experienceLevel, o.value),
                  })
                }
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                  active
                    ? "bg-aplika-lima-500/15 text-aplika-lima-300 border-aplika-lima-500/40"
                    : "bg-slate-950 text-slate-400 border-slate-700 hover:border-slate-500"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <SearchPreferencesFilters
        prefs={prefs}
        updateDraft={updateDraft}
        isSaving={isSaving}
        saveError={saveError}
        savedMsg={savedMsg}
        onSave={() => void save(buildPreferencesPatch(prefs))}
      />
    </div>
  );
}
