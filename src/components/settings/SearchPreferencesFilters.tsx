// src/components/settings/SearchPreferencesFilters.tsx
// Fase 2b: filtros avanzados (radio, país, portales, salario, skills, umbral)
// + botón de guardado. Recibe el borrador y delega el PATCH al contenedor.
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";
import type { UserPreferences } from "../../services/profileService";
import { DEFAULT_MATCH_THRESHOLD } from "../../services/profileService";
import MatchThresholdSlider from "./MatchThresholdSlider";

interface Props {
  prefs: UserPreferences;
  updateDraft: (patch: Partial<UserPreferences>) => void;
  isSaving: boolean;
  saveError: string | null;
  savedMsg: string | null;
  onSave: () => void;
}

const inputCls =
  "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500";

export default function SearchPreferencesFilters({
  prefs,
  updateDraft,
  isSaving,
  saveError,
  savedMsg,
  onSave,
}: Props) {
  const unlimitedRadius = prefs.radiusKm === null;

  return (
    <div className="flex flex-col gap-4">
      <label className="block">
        <span className="text-[11px] text-slate-400 font-medium">
          Distancia máxima (km)
        </span>
        <div className="mt-1 flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={500}
            disabled={unlimitedRadius}
            value={prefs.radiusKm ?? ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              updateDraft({
                radiusKm: e.target.value === "" ? null : Math.max(1, Math.min(500, n)),
              });
            }}
            placeholder="Sin límite"
            className={`${inputCls} disabled:opacity-50`}
          />
          <label className="flex items-center gap-1.5 text-[11px] text-slate-300 whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              checked={unlimitedRadius}
              onChange={(e) =>
                updateDraft({ radiusKm: e.target.checked ? null : 50 })
              }
              className="accent-blue-500 w-3.5 h-3.5"
            />
            Sin límite
          </label>
        </div>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-[11px] text-slate-400 font-medium">
            País (vacío = cualquiera)
          </span>
          <input
            type="text"
            value={prefs.country ?? ""}
            onChange={(e) => updateDraft({ country: e.target.value || null })}
            placeholder="España"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-[11px] text-slate-400 font-medium">
            Salario mínimo €/año (vacío = cualquiera)
          </span>
          <input
            type="number"
            min={0}
            value={prefs.salaryMin ?? ""}
            onChange={(e) =>
              updateDraft({
                salaryMin: e.target.value === "" ? null : Math.max(0, Number(e.target.value)),
              })
            }
            placeholder="30000"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-[11px] text-slate-400 font-medium">
            Portal preferido (vacío = cualquiera)
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
          <span className="text-[11px] text-slate-400 font-medium">
            Portales a evitar (separados por comas)
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

      <label className="block">
        <span className="text-[11px] text-slate-400 font-medium">
          Usar mis skills en la búsqueda
        </span>
        <select
          value={
            prefs.useSkillsInQuery === null
              ? ""
              : prefs.useSkillsInQuery
                ? "yes"
                : "no"
          }
          onChange={(e) =>
            updateDraft({
              useSkillsInQuery:
                e.target.value === "" ? null : e.target.value === "yes",
            })
          }
          className="mt-1 w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer"
        >
          <option value="">Sin preferencia</option>
          <option value="yes">Sí, afinar con mis skills</option>
          <option value="no">No, buscar solo por el rol</option>
        </select>
      </label>

      <MatchThresholdSlider
        value={prefs.matchThreshold ?? DEFAULT_MATCH_THRESHOLD}
        onChange={(matchThreshold) => updateDraft({ matchThreshold })}
        disabled={isSaving}
      />

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
