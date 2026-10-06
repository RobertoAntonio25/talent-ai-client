import { useState, useCallback, useEffect, useRef } from "react";
import type { GeneratedCV } from "../types/cv";
import { uploadCv } from "../services/aiService";
import { getProfileCv, updateProfileCv } from "../services/userProfile.service";
import {
  mapExtractedToGeneratedCV,
  mapGeneratedCVToProfilePatch,
  mapProfileCvToGeneratedCV,
} from "../adapters/cvAdapter";
import { useAuth } from "../context/AuthContext";

const CV_STORAGE_KEY = "aplikaCv";
// Clave anterior (pre-rebrand Talent AI → Aplika): solo se lee para migrar datos existentes.
const LEGACY_CV_STORAGE_KEY = "talentCv";
// Dueño del CV legacy (sin escopar): evita adoptar el CV de otra cuenta.
const CV_OWNER_KEY = "aplikaCvOwner";
// Borrado explícito por cuenta: evita que la hidratación resucite el CV.
const CV_DELETED_KEY = "aplikaCvDeleted";

const CV_CHANGED_EVENT = "aplika:cv-changed";
// Issue #107: la edición manual se persiste en el back con retardo para no
// spamear un PATCH por cada Guardar de cada bloque.
const SYNC_DEBOUNCE_MS = 1500;

function notifyCvChanged(): void {
  // Misma pestaña: recarga las otras instancias de useCv (el evento
  // "storage" solo avisa a otras pestañas).
  window.dispatchEvent(new Event(CV_CHANGED_EVENT));
}

// Clave por cuenta: el CV sobrevive al logout y nunca se cruza entre usuarios.
function keyFor(userId: string | null): string {
  return userId ? `${CV_STORAGE_KEY}:${userId}` : CV_STORAGE_KEY;
}

function deletedKeyFor(userId: string | null): string {
  return userId ? `${CV_DELETED_KEY}:${userId}` : CV_DELETED_KEY;
}

function readJson(key: string): GeneratedCV | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as GeneratedCV) : null;
  } catch {
    return null;
  }
}

function deletedMarker(uid: string | null): boolean {
  if (!uid) return false;
  try {
    return localStorage.getItem(deletedKeyFor(uid)) === "1";
  } catch {
    return false;
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
        const legacy =
          readJson(CV_STORAGE_KEY) ?? readJson(LEGACY_CV_STORAGE_KEY);
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
  // Issue #107: hidratación desde el back + error de sincronización.
  const [isHydrating, setIsHydrating] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Si cambia la cuenta, se recarga el CV de esa cuenta (o vacío si es nueva).
  const userIdRef = useRef<string | null>(userId);
  const syncTimer = useRef<number | null>(null);

  const persistLocal = useCallback(
    (uid: string | null, next: GeneratedCV | null) => {
      if (next) {
        localStorage.setItem(keyFor(uid), JSON.stringify(next));
        try {
          if (uid) {
            localStorage.setItem(CV_OWNER_KEY, uid);
            localStorage.removeItem(deletedKeyFor(uid));
          }
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
    },
    [],
  );

  // Issue #107: persiste el CV editado a mano en el back (con retardo).
  // Sin perfil en el back, el PATCH lo crea (upsert); el 404 no aplica aquí.
  const scheduleSync = useCallback((uid: string | null, next: GeneratedCV) => {
    if (!uid) return;
    if (syncTimer.current !== null) window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => {
      syncTimer.current = null;
      // Evita escribir en la cuenta equivocada si se cambió de sesión.
      if (userIdRef.current !== uid) return;
      void updateProfileCv(mapGeneratedCVToProfilePatch(next)).catch(
        (e: unknown) => {
          if (userIdRef.current !== uid) return;
          setSyncError(
            e instanceof Error
              ? `No se pudo guardar en el servidor: ${e.message}`
              : "No se pudo guardar en el servidor.",
          );
        },
      );
    }, SYNC_DEBOUNCE_MS);
  }, []);

  const persistCv = useCallback(
    (next: GeneratedCV | null, opts?: { sync?: boolean }) => {
      const uid = userIdRef.current;
      if (syncTimer.current !== null) {
        window.clearTimeout(syncTimer.current);
        syncTimer.current = null;
      }
      try {
        persistLocal(uid, next);
        if (!next && uid) localStorage.setItem(deletedKeyFor(uid), "1");
      } catch {
        // Disco ilegible: se muestra en memoria igualmente.
      }
      setCv(next);
      setUploadError(null);
      if (next) setSyncError(null);
      // La subida ya guardó el CV completo en el back (extractor); la
      // edición manual sí necesita su PATCH con retardo.
      if (next && (opts?.sync ?? true)) scheduleSync(uid, next);
      notifyCvChanged();
    },
    [persistLocal, scheduleSync],
  );

  useEffect(() => {
    if (userIdRef.current !== userId) {
      userIdRef.current = userId;
      if (syncTimer.current !== null) {
        window.clearTimeout(syncTimer.current);
        syncTimer.current = null;
      }
      setCv(loadStoredCv(userId));
      setUploadError(null);
      setSyncError(null);
    }
  }, [userId]);

  // Issue #107: hidratación — si esta cuenta no tiene CV en este dispositivo
  // (y no lo borró a mano), se trae el persistido en el back.
  // Diferido a microtarea (Promise.resolve) para evitar setState síncrono en efecto.
  const hydratedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      !userId ||
      cv ||
      hydratedForRef.current === userId ||
      deletedMarker(userId)
    ) {
      return;
    }

    hydratedForRef.current = userId;
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;
      setIsHydrating(true);

      return getProfileCv()
        .then((data) => {
          if (cancelled) return;
          persistCv(mapProfileCvToGeneratedCV(data, user), { sync: false });
        })
        .catch(() => {
          // 404 sin perfil u otro fallo: se mantiene el vacío local.
        })
        .finally(() => {
          if (!cancelled) setIsHydrating(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [userId, cv, persistCv, user]);

  useEffect(() => {
    return () => {
      if (syncTimer.current !== null) window.clearTimeout(syncTimer.current);
    };
  }, []);

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

  const upload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadError(null);
      try {
        const res = await uploadCv(file);
        const mapped = mapExtractedToGeneratedCV(res.data, user);
        persistCv(mapped, { sync: false });
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

  // Alta/edición manual del CV base (edición local + PATCH con retardo).
  const saveManual = useCallback(
    (patch: Partial<GeneratedCV> & { skillsText?: string }) => {
      const { skillsText, ...rest } = patch;
      const skills = skillsText?.trim()
        ? skillsText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;
      const base: GeneratedCV = cv ?? {
        fullName: "",
        targetRole: "",
        summary: "",
        skills: [],
        experience: [],
      };
      persistCv({ ...base, ...rest, ...(skills ? { skills } : {}) });
    },
    [cv, persistCv],
  );

  // Actualización parcial del CV (la usa la edición manual en /profile).
  const updateCv = useCallback(
    (patch: Partial<GeneratedCV>) => {
      const base: GeneratedCV = cv ?? {
        fullName: "",
        targetRole: "",
        summary: "",
        skills: [],
        experience: [],
      };
      persistCv({ ...base, ...patch });
    },
    [cv, persistCv],
  );

  return {
    cv,
    isUploading,
    uploadError,
    upload,
    clear,
    saveManual,
    updateCv,
    isHydrating,
    syncError,
  };
}
