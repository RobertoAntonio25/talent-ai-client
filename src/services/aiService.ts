import { apiClient } from "./apiClient";

export interface ExtractedCvData {
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
    // Groq + cold start Render: 30-50s despertar + 30-60s extracción
    timeoutMs: 120000,
  });
}

export function runMatcher() {
  return apiClient<MatcherRunResponse>("/api/ai/matcher", {
    method: "POST",
    data: {},
    // Orquestador secuencial sobre Groq: puede tardar minutos con muchos PENDING
    timeoutMs: 180000,
  });
}

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
