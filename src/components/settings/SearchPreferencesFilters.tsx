// src/components/settings/SearchPreferencesFilters.tsx
// Fila 8 (portales) + fila 9 (slider de compatibilidad) + botón de guardado.
// Recibe el borrador y delega el PATCH al contenedor.
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";
import type { UserPreferences } from "../../services/profileService";
import { DEFAULT_MATCH_THRESHOLD } from "../../services/profileService";
import MatchThresholdSlider from "./MatchThresholdSlider";
import FieldHelp from "./FieldHelp";

interface Props {
  prefs: UserPreferences;
  updateDraft: (patch: Partial<UserPreferences>) => void;
  isSaving: boolean;
  saveError: string | null;
  savedMsg: string | null;
  onSave: () => void;
}

const inputCls =
  "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500";

export default function SearchPreferencesFilters({
  prefs,
  updateDraft,
  isSaving,
  saveError,
  savedMsg,
  onSave,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            Portal preferido
            <FieldHelp text="Si buscas sobre todo en un portal (p. ej. linkedin), el agente lo prioriza en la query. Vacío = cualquiera." />
          </span>
          <input
            type="text"
            value={prefs.preferredPublisher ?? ""}
            onChange={(e) =>
              updateDraft({ preferredPublisher: e.target.value || null })
            }
            placeholder="linkedin"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            Portales a evitar
            <FieldHelp text="Portales que no quieres ver, separados por comas (p. ej. indeed, infojobs)." />
          </span>
          <input
            type="text"
            value={prefs.excludedPublishers.join(", ")}
            onChange={(e) =>
              updateDraft({ excludedPublishers: e.target.value.split(",") })
            }
            placeholder="indeed, infojobs"
            className={inputCls}
          />
        </label>
      </div>

      <div className="rounded-2xl border border-aplika-lima-500/30 bg-aplika-lima-500/5 p-4 shadow-lg shadow-aplika-lima-500/10">
        <MatchThresholdSlider
          value={prefs.matchThreshold ?? DEFAULT_MATCH_THRESHOLD}
          onChange={(matchThreshold) => updateDraft({ matchThreshold })}
          disabled={isSaving}
        />
        <p className="mt-3 text-[11px] leading-relaxed text-slate-300">
          Es el filtro más importante: define la compatibilidad mínima
          (0–100) para que una oferta cree un TODO en tu kanban. Con un
          valor alto solo verás las mejores; al bajarlo aparecen más
          ofertas, incluidas algunas ya evaluadas, sin crear tareas nuevas.
          Recuerda pulsar «Guardar preferencias» para aplicarlo.
        </p>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 shadow-lg shadow-aplika-lima-500/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        {isSaving ? "Guardando…" : "Guardar preferencias"}
      </button>

      {savedMsg && (
        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {savedMsg}
        </p>
      )}
      {saveError && (
        <p className="text-[11px] text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {saveError}
        </p>
      )}
    </div>
  );
}
