import { useState, useEffect, useCallback } from "react";
import type { JobApplication, ColumnStatus } from "../types/kanban";
import { getUserResults } from "../services/jobsService";
import { mapResultToJob } from "../adapters/jobsAdapter";

export function useJobs() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchJobs();
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
