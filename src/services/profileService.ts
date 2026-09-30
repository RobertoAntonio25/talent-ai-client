// src/services/profileService.ts
// Fase 6.2: preferencias de búsqueda contra el backend (fuente de verdad).
import { apiClient } from "./apiClient";

export interface UserPreferences {
  targetRole: string | null;
  targetCity: string | null;
  wantsRemote: boolean | null;
  hasProfile: boolean;
}

export interface PreferencesPatch {
  targetRole?: string;
  targetCity?: string;
  wantsRemote?: boolean;
}

/** GET /api/profile/preferences — el back responde el objeto directo (sin envoltorio). */
export function getPreferences() {
  return apiClient<UserPreferences>("/api/profile/preferences");
}

/** PATCH parcial: solo se envían los campos presentes. El back exige al menos uno. */
export function updatePreferences(patch: PreferencesPatch) {
  return apiClient<UserPreferences>("/api/profile/preferences", {
    method: "PATCH",
    data: patch,
  });
}
