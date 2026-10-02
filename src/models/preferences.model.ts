// src/models/preferences.model.ts
// Fase 2b (issue edu84gp/Aplika-Jobs#125): opciones de la sección de
// preferencias + construcción del PATCH parcial. Todo opcional: `null`/`[]`
// limpian la preferencia ("Sin preferencia"). Rol/ciudad vacíos se omiten
// porque el back no acepta `null` para ellos.
import {
  DEFAULT_MATCH_THRESHOLD,
  type EmploymentType,
  type ExperienceLevel,
  type Freshness,
  type PreferencesPatch,
  type UserPreferences,
  type WorkMode,
} from "../services/profileService";

export interface Option<T extends string> {
  value: T | "";
  label: string;
}

export const EMPLOYMENT_OPTIONS: Array<{
  value: EmploymentType;
  label: string;
}> = [
  { value: "FULLTIME", label: "Jornada completa" },
  { value: "CONTRACTOR", label: "Contrato / freelance" },
  { value: "PARTTIME", label: "Media jornada" },
  { value: "INTERN", label: "Prácticas" },
];

export const EXPERIENCE_OPTIONS: Array<{
  value: ExperienceLevel;
  label: string;
}> = [
  { value: "no_experience", label: "Sin experiencia" },
  { value: "under_3_years_experience", label: "Menos de 3 años" },
  { value: "more_than_3_years_experience", label: "Más de 3 años" },
  { value: "no_degree", label: "Sin título requerido" },
];

export const FRESHNESS_OPTIONS: Array<Option<Freshness>> = [
  { value: "", label: "Sin preferencia" },
  { value: "today", label: "Hoy" },
  { value: "3days", label: "Últimos 3 días" },
  { value: "week", label: "Última semana" },
  { value: "month", label: "Último mes" },
  { value: "all", label: "Cualquiera" },
];

export const WORK_MODE_OPTIONS: Array<{ value: WorkMode; label: string }> = [
  { value: "ANY", label: "Cualquiera" },
  { value: "REMOTE", label: "Solo remoto" },
  { value: "HYBRID", label: "Híbrido" },
  { value: "ONSITE", label: "Presencial" },
];

/** "linkedin, indeed" → ["linkedin", "indeed"] (para el input de excluidos). */
export function parsePublishersCsv(raw: string): string[] {
  return raw
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/** Borrador del formulario → PATCH parcial (nunca viaja `wantsRemote`). */
export function buildPreferencesPatch(
  draft: UserPreferences,
): PreferencesPatch {
  const role = draft.targetRole?.trim() ?? "";
  const city = draft.targetCity?.trim() ?? "";
  const country = draft.country?.trim() ?? "";
  const publisher = draft.preferredPublisher?.trim() ?? "";
  return {
    ...(role ? { targetRole: role } : {}),
    ...(city ? { targetCity: city } : {}),
    employmentTypes: [...draft.employmentTypes],
    experienceLevel: [...draft.experienceLevel],
    freshness: draft.freshness,
    radiusKm: draft.radiusKm,
    country: country ? country : null,
    workMode: draft.workMode ?? "ANY",
    preferredPublisher: publisher ? publisher : null,
    excludedPublishers: draft.excludedPublishers
      .map((p) => p.trim())
      .filter((p) => p.length > 0),
    salaryMin: draft.salaryMin,
    useSkillsInQuery: draft.useSkillsInQuery,
    matchThreshold: draft.matchThreshold ?? DEFAULT_MATCH_THRESHOLD,
  };
}
