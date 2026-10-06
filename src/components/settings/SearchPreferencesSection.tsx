// src/components/settings/SearchPreferencesSection.tsx
// Tarjeta "Preferencias de búsqueda": filas 1-4 en SearchBasicsGrid,
// filas 5-7 (chips) aquí y fila 8 + slider + guardado en
// SearchPreferencesFilters. Todo opcional; `null`/`[]` = sin preferencia.
import { AlertCircle, Loader2, SlidersHorizontal } from "lucide-react";
import { usePreferences } from "../../hooks/usePreferences";
import {
  buildPreferencesPatch,
  EMPLOYMENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  WORK_MODE_OPTIONS,
} from "../../models/preferences.model";
import SearchBasicsGrid from "./SearchBasicsGrid";
import SearchPreferencesFilters from "./SearchPreferencesFilters";
import FieldHelp from "./FieldHelp";

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
    <div className="bg-[#12283f]/70 border border-[#0a66c2]/25 rounded-3xl shadow-xl shadow-black/40 backdrop-blur-sm">
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

        <SearchBasicsGrid
          prefs={prefs}
          updateDraft={updateDraft}
          isSaving={isSaving}
        />

        <fieldset>
          <legend className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mb-1.5">
            Modalidad
            <FieldHelp text="«Cualquiera» equivale a sin preferencia: el agente no filtra por modalidad de trabajo." />
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
          <legend className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mb-1.5">
            Jornada
            <FieldHelp text="Vacía = todas las jornadas: completa, contrato, media jornada y prácticas." />
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
          <legend className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mb-1.5">
            Experiencia
            <FieldHelp text="Vacía = todas. Si activas la transición profesional, este filtro se ignora en la búsqueda." />
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
    </div>
  );
}
