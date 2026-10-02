// src/services/profileService.ts
// Fase 2b (issue edu84gp/Aplika-Jobs#125): pack completo de preferencias de
// búsqueda contra el backend (fuente de verdad). Contrato: validator
// `updatePreferencesSchema` del back — todo opcional, escalares nullable
// (`null` = limpiar) y listas (`[]` = limpiar). `wantsRemote` ya no existe:
// un PATCH solo con ese campo responde 400; la modalidad es `workMode`.
import { apiClient } from "./apiClient";

export type EmploymentType = "FULLTIME" | "CONTRACTOR" | "PARTTIME" | "INTERN";
export type ExperienceLevel =
  | "no_experience"
  | "under_3_years_experience"
  | "more_than_3_years_experience"
  | "no_degree";
export type Freshness = "today" | "3days" | "week" | "month" | "all";
export type WorkMode = "ANY" | "REMOTE" | "HYBRID" | "ONSITE";

/** Umbral de lectura cuando el perfil no lo fija (PLAN §4, defecto 70). */
export const DEFAULT_MATCH_THRESHOLD = 70;

/** GET /api/profile/preferences — el back responde el objeto directo. */
export interface UserPreferences {
  targetRole: string | null;
  targetCity: string | null;
  employmentTypes: EmploymentType[];
  experienceLevel: ExperienceLevel[];
  freshness: Freshness | null;
  radiusKm: number | null;
  country: string | null;
  workMode: WorkMode | null;
  preferredPublisher: string | null;
  excludedPublishers: string[];
  salaryMin: number | null;
  useSkillsInQuery: boolean | null;
  matchThreshold: number | null;
  hasProfile: boolean;
}

/** PATCH parcial: solo viajan los campos presentes (`undefined` = no tocar). */
export interface PreferencesPatch {
  targetRole?: string;
  targetCity?: string;
  employmentTypes?: EmploymentType[];
  experienceLevel?: ExperienceLevel[];
  freshness?: Freshness | null;
  radiusKm?: number | null;
  country?: string | null;
  workMode?: WorkMode | null;
  preferredPublisher?: string | null;
  excludedPublishers?: string[];
  salaryMin?: number | null;
  useSkillsInQuery?: boolean | null;
  matchThreshold?: number | null;
}

const EMPTY_PREFS: UserPreferences = {
  targetRole: null,
  targetCity: null,
  employmentTypes: [],
  experienceLevel: [],
  freshness: null,
  radiusKm: null,
  country: null,
  workMode: null,
  preferredPublisher: null,
  excludedPublishers: [],
  salaryMin: null,
  useSkillsInQuery: null,
  matchThreshold: null,
  hasProfile: false,
};

/**
 * Normaliza la respuesta: si el back aún no tiene la Fase 2a desplegada
 * (solo rol/ciudad), los campos nuevos llegan como `undefined` y se
 * rellenan con neutros para que los formularios no rompan.
 */
function normalizePreferences(raw: Partial<UserPreferences>): UserPreferences {
  return {
    targetRole: raw.targetRole ?? null,
    targetCity: raw.targetCity ?? null,
    employmentTypes: raw.employmentTypes ?? [],
    experienceLevel: raw.experienceLevel ?? [],
    freshness: raw.freshness ?? null,
    radiusKm: raw.radiusKm ?? null,
    country: raw.country ?? null,
    workMode: raw.workMode ?? null,
    preferredPublisher: raw.preferredPublisher ?? null,
    excludedPublishers: raw.excludedPublishers ?? [],
    salaryMin: raw.salaryMin ?? null,
    useSkillsInQuery: raw.useSkillsInQuery ?? null,
    matchThreshold: raw.matchThreshold ?? null,
    hasProfile: raw.hasProfile ?? false,
  };
}

export function emptyPreferences(): UserPreferences {
  return { ...EMPTY_PREFS, employmentTypes: [], excludedPublishers: [] };
}

export async function getPreferences(): Promise<UserPreferences> {
  const raw = await apiClient<Partial<UserPreferences>>(
    "/api/profile/preferences",
  );
  return normalizePreferences(raw);
}

/** PATCH parcial: el back exige al menos un campo presente. */
export async function updatePreferences(
  patch: PreferencesPatch,
): Promise<UserPreferences> {
  const raw = await apiClient<Partial<UserPreferences>>(
    "/api/profile/preferences",
    { method: "PATCH", data: patch },
  );
  return normalizePreferences(raw);
}
