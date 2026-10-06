// src/hooks/useOptimizer.hook.ts
// Puente controller<->view: state machine + caché reactiva por jobOfferId.
// La persistencia real vive en el backend (Prisma/Supabase); aquí solo caché memoria.
import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import type {
  OptimizedCv,
  CoverLetterOutput,
  CvPatch,
  OptimizerCacheEntry,
} from "../models/optimizer.model";
import {
  fetchOrGenerateOptimizedCvByJobOffer,
  fetchOrGenerateCoverLetterByJobOffer,
  saveOptimizedCvPatchByJobOffer,
} from "../services/optimizer.service";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Error inesperado. Inténtalo de nuevo.";
}

export function useOptimizer() {
  const [optimizedCv, setOptimizedCv] = useState<OptimizedCv | null>(null);
  const [coverLetter, setCoverLetter] = useState<CoverLetterOutput | null>(
    null,
  );
  const [isLoadingCv, setIsLoadingCv] = useState(false);
  const [isLoadingLetter, setIsLoadingLetter] = useState(false);
  const [isSavingPatch, setIsSavingPatch] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [letterError, setLetterError] = useState<string | null>(null);

  const cacheRef = useRef(new Map<string, OptimizerCacheEntry>());
  const inflightCvRef = useRef(new Map<string, Promise<OptimizedCv>>());
  const inflightLetterRef = useRef(
    new Map<string, Promise<CoverLetterOutput>>(),
  );

  // La caché es por cuenta: el mismo jobOfferId no puede servir el CV de otro usuario.
  const { user } = useAuth();
  const uid = user?.id ?? "anon";
  const cacheKey = useCallback(
    (jobOfferId: string, lang?: string) =>
      `${uid}::${jobOfferId}::${lang ?? "default"}`,
    [uid],
  );

  // Al cambiar de cuenta se limpia lo mostrado (la caché vieja queda huérfana por su prefijo).
  const uidRef = useRef(uid);
  useEffect(() => {
    if (uidRef.current !== uid) {
      uidRef.current = uid;
      setOptimizedCv(null);
      setCoverLetter(null);
      setCvError(null);
      setLetterError(null);
    }
  }, [uid]);

  const fetchOrGenerateCv = useCallback(
    async (
      jobOfferId: string,
      opts?: { force?: boolean; targetLanguage?: "es" | "en" },
    ) => {
      if (!jobOfferId) {
        setCvError("jobOfferId es requerido.");
        return null;
      }
      const key = cacheKey(jobOfferId, opts?.targetLanguage);
      if (!opts?.force) {
        const cached = cacheRef.current.get(key)?.cv;
        if (cached) {
          setOptimizedCv(cached);
          setCvError(null);
          return cached;
        }
        const inflight = inflightCvRef.current.get(key);
        if (inflight) return inflight;
      }

      setIsLoadingCv(true);
      setCvError(null);
      const request = fetchOrGenerateOptimizedCvByJobOffer(jobOfferId, opts);
      inflightCvRef.current.set(key, request);
      try {
        const cv = await request;
        cacheRef.current.set(key, { ...cacheRef.current.get(key), cv });
        setOptimizedCv(cv);
        return cv;
      } catch (e) {
        const msg = getErrorMessage(e);
        setCvError(msg);
        return null;
      } finally {
        inflightCvRef.current.delete(key);
        setIsLoadingCv(false);
      }
    },
    [cacheKey],
  );

  const fetchOrGenerateLetter = useCallback(
    async (
      jobOfferId: string,
      opts?: { force?: boolean; targetLanguage?: "es" | "en" },
    ) => {
      if (!jobOfferId) {
        setLetterError("jobOfferId es requerido.");
        return null;
      }
      const key = cacheKey(jobOfferId, opts?.targetLanguage);
      if (!opts?.force) {
        const cached = cacheRef.current.get(key)?.letter;
        if (cached) {
          setCoverLetter(cached);
          setLetterError(null);
          return cached;
        }
        const inflight = inflightLetterRef.current.get(key);
        if (inflight) return inflight;
      }

      setIsLoadingLetter(true);
      setLetterError(null);
      const request = fetchOrGenerateCoverLetterByJobOffer(jobOfferId, opts);
      inflightLetterRef.current.set(key, request);
      try {
        const letter = await request;
        cacheRef.current.set(key, { ...cacheRef.current.get(key), letter });
        setCoverLetter(letter);
        return letter;
      } catch (e) {
        const msg = getErrorMessage(e);
        setLetterError(msg);
        return null;
      } finally {
        inflightLetterRef.current.delete(key);
        setIsLoadingLetter(false);
      }
    },
    [cacheKey],
  );

  const saveCvPatch = useCallback(
    async (jobOfferId: string, patch: CvPatch) => {
      if (!jobOfferId) {
        setCvError("jobOfferId es requerido.");
        return false;
      }
      const key = cacheKey(jobOfferId, optimizedCv?.language);
      setIsSavingPatch(true);
      setCvError(null);
      try {
        await saveOptimizedCvPatchByJobOffer(jobOfferId, patch);
        setOptimizedCv((prev) => {
          if (!prev) return prev;
          const merged = { ...prev, ...patch };
          cacheRef.current.set(key, {
            ...cacheRef.current.get(key),
            cv: merged,
          });
          return merged;
        });
        return true;
      } catch (e) {
        setCvError(getErrorMessage(e));
        return false;
      } finally {
        setIsSavingPatch(false);
      }
    },
    [cacheKey, optimizedCv?.language],
  );

  return {
    optimizedCv,
    coverLetter,
    isLoadingCv,
    isLoadingLetter,
    isSavingPatch,
    cvError,
    letterError,
    fetchOrGenerateCv,
    fetchOrGenerateLetter,
    saveCvPatch,
  };
}
