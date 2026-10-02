import { apiClient } from "./apiClient";

export interface ExtractedCvData {
  // Datos de contacto que el extractor del backend ya devuelve (src/types/ai.types.ts)
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  summary?: string | null;
  skills?: string[] | null;
  targetRole?: string | null;
  targetCity?: string | null;
  wantsRemote?: boolean | null;
  careerTransition?: boolean | null;
  experiences?: Array<{
    role?: string | null;
    company?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    description?: string | null;
  }> | null;
  education?: Array<{
    degree?: string | null;
    institution?: string | null;
    graduationYear?: number | null;
  }> | null;
  projects?: Array<{
    name?: string | null;
    technologies?: string[] | null;
    repoUrl?: string | null;
  }> | null;
  languages?: Array<{
    language?: string | null;
    level?: string | null;
  }> | null;
}

// Respuesta exacta de parseCvController: { success, data, profile }
export interface CvExtractorResponse {
  success: boolean;
  data: ExtractedCvData;
  profile?: unknown;
}

export interface MatcherRunResponse {
  processed: number;
  matches: number;
}

export interface SingleMatchResponse {
  jobOfferId: string;
  score: number;
  isMatch: boolean;
  reason?: string;
  missingSkills: string[];
  persisted: boolean;
  applicationCreated: boolean;
}
//ATS KILLER Tipos
import type {
  CoverLetterOutput,
  OptimizedCv,
  OptimizedCvPatch,
  OptimizedExperience,
} from "../models/optimizer.model";

export type {
  CoverLetterOutput,
  OptimizedCv,
  OptimizedCvPatch,
  OptimizedExperience,
};

export interface OptimizeOfferResult {
  jobOfferId: string;
  optimizedCv: OptimizedCv;
  cached: boolean;
  persisted: boolean;
}

export interface CoverLetterOfferResult {
  jobOfferId: string;
  coverLetter: CoverLetterOutput;
  cached: boolean;
  persisted: boolean;
}

export interface GetOptimizedResult {
  jobOfferId: string;
  optimizedCv: OptimizedCv;
  coverLetter: string | null;
}

export interface UpdateOptimizedPayload {
  optimizedCv?: OptimizedCvPatch;
  adaptedCv?: OptimizedCvPatch;
  coverLetter?: string;
}
export interface UpdateOptimizedResult {
  jobOfferId: string;
  updated: boolean;
}

// Funciones de comunicacion con el back

//Subir PDF y extraer perfil con IA
export function uploadCv(file: File) {
  if (file.type !== "application/pdf") {
    throw new Error("Solo se permiten archivos PDF.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("El PDF supera los 10MB permitidos.");
  }

  const form = new FormData();
  form.append("cv", file, file.name);

  return apiClient<CvExtractorResponse>("/api/ai/cv-extractor", {
    method: "POST",
    data: form,
    // IA + cold start Render: 30-50s despertar + 30-60s extracción
    timeoutMs: 120000,
  });
}

//Orquestador por lotes
export function runMatcher() {
  return apiClient<MatcherRunResponse>("/api/ai/matcher", {
    method: "POST",
    data: {},
    // Orquestador secuencial sobre IA: puede tardar minutos con muchos PENDING
    timeoutMs: 180000,
  });
}

//Evaluar una oferta individual
export function evaluateMatch(jobOfferId: string) {
  if (!jobOfferId) {
    throw new Error("jobOfferId es requerido para evaluar el match.");
  }
  return apiClient<SingleMatchResponse>("/api/ai/matcher/evaluate", {
    method: "POST",
    data: { jobOfferId },
    timeoutMs: 120000,
  });
}

//ATS Killer: Generar o recuperar de caché el cv optimizado para una oferta

export function optimizeCvForOffer(jobOfferId: string) {
  if (!jobOfferId) {
    throw new Error("jobOfferId es requerido para optimizar el CV.");
  }
  return apiClient<OptimizeOfferResult>("/api/ai/optimize", {
    method: "POST",
    data: { jobOfferId },
    timeoutMs: 90000,
  });
}

//ATS Killer: Generar o recuperar de caché la carta de presentación
export function generateCoverLetterForOffer(jobOfferId: string) {
  if (!jobOfferId) {
    throw new Error("jobOfferId es requerido para generar la carta.");
  }
  return apiClient<CoverLetterOfferResult>("/api/ai/cover-letter", {
    method: "POST",
    data: { jobOfferId },
    timeoutMs: 90000,
  });
}

// ATS Killer: Obtener el CV optimizado ya guardado en la BD
export function getOptimizedCvForOffer(jobOfferId: string) {
  if (!jobOfferId) {
    throw new Error("jobOfferId es requerido para consultar el CV optimizado.");
  }
  return apiClient<GetOptimizedResult>(`/api/ai/optimize/${jobOfferId}`, {
    method: "GET",
    timeoutMs: 30000,
  });
}

// ATS Killer: Guardar modificaciones manuales en el CV o Carta (PATCH parcial)
export function updateOptimizedCvForOffer(
  jobOfferId: string,
  patch: UpdateOptimizedPayload,
) {
  if (!jobOfferId) {
    throw new Error(
      "jobOfferId es requerido para actualizar el CV optimizado.",
    );
  }
  return apiClient<UpdateOptimizedResult>(`/api/ai/optimize/${jobOfferId}`, {
    method: "PATCH",
    data: patch,
    timeoutMs: 30000,
  });
}
