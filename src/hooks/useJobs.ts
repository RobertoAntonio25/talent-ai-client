import { useState, useEffect, useCallback, useRef } from "react";
import type { JobApplication, ColumnStatus } from "../types/kanban";
import { getUserResults } from "../services/jobsService";
import { mapResultToJob } from "../adapters/jobsAdapter";

export function useJobs() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  // 6.5: evita doble fetch en StrictMode dev (no afecta a prod).
  const didFetch = useRef(false);

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
      const msg =
        e instanceof Error ? e.message : "Error al sincronizar ofertas.";
      setSyncError(msg);
      // FIX 6.2: no hacemos setJobs([]) aquí.
      // Conservamos el tablero previo (cache local) para que un cold-start
      // de Render o un 429 no borre lo que el usuario ya veía.
    } finally {
      setIsLoading(false);
    }
  }, []);

  // La carga inicial se dispara por evento, no por setState síncrono en efecto.
  // (fetchJobs se invoca desde el callback de suscripción: no hay cascada.)
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 0));
    const handle = idle(() => {
      void fetchJobs();
    });
    return () => {
      if (typeof handle === "number") window.clearTimeout(handle);
      else window.cancelIdleCallback?.(handle);
    };
  }, [fetchJobs]);

  // 2. MOVER TARJETA - solo local (no hay endpoint en el back aún)
  const moveJob = (jobId: string, newStatus: ColumnStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)),
    );
  };

  // 3. ELIMINAR - solo local
  const deleteJob = (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  // 4. CREAR - solo local
  const addJob = (newJobData: Omit<JobApplication, "id" | "date">) => {
    const tempId = `temp-${Date.now()}`;
    const formattedDate = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newJob: JobApplication = {
      ...newJobData,
      id: tempId,
      date: formattedDate,
      matchScore: newJobData.matchScore || Math.floor(Math.random() * 15) + 85,
    };

    setJobs((prev) => [newJob, ...prev]);
  };

  // 5. EDITAR - solo local
  const updateJob = (jobId: string, updatedFields: Partial<JobApplication>) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, ...updatedFields } : j)),
    );
  };

  return {
    jobs,
    isLoading,
    syncError,
    fetchJobs,
    moveJob,
    deleteJob,
    addJob,
    updateJob,
  };
}
