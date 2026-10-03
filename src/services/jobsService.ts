// src/services/jobsService.ts
import { apiClient } from "./apiClient";

export type BackendResultStatus =
  | "PENDING"
  | "PROCESSING"
  | "MATCHED"
  | "REJECTED";

export interface BackendJobOffer {
  id: string; // ¡OJO! string de JSearch, NO uuid
  title: string;
  company: string;
  description?: string | null;
  city?: string | null;
  country?: string | null;
  salaryString?: string | null;
  isRemote?: boolean | null;
  originalUrl?: string | null;
  companyLogo?: string | null;
  isManual?: boolean | null;
  technologies?: string[] | null;
}

export type BackendApplicationStatus =
  | "TODO"
  | "APPLIED"
  | "INTERVIEW"
  | "OFFER";

export interface BackendApplication {
  id: string;
  jobOfferId: string;
  status: BackendApplicationStatus;
}

export interface BackendSearchResult {
  id: string; // uuid de JobSearchResult -> este será tu Kanban id
  jobOfferId: string;
  status: BackendResultStatus;
  matchScore?: number | null;
  matchReason?: string | null;
  missingSkills?: string[] | null;
  createdAt: string;
  jobOffer: BackendJobOffer;
  application?: Pick<BackendApplication, "id" | "status"> | null;
}

export interface PaginatedResults {
  data: BackendSearchResult[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ManualApplicationPayload {
  company: string;
  position: string;
  originalUrl?: string;
  location?: string;
  notes?: string;
  salaryString?: string;
  technologies?: string[];
}

// Fase 3a (issue #128): trigger asíncrono 202 + polling.
export interface ManualTriggerData {
  runId: string;
  status: "RUNNING";
}

export interface ManualTriggerResponse {
  success: boolean;
  data: ManualTriggerData;
  message?: string;
}

export type SearchCycleRunStatus = "RUNNING" | "DONE" | "ERROR";

export interface SearchCycleRun {
  id: string;
  origin: "CRON" | "MANUAL";
  status: SearchCycleRunStatus;
  startedAt: string;
  finishedAt: string | null;
  usersProcessed: number;
  jsearchCalls: number;
  offersNew: number;
  offersUpdated: number;
  offersExpired: number;
  offersPurged: number;
  aiEvaluated: number;
  aiMatches: number;
  error: string | null;
}

export function getUserResults(page = 1, limit = 20) {
  return apiClient<PaginatedResults>(
    `/api/jobs/results?page=${page}&limit=${limit}`,
  );
}

export function triggerManualSearch() {
  // Fase 3a (issue #128, BREAKING): el back responde 202 al instante con el
  // runId y lanza el ciclo en segundo plano. El hook sondea GET /runs/:runId
  // cada 5 s hasta DONE y luego lee GET /results. Timeout corto: el 202 no
  // espera 1-3 min como antes (se acabó el timeout de 180 s).
  return apiClient<ManualTriggerResponse>(`/api/jobs/manual-trigger`, {
    method: "POST",
    data: {},
    timeoutMs: 10000,
  });
}

export function getSearchCycleRun(runId: string) {
  return apiClient<{ success: boolean; data: SearchCycleRun }>(
    `/api/jobs/runs/${encodeURIComponent(runId)}`,
  );
}

//Mueve la tarjeta a otra columna
export function upsertApplication(
  jobOfferId: string,
  status: BackendApplicationStatus,
) {
  return apiClient<BackendApplication>(
    `/api/jobs/applications/${encodeURIComponent(jobOfferId)}`,
    { method: "PUT", data: { status } },
  );
}

//Elimina la tarjeta del tablero
export function deleteApplication(jobOfferId: string) {
  return apiClient<{ message: string }>(
    `/api/jobs/applications/${encodeURIComponent(jobOfferId)}`,
    { method: "DELETE" },
  );
}

//Crea una postulacion manual

export function createManualApplication(payload: ManualApplicationPayload) {
  return apiClient<BackendApplication>(`/api/jobs/applications/manual`, {
    method: "POST",
    data: payload,
  });
}

// Extensión 6.6: editar una oferta MANUAL (PATCH /api/jobs/offers/:jobOfferId).
// El backend solo lo permite en ofertas isManual (las del motor son
// compartidas entre usuarios y no se editan).
export interface ManualOfferPatch {
  title?: string;
  company?: string;
  salaryString?: string;
  city?: string;
  description?: string;
  technologies?: string[];
  originalUrl?: string;
}

export function updateManualOffer(jobOfferId: string, patch: ManualOfferPatch) {
  return apiClient<BackendJobOffer>(
    `/api/jobs/offers/${encodeURIComponent(jobOfferId)}`,
    { method: "PATCH", data: patch },
  );
}
