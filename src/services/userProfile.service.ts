// src/services/userProfile.service.ts
// Capa de perfil del front: los datos personales persisten en
// `localStorage "user"` (misma fuente que AuthContext).
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
