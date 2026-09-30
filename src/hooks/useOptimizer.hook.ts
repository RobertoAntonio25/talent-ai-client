// src/hooks/useOptimizer.hook.ts
// Puente controller<->view: state machine + caché reactiva por jobOfferId.
// La persistencia real vive en el backend (Prisma/Supabase); aquí solo caché memoria.
import { useState, useCallback, useRef } from "react";
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
  const [coverLetter, setCoverLetter] = useState<CoverLetterOutput | null>(null);
  const [isLoadingCv, setIsLoadingCv] = useState(false);
  const [isLoadingLetter, setIsLoadingLetter] = useState(false);
  const [isSavingPatch, setIsSavingPatch] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [letterError, setLetterError] = useState<string | null>(null);

  const cacheRef = useRef(new Map<string, OptimizerCacheEntry>());
  const inflightCvRef = useRef(new Map<string, Promise<OptimizedCv>>());
  const inflightLetterRef = useRef(new Map<string, Promise<CoverLetterOutput>>());

  const fetchOrGenerateCv = useCallback(async (jobOfferId: string) => {
    if (!jobOfferId) {
      setCvError("jobOfferId es requerido.");
      return null;
    }
    const cached = cacheRef.current.get(jobOfferId)?.cv;
    if (cached) {
      setOptimizedCv(cached);
      setCvError(null);
      return cached;
    }
    const inflight = inflightCvRef.current.get(jobOfferId);
    if (inflight) return inflight;

    setIsLoadingCv(true);
    setCvError(null);
    const request = fetchOrGenerateOptimizedCvByJobOffer(jobOfferId);
    inflightCvRef.current.set(jobOfferId, request);
    try {
      const cv = await request;
      cacheRef.current.set(jobOfferId, { ...cacheRef.current.get(jobOfferId), cv });
      setOptimizedCv(cv);
      return cv;
    } catch (e) {
      const msg = getErrorMessage(e);
      setCvError(msg);
      return null;
    } finally {
      inflightCvRef.current.delete(jobOfferId);
      setIsLoadingCv(false);
    }
  }, []);

  const fetchOrGenerateLetter = useCallback(async (jobOfferId: string) => {
    if (!jobOfferId) {
      setLetterError("jobOfferId es requerido.");
      return null;
    }
    const cached = cacheRef.current.get(jobOfferId)?.letter;
    if (cached) {
      setCoverLetter(cached);
      setLetterError(null);
      return cached;
    }
    const inflight = inflightLetterRef.current.get(jobOfferId);
    if (inflight) return inflight;

    setIsLoadingLetter(true);
    setLetterError(null);
    const request = fetchOrGenerateCoverLetterByJobOffer(jobOfferId);
    inflightLetterRef.current.set(jobOfferId, request);
    try {
      const letter = await request;
      cacheRef.current.set(jobOfferId, { ...cacheRef.current.get(jobOfferId), letter });
      setCoverLetter(letter);
      return letter;
    } catch (e) {
      const msg = getErrorMessage(e);
      setLetterError(msg);
      return null;
    } finally {
      inflightLetterRef.current.delete(jobOfferId);
      setIsLoadingLetter(false);
    }
  }, []);

  const saveCvPatch = useCallback(async (jobOfferId: string, patch: CvPatch) => {
    if (!jobOfferId) {
      setCvError("jobOfferId es requerido.");
      return false;
    }
    setIsSavingPatch(true);
    setCvError(null);
    try {
      await saveOptimizedCvPatchByJobOffer(jobOfferId, patch);
      setOptimizedCv((prev) => {
        if (!prev) return prev;
        const merged = { ...prev, ...patch };
        cacheRef.current.set(jobOfferId, { ...cacheRef.current.get(jobOfferId), cv: merged });
        return merged;
      });
      return true;
    } catch (e) {
      setCvError(getErrorMessage(e));
      return false;
    } finally {
      setIsSavingPatch(false);
    }
  }, []);

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
