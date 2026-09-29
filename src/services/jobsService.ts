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

export function getUserResults(page = 1, limit = 20) {
  return apiClient<PaginatedResults>(
    `/api/jobs/results?page=${page}&limit=${limit}`,
  );
}

export function triggerManualSearch() {
  // El back saca userId del JWT, body vacío {} pasa el Zod (userId opcional)
  return apiClient<{ data: PaginatedResults; message: string }>(
    `/api/jobs/manual-trigger`,
    { method: "POST", data: {}, timeoutMs: 180000 },
  );
}
