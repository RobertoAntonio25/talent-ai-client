import { useState, useCallback, useEffect, useRef } from "react";
import type { GeneratedCV } from "../types/cv";
import { uploadCv } from "../services/aiService";
import { mapExtractedToGeneratedCV } from "../adapters/cvAdapter";
import { useAuth } from "../context/AuthContext";

const CV_STORAGE_KEY = "aplikaCv";
// Clave anterior (pre-rebrand Talent AI → Aplika): solo se lee para migrar datos existentes.
const LEGACY_CV_STORAGE_KEY = "talentCv";
// Dueño del CV legacy (sin escopar): evita adoptar el CV de otra cuenta.
const CV_OWNER_KEY = "aplikaCvOwner";

const CV_CHANGED_EVENT = "aplika:cv-changed";

function notifyCvChanged(): void {
  // Misma pestaña: recarga las otras instancias de useCv (el evento
  // "storage" solo avisa a otras pestañas).
  window.dispatchEvent(new Event(CV_CHANGED_EVENT));
}

// Clave por cuenta: el CV sobrevive al logout y nunca se cruza entre usuarios.
function keyFor(userId: string | null): string {
  return userId ? `${CV_STORAGE_KEY}:${userId}` : CV_STORAGE_KEY;
}

function readJson(key: string): GeneratedCV | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as GeneratedCV) : null;
  } catch {
    return null;
  }
}

function loadStoredCv(userId: string | null): GeneratedCV | null {
  if (userId) {
    const scoped = readJson(keyFor(userId));
    if (scoped) return scoped;
    // Adopta el CV legacy solo si consta que es de esta cuenta; si no,
    // esta cuenta aún no tiene CV (no se muestra el de otro usuario).
    try {
      if (localStorage.getItem(CV_OWNER_KEY) === userId) {
        const legacy = readJson(CV_STORAGE_KEY) ?? readJson(LEGACY_CV_STORAGE_KEY);
        if (legacy) {
          localStorage.setItem(keyFor(userId), JSON.stringify(legacy));
          localStorage.removeItem(CV_STORAGE_KEY);
          return legacy;
        }
      }
    } catch {
      // Disco ilegible: sin CV.
    }
    return null;
  }
  const raw = readJson(CV_STORAGE_KEY);
  if (raw) return raw;
  // Migración rebrand: rescatar el CV guardado con la clave antigua.
  const legacy = readJson(LEGACY_CV_STORAGE_KEY);
  if (legacy) {
    localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(legacy));
    localStorage.removeItem(LEGACY_CV_STORAGE_KEY);
  }
  return legacy;
}
export function useCv() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  // Lazy init: lee disco una sola vez al montar, no en cada render
  const [cv, setCv] = useState<GeneratedCV | null>(() => loadStoredCv(userId));
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Si cambia la cuenta, se recarga el CV de esa cuenta (o vacío si es nueva).
  const userIdRef = useRef<string | null>(userId);
  useEffect(() => {
    if (userIdRef.current !== userId) {
      userIdRef.current = userId;
      setCv(loadStoredCv(userId));
      setUploadError(null);
    }
  }, [userId]);

  // Cambios de otra instancia (ej. borrar en /profile y abrir el modal en
  // Dashboard): recarga desde disco para no mostrar datos obsoletos.
  useEffect(() => {
    const onCvChanged = () => {
      setCv(loadStoredCv(userIdRef.current));
      setUploadError(null);
    };
    window.addEventListener(CV_CHANGED_EVENT, onCvChanged);
    return () => window.removeEventListener(CV_CHANGED_EVENT, onCvChanged);
  }, []);

  const persistCv = useCallback(
    (next: GeneratedCV | null) => {
      const uid = userIdRef.current;
      if (next) {
        localStorage.setItem(keyFor(uid), JSON.stringify(next));
        try {
          if (uid) localStorage.setItem(CV_OWNER_KEY, uid);
        } catch {
          // Sin dueño registrado: la adopción legacy no aplica.
        }
      } else if (uid) {
        // Borrar es por cuenta: el CV de otros usuarios no se toca.
        localStorage.removeItem(keyFor(uid));
      } else {
        localStorage.removeItem(CV_STORAGE_KEY);
        localStorage.removeItem(LEGACY_CV_STORAGE_KEY);
      }
      setCv(next);
      setUploadError(null);
      notifyCvChanged();
    },
    [],
  );

  const upload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadError(null);
      try {
        const res = await uploadCv(file);
        const mapped = mapExtractedToGeneratedCV(res.data, user);
        persistCv(mapped);
        return mapped;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al subir el CV.";
        setUploadError(msg);
        throw e;
      } finally {
        setIsUploading(false);
      }
    },
    [user, persistCv],
  );

  const clear = useCallback(() => {
    persistCv(null);
  }, [persistCv]);

  // Alta/edición manual del CV base (persiste en este dispositivo).
  const saveManual = useCallback(
    (patch: Partial<GeneratedCV> & { skillsText?: string }) => {
      const { skillsText, ...rest } = patch;
      const skills = skillsText?.trim()
        ? skillsText.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;
      const base: GeneratedCV =
        cv ?? { fullName: "", targetRole: "", summary: "", skills: [], experience: [] };
      persistCv({ ...base, ...rest, ...(skills ? { skills } : {}) });
    },
    [cv, persistCv],
  );

  // Actualización parcial del CV (la usa la edición manual en /profile).
  const updateCv = useCallback(
    (patch: Partial<GeneratedCV>) => {
      const base: GeneratedCV =
        cv ?? { fullName: "", targetRole: "", summary: "", skills: [], experience: [] };
      persistCv({ ...base, ...patch });
    },
    [cv, persistCv],
  );

  return { cv, isUploading, uploadError, upload, clear, saveManual, updateCv };
}
