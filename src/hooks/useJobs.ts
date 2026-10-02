import { useState, useEffect, useCallback } from "react";
import type { JobApplication, ColumnStatus } from "../types/kanban";
import {
  createManualApplication,
  deleteApplication,
  getUserResults,
  updateManualOffer,
  upsertApplication,
  type ManualApplicationPayload,
} from "../services/jobsService";
import { columnToBackendStatus, mapResultToJob } from "../adapters/jobsAdapter";

/** Extrae un mensaje legible de cualquier error (ApiError incluido). */
function toMessage(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback;
}

export function useJobs() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  // Fase 6.5: errores de las ACCIONES (mover/crear/editar/borrar) con rollback.
  // Separado de syncError para no mezclar "no cargó la lista" con
  // "no se pudo guardar tu cambio".
  const [actionError, setActionError] = useState<string | null>(null);

  // 1. CARGA REAL desde el backend (resiliente: no vacía en error)
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setSyncError(null);

    try {
      const res = await getUserResults(1, 20);
      if (res.meta.total === 0) {
        // Tablero vacío real: solo vaciamos si antes no había error de red.
        // Si el back dice total 0, es que no hay resultados aún (hay que lanzar manual-trigger).
        setJobs([]);
        return;
      }
      setJobs(res.data.map(mapResultToJob));
    } catch (e) {
      setSyncError(toMessage(e, "Error al sincronizar ofertas."));
      // FIX 6.2: no hacemos setJobs([]) aquí.
      // Conservamos el tablero previo (cache local) para que un cold-start
      // de Render o un 429 no borre lo que el usuario ya veía.
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carga inicial al montar. Se difiere a microtarea para no llamar a
  // setState de forma síncrona en el cuerpo del efecto
  // (react-hooks/set-state-in-effect); el comportamiento no cambia.
  useEffect(() => {
    void Promise.resolve().then(() => fetchJobs());
  }, [fetchJobs]);

  // 2. MOVER TARJETA - optimista + persistencia real (Fase 6.5).
  // Pinta el movimiento al instante; si el backend falla, revierte (rollback).
  const moveJob = async (jobId: string, newStatus: ColumnStatus) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    if (!job.jobOfferId) {
      setActionError(
        "Esta tarjeta no tiene jobOfferId; no se puede guardar el cambio.",
      );
      return;
    }
    if (job.status === newStatus) return;

    const prevStatus = job.status;
    setActionError(null);

    // 1) OPTIMISTA: la tarjeta se mueve ya (la UI no espera a la red).
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)),
    );

    try {
      // 2) PERSISTE: columna del tablero -> estado del backend.
      await upsertApplication(job.jobOfferId, columnToBackendStatus(newStatus));
    } catch (e) {
      // 3) ROLLBACK: restauramos la columna anterior.
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: prevStatus } : j)),
      );
      setActionError(toMessage(e, "No se pudo mover la tarjeta."));
    }
  };

  // 3. ELIMINAR - optimista + persistencia real (Fase 6.5).
  const deleteJob = async (jobId: string) => {
    const index = jobs.findIndex((j) => j.id === jobId);
    if (index === -1) return;
    const snapshot = jobs[index];
    if (!snapshot.jobOfferId) {
      setActionError("Esta tarjeta no tiene jobOfferId; no se puede eliminar.");
      return;
    }

    setActionError(null);

    // 1) OPTIMISTA: desaparece ya del tablero.
    setJobs((prev) => prev.filter((j) => j.id !== jobId));

    try {
      // 2) PERSISTE
      await deleteApplication(snapshot.jobOfferId);
    } catch (e) {
      // 3) ROLLBACK: la devolvemos a su posición original.
      setJobs((prev) => {
        const next = [...prev];
        next.splice(Math.min(index, next.length), 0, snapshot);
        return next;
      });
      setActionError(toMessage(e, "No se pudo eliminar la tarjeta."));
    }
  };

  // 4. CREAR - POST manual real + refetch (Fase 6.5 + extensión 6.6).
  // El backend crea la oferta (isManual, con salario/technologies), el
  // result y la Application en TODO.
  const addJob = async (newJobData: Omit<JobApplication, "id" | "date">) => {
    const payload: ManualApplicationPayload = {
      company: newJobData.company,
      position: newJobData.position,
      originalUrl: newJobData.originalUrl,
      location: newJobData.location,
      notes: newJobData.notes,
      // Extensión 6.6: misma riqueza que las ofertas del motor.
      salaryString: newJobData.salary,
      technologies: newJobData.tags,
    };

    setActionError(null);
    try {
      const created = await createManualApplication(payload);

      // El POST manual siempre crea en Por Revisar (TODO). Si el usuario
      // eligió otra columna en el formulario, lo corregimos con un upsert.
      if (newJobData.status !== "por_revisar") {
        try {
          await upsertApplication(
            created.jobOfferId,
            columnToBackendStatus(newJobData.status),
          );
        } catch (e) {
          setActionError(
            toMessage(
              e,
              "Se creó la tarjeta, pero no se pudo mover a la columna elegida.",
            ),
          );
        }
      }

      // Refrescamos para materializar la tarjeta real (con su id de result
      // y su matchScore real: null en manuales -> sin puntuación inventada).
      await fetchJobs();
    } catch (e) {
      setActionError(toMessage(e, "No se pudo crear la postulación."));
    }
  };

  // 5. EDITAR - persistencia real vía PATCH de la oferta (Fase 6.6).
  // Solo ofertas manuales: las del motor son compartidas entre usuarios
  // (el formulario ya bloquea esos campos; aquí lo blindamos también).
  const updateJob = async (
    jobId: string,
    updatedFields: Partial<JobApplication>,
  ) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job || !job.jobOfferId) return;
    if (!job.isManual) return;

    const snapshot = job;
    setActionError(null);

    // 1) OPTIMISTA: aplicamos el cambio ya.
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, ...updatedFields } : j)),
    );

    try {
      // 2) PERSISTE: nombres del front -> campos del backend.
      // (Los campos undefined no viajan: JSON.stringify los descarta.)
      await updateManualOffer(job.jobOfferId, {
        title: updatedFields.position,
        company: updatedFields.company,
        salaryString: updatedFields.salary,
        city: updatedFields.location,
        description: updatedFields.notes,
        technologies: updatedFields.tags,
        originalUrl: updatedFields.originalUrl,
      });
    } catch (e) {
      // 3) ROLLBACK solo del contenido: el estado lo gestiona moveJob
      // (evitamos pisar un cambio de columna que sí se guardó).
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                company: snapshot.company,
                position: snapshot.position,
                salary: snapshot.salary,
                location: snapshot.location,
                notes: snapshot.notes,
                tags: snapshot.tags,
                originalUrl: snapshot.originalUrl,
              }
            : j,
        ),
      );
      setActionError(toMessage(e, "No se pudo guardar la edición."));
    }
  };

  return {
    jobs,
    isLoading,
    syncError,
    actionError,
    fetchJobs,
    moveJob,
    deleteJob,
    addJob,
    updateJob,
  };
}
