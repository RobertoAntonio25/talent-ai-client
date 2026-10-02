import { useState, useCallback } from "react";
import type { GeneratedCV } from "../types/cv";
import { uploadCv } from "../services/aiService";
import { mapExtractedToGeneratedCV } from "../adapters/cvAdapter";
import { useAuth } from "../context/AuthContext";

const CV_STORAGE_KEY = "aplikaCv";
// Clave anterior (pre-rebrand Talent AI → Aplika): solo se lee para migrar datos existentes.
const LEGACY_CV_STORAGE_KEY = "talentCv";

function loadStoredCv(): GeneratedCV | null {
  try {
    const raw = localStorage.getItem(CV_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as GeneratedCV;
    // Migración rebrand: rescatar el CV guardado con la clave antigua.
    const legacyRaw = localStorage.getItem(LEGACY_CV_STORAGE_KEY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw) as GeneratedCV;
      localStorage.setItem(CV_STORAGE_KEY, legacyRaw);
      localStorage.removeItem(LEGACY_CV_STORAGE_KEY);
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
export function useCv() {
  const { user } = useAuth();
  // Lazy init: lee disco una sola vez al montar, no en cada render
  const [cv, setCv] = useState<GeneratedCV | null>(loadStoredCv);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadError(null);
      try {
        const res = await uploadCv(file);
        const mapped = mapExtractedToGeneratedCV(res.data, user);
        setCv(mapped);
        localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(mapped));
        return mapped;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al subir el CV.";
        setUploadError(msg);
        throw e;
      } finally {
        setIsUploading(false);
      }
    },
    [user],
  );

  const clear = useCallback(() => {
    setCv(null);
    setUploadError(null);
    localStorage.removeItem(CV_STORAGE_KEY);
  }, []);

  return { cv, isUploading, uploadError, upload, clear };
}
