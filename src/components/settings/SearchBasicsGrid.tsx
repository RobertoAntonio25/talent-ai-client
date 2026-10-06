// src/components/settings/SearchBasicsGrid.tsx
// Filas 1-4 de las preferencias: los campos básicos y más usados.
// (Filas 5-7: chips de modalidad/jornada/experiencia en la sección;
// fila 8, slider y guardado en SearchPreferencesFilters.)
import type { UserPreferences } from "../../services/profileService";
import { FRESHNESS_OPTIONS } from "../../models/preferences.model";
import CareerTransitionToggle from "./CareerTransitionToggle";
import FieldHelp from "./FieldHelp";

interface Props {
  prefs: UserPreferences;
  updateDraft: (patch: Partial<UserPreferences>) => void;
  isSaving: boolean;
}

const inputCls =
  "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500";
const selectCls =
  "mt-1 w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-aplika-lima-500 focus:border-aplika-lima-500 block p-2.5 outline-none cursor-pointer";

export default function SearchBasicsGrid({
  prefs,
  updateDraft,
  isSaving,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="block">
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          Rol deseado
          <FieldHelp text="El puesto que quieres buscar, p. ej. Frontend Developer. Si lo dejas vacío, se conserva el valor guardado." />
        </span>
        <input
          type="text"
          value={prefs.targetRole ?? ""}
          onChange={(e) => updateDraft({ targetRole: e.target.value || null })}
          placeholder="Frontend Developer"
          className={inputCls}
        />
      </label>
      <CareerTransitionToggle
        value={prefs.careerTransition}
        onChange={(careerTransition) => updateDraft({ careerTransition })}
        disabled={isSaving}
      />
      <label className="block">
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          Ciudad
          <FieldHelp text="Ciudad donde buscar ofertas. Vacía = búsqueda nacional, en todo el país." />
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
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          País
          <FieldHelp text="País de las ofertas. Vacío = cualquiera." />
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
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          Distancia máxima (km)
          <FieldHelp text="Radio en kilómetros desde la ciudad buscada. Con «Sin límite» no se filtra por distancia." />
        </span>
        <div className="mt-1 flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={500}
            disabled={prefs.radiusKm === null || isSaving}
            value={prefs.radiusKm ?? ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              updateDraft({
                radiusKm:
                  e.target.value === "" ? null : Math.max(1, Math.min(500, n)),
              });
            }}
            placeholder="Sin límite"
            className={`${inputCls} disabled:opacity-50`}
          />
          <label className="flex items-center gap-1.5 text-[11px] text-slate-300 whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.radiusKm === null}
              onChange={(e) =>
                updateDraft({ radiusKm: e.target.checked ? null : 50 })
              }
              className="accent-aplika-lima-500 w-3.5 h-3.5"
            />
            Sin límite
          </label>
        </div>
      </label>
      <label className="block">
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          Salario mínimo (€/año)
          <FieldHelp text="Sueldo bruto anual mínimo en euros. Las ofertas sin dato salarial pasan igual, pero aparecen por debajo." />
        </span>
        <input
          type="number"
          min={0}
          value={prefs.salaryMin ?? ""}
          onChange={(e) =>
            updateDraft({
              salaryMin:
                e.target.value === "" ? null : Math.max(0, Number(e.target.value)),
            })
          }
          placeholder="30000"
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          Usar mis skills en la búsqueda
          <FieldHelp text="«Sí» incluye tus skills junto al rol (más afinada, menos ofertas). «No» busca solo por el rol. Sin preferencia = lo decide el agente." />
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
          className={selectCls}
        >
          <option value="">Sin preferencia</option>
          <option value="yes">Sí, afinar con mis skills</option>
          <option value="no">No, buscar solo por el rol</option>
        </select>
      </label>
      <label className="block">
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          Antigüedad de las ofertas
          <FieldHelp text="Cómo de recientes son las ofertas que rastrea el agente. Sin preferencia = último mes." />
        </span>
        <select
          value={prefs.freshness ?? ""}
          onChange={(e) =>
            updateDraft({
              freshness: (e.target.value || null) as typeof prefs.freshness,
            })
          }
          className={selectCls}
        >
          {FRESHNESS_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
