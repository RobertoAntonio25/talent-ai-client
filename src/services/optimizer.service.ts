// src/services/optimizer.service.ts
// Frontend-only: consume backend Render vía apiClient.
import { apiClient, ApiError } from "./apiClient";
import type {
  OptimizedCv,
  CoverLetterOutput,
  CvPatch,
} from "../models/optimizer.model";

const OPTIMIZE_TIMEOUT_MS = 90000;
const READ_TIMEOUT_MS = 30000;

interface OptimizePostResponse {
  jobOfferId: string;
  cached: boolean;
  persisted: boolean;
  optimizedCv: OptimizedCv;
}

interface CoverLetterPostResponse {
  jobOfferId: string;
  cached: boolean;
  persisted: boolean;
  coverLetter: CoverLetterOutput;
}

interface OptimizeGetResponse {
  jobOfferId: string;
  optimizedCv: OptimizedCv | null;
  coverLetter: string | null;
}

function assertJobOfferId(jobOfferId: string): void {
  if (!jobOfferId)
    throw new ApiError("jobOfferId es requerido.", 400, "VALIDATION_ERROR");
}

function parseCoverLetterRaw(raw: string | null): CoverLetterOutput | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CoverLetterOutput;
  } catch {
    return null;
  }
}

export function fetchOptimizedDocumentsByJobOffer(jobOfferId: string) {
  assertJobOfferId(jobOfferId);
  return apiClient<OptimizeGetResponse>(`/api/ai/optimize/${jobOfferId}`, {
    timeoutMs: READ_TIMEOUT_MS,
  });
}

export async function fetchOrGenerateOptimizedCvByJobOffer(
  jobOfferId: string,
  opts?: { force?: boolean },
): Promise<OptimizedCv> {
  assertJobOfferId(jobOfferId);
  // force:true salta el GET y va directo al POST (el back regenera con
  // forceRegenerate desde FASE D; antes de eso el campo se ignora).
  if (!opts?.force) {
    try {
      const cached = await fetchOptimizedDocumentsByJobOffer(jobOfferId);
      if (cached.optimizedCv) return cached.optimizedCv;
    } catch (e) {
      if (!(e instanceof ApiError) || e.status !== 404) throw e;
    }
  }
  const generated = await apiClient<OptimizePostResponse>("/api/ai/optimize", {
    method: "POST",
    data: { jobOfferId, ...(opts?.force ? { forceRegenerate: true } : {}) },
    timeoutMs: OPTIMIZE_TIMEOUT_MS,
  });
  return generated.optimizedCv;
}

export async function fetchOrGenerateCoverLetterByJobOffer(
  jobOfferId: string,
  opts?: { force?: boolean },
): Promise<CoverLetterOutput> {
  assertJobOfferId(jobOfferId);
  if (!opts?.force) {
    try {
      const cached = await fetchOptimizedDocumentsByJobOffer(jobOfferId);
      const parsed = parseCoverLetterRaw(cached.coverLetter);
      if (parsed) return parsed;
    } catch (e) {
      if (!(e instanceof ApiError) || e.status !== 404) throw e;
    }
  }
  const generated = await apiClient<CoverLetterPostResponse>(
    "/api/ai/cover-letter",
    {
      method: "POST",
      data: { jobOfferId, ...(opts?.force ? { forceRegenerate: true } : {}) },
      timeoutMs: OPTIMIZE_TIMEOUT_MS,
    },
  );
  return generated.coverLetter;
}

export function saveOptimizedCvPatchByJobOffer(
  jobOfferId: string,
  patch: CvPatch,
) {
  assertJobOfferId(jobOfferId);
  if (!patch || Object.keys(patch).length === 0) {
    throw new ApiError(
      "El patch no puede estar vacío.",
      400,
      "VALIDATION_ERROR",
    );
  }
  return apiClient<{ jobOfferId: string; updated: boolean }>(
    `/api/ai/optimize/${jobOfferId}`,
    {
      method: "PATCH",
      data: { optimizedCv: patch },
      timeoutMs: READ_TIMEOUT_MS,
    },
  );
}
