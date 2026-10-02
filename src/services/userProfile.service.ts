// src/services/userProfile.service.ts
// Fase 2e (issue edu84gp/Aplika-Jobs#151): perfil básico contra el back
// (fuente de verdad). Sustituye a la persistencia local en `localStorage`
// ("user" solo es caché de AuthContext). Contratos en `API.md` §8 del back:
// `GET|PATCH /api/users/me` + agregado `GET /api/profile`.
import { apiClient } from "./apiClient";

/** Usuario básico del back (`GET /api/users/me`, API.md §8). */
export interface BasicUserMe {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  location: string;
  role: string;
}

/** PATCH parcial: al menos 1 campo; `phone: ""` o `null` lo limpia. */
export interface UpdateMePatch {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  location?: string;
  email?: string;
}

/** Resumen de CV del agregado `GET /api/profile` (`null` sin perfil). */
export interface ProfileCvSummary {
  summary: string | null;
  skills: string[];
  experiencesCount: number;
  educationCount: number;
  languagesCount: number;
  projectsCount: number;
}

/** Agregado `GET /api/profile`: usuario + preferencias + resumen CV. */
export interface ProfileAggregate {
  user: BasicUserMe;
  preferences: Record<string, unknown> & { hasProfile: boolean };
  cv: ProfileCvSummary | null;
}

interface MeEnvelope {
  success: boolean;
  data: BasicUserMe;
}

interface AggregateEnvelope {
  success: boolean;
  data: ProfileAggregate;
}

/** GET /api/users/me — datos del usuario desde el back. */
export async function getMe(): Promise<BasicUserMe> {
  const res = await apiClient<MeEnvelope>("/api/users/me");
  return res.data;
}

/** PATCH /api/users/me — edita el User (no el BaseProfile). */
export async function updateMe(patch: UpdateMePatch): Promise<BasicUserMe> {
  const res = await apiClient<MeEnvelope>("/api/users/me", {
    method: "PATCH",
    data: patch,
  });
  return res.data;
}

/** GET /api/profile — agregado (usuario + prefs + resumen CV) en 1 llamada. */
export async function getProfileAggregate(): Promise<ProfileAggregate> {
  const res = await apiClient<AggregateEnvelope>("/api/profile");
  return res.data;
}
