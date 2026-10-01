import type {
  BackendApplicationStatus,
  BackendSearchResult,
} from "../services/jobsService";
import type { ColumnStatus, JobApplication } from "../types/kanban";

// Fase 6.5: traducción entre las columnas del Kanban y el estado del
// seguimiento que persiste el backend (fuente única de verdad: si mañana
// cambia un nombre, se toca solo aquí).
const BACKEND_TO_COLUMN: Record<BackendApplicationStatus, ColumnStatus> = {
  TODO: "por_revisar",
  APPLIED: "aplicado",
  INTERVIEW: "entrevista",
  OFFER: "oferta",
};

const COLUMN_TO_BACKEND: Record<ColumnStatus, BackendApplicationStatus> = {
  por_revisar: "TODO",
  aplicado: "APPLIED",
  entrevista: "INTERVIEW",
  oferta: "OFFER",
};

/** Columna del tablero -> estado que entiende el backend (lo usa useJobs al mover). */
export function columnToBackendStatus(
  column: ColumnStatus,
): BackendApplicationStatus {
  return COLUMN_TO_BACKEND[column];
}

export function mapResultToJob(r: BackendSearchResult): JobApplication {
  const offer = r.jobOffer;
  const isManual = offer.isManual === true;
  const location =
    [offer.city, offer.country].filter(Boolean).join(", ") ||
    (offer.isRemote ? "Remoto" : "No especificada");

  // Chips de la tarjeta: en las manuales los pone el usuario (technologies,
  // extensión 6.6); en las del motor vienen del matcher (missingSkills).
  // Sin recortar aquí: KanbanCard ya muestra 3 + "N más".
  const technologies = Array.isArray(offer.technologies)
    ? offer.technologies
    : [];
  const tags =
    technologies.length > 0
      ? technologies
      : Array.isArray(r.missingSkills)
        ? r.missingSkills
        : [];

  return {
    id: r.id, // uuid del result, estable para React keys
    company: offer.company || "Empresa confidencial",
    position: offer.title || "Sin título",
    // Fase 6.5: la columna sale del seguimiento real del backend.
    // Sin application (null/undefined) => la tarjeta aún no se ha movido:
    // entra por "Por Revisar" (mismo comportamiento que antes del 6.4).
    status: r.application
      ? BACKEND_TO_COLUMN[r.application.status]
      : "por_revisar",
    date: new Date(r.createdAt).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    location,
    salary: offer.salaryString || undefined,
    matchScore: r.matchScore ?? undefined,
    tags,
    // Notas: en las manuales las escribió el usuario (viven en description);
    // en las del motor mostramos la razón del matcher (o un recorte de la
    // descripción como último recurso).
    notes: isManual
      ? offer.description || undefined
      : r.matchReason || offer.description?.slice(0, 140) || undefined,
    jobOfferId: r.jobOfferId,
    backendStatus: r.status,
    matchReason: r.matchReason || undefined,
    // 6.6: distingue ofertas manuales (editables) de las del motor (compartidas).
    isManual,
    description: offer.description || undefined,
    originalUrl: offer.originalUrl || undefined,
    missingSkills: Array.isArray(r.missingSkills) ? r.missingSkills : [],
  };
}
