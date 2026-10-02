// src/services/userProfile.service.ts
// Fase 2c (issue edu84gp/Aplika-Jobs#148): capa de perfil del front.
// Hoy el back solo expone GET|PATCH /api/profile/preferences (búsqueda);
// NO hay GET/PATCH de usuario ni cambio de password. Por eso los datos
// personales persisten en `localStorage "user"` (misma fuente que
// AuthContext) y el cambio de password queda pendiente de la Fase 2d.
// Cuando el back añada los endpoints, este fichero es el único que cambia.
import type { User } from "../context/AuthContext";

const USER_STORAGE_KEY = "user";

/** Lee el usuario guardado en este dispositivo (fuente de AuthContext). */
export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

/** Fusiona y persiste datos personales en local (devuelve el resultante). */
export function persistLocalUser(patch: Partial<User>): User | null {
  const current = getStoredUser();
  if (!current) return null;
  const next = { ...current, ...patch };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
  return next;
}

/**
 * Fase 2d (pendiente back): endpoints a crear en `edu84gp/Aplika-Jobs`.
 * - `GET /api/users/me` → perfil (datos personales).
 * - `PATCH /api/users/me` → edita nombre/apellidos/teléfono/ubicación.
 * - `POST /api/auth/change-password` → { currentPassword, newPassword }.
 * El front ya llama a `persistLocalUser` + `updateUser`; al llegar el back
 * se añade aquí el `apiClient` sin tocar las vistas.
 */
export const PROFILE_BACKEND_TODO = "Fase 2d: persistencia en back" as const;

/** Mensaje único para el cambio de password hasta que exista la Fase 2d. */
export const PASSWORD_PENDING_MSG =
  "El cambio de contraseña aún no está disponible: necesita la Fase 2d del backend. Tus datos personales sí se guardan en este dispositivo.";
