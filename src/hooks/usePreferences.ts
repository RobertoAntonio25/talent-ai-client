// src/hooks/usePreferences.ts
// Fase 2b (issue edu84gp/Aplika-Jobs#125): puente entre la sección de
// preferencias de Settings y `profileService`. El backend es la fuente de
// verdad; aquí solo vive el estado del formulario (edición local + guardado).
import { useCallback, useEffect, useState } from "react";
import {
  emptyPreferences,
  getPreferences,
  updatePreferences,
  type PreferencesPatch,
  type UserPreferences,
} from "../services/profileService";

export interface UsePreferences {
  prefs: UserPreferences;
  isLoading: boolean;
  isSaving: boolean;
  loadError: string | null;
  saveError: string | null;
  savedMsg: string | null;
  updateDraft: (patch: Partial<UserPreferences>) => void;
  save: (patch: PreferencesPatch) => Promise<boolean>;
  reload: () => void;
}

export function usePreferences(): UsePreferences {
  const [prefs, setPrefs] = useState<UserPreferences>(() =>
    emptyPreferences(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const fetchPrefs = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setPrefs(await getPreferences());
    } catch (e) {
      setLoadError(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar tus preferencias.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carga inicial diferida a microtarea para no llamar a setState de forma
  // síncrona en el cuerpo del efecto (react-hooks/set-state-in-effect).
  useEffect(() => {
    void Promise.resolve().then(() => fetchPrefs());
  }, [fetchPrefs]);

  const reload = useCallback(() => {
    void Promise.resolve().then(() => fetchPrefs());
  }, [fetchPrefs]);

  const updateDraft = useCallback((patch: Partial<UserPreferences>) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
    setSaveError(null);
    setSavedMsg(null);
  }, []);

  const save = useCallback(async (patch: PreferencesPatch) => {
    setIsSaving(true);
    setSaveError(null);
    setSavedMsg(null);
    try {
      const updated = await updatePreferences(patch);
      setPrefs(updated);
      setSavedMsg("Preferencias guardadas. Se aplicarán en tu próxima búsqueda.");
      return true;
    } catch (e) {
      setSaveError(
        e instanceof Error
          ? e.message
          : "No se pudieron guardar. Revisa tu conexión.",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    prefs,
    isLoading,
    isSaving,
    loadError,
    saveError,
    savedMsg,
    updateDraft,
    save,
    reload,
  };
}
