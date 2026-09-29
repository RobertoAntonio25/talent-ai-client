// src/adapters/jobsAdapter.ts
import type { BackendSearchResult } from "../services/jobsService";
import type { JobApplication } from "../types/kanban";

export function mapResultToJob(r: BackendSearchResult): JobApplication {
  const offer = r.jobOffer;
  const location =
    [offer.city, offer.country].filter(Boolean).join(", ") ||
    (offer.isRemote ? "Remoto" : "No especificada");

  return {
    id: r.id, // uuid del result, estable para React keys
    company: offer.company || "Empresa confidencial",
    position: offer.title || "Sin título",
    status: "por_revisar", // Todo lo que viene del motor entra por revisar. El usuario lo mueve local.
    date: new Date(r.createdAt).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    location,
    salary: offer.salaryString || undefined,
    matchScore: r.matchScore ?? undefined,
    tags: Array.isArray(r.missingSkills) ? r.missingSkills.slice(0, 3) : [],
    notes: r.matchReason || offer.description?.slice(0, 140) || undefined,
    // Guardamos trazabilidad para Fase 5 (matcher/evaluate necesita jobOfferId string):
    jobOfferId: r.jobOfferId,
    backendStatus: r.status,
    matchReason: r.matchReason || undefined,
  };
}
