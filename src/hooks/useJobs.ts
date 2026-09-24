import { useState, useEffect, useCallback } from "react";
import type { JobApplication, ColumnStatus } from "../types/kanban";

const API_URL =
  import.meta.env.VIT_API_URL ||
  import.meta.env.VITE_API_URL ||
  "https://talent-ai-4j4j.onrender.com";

const INITIAL_MOCK_JOBS: JobApplication[] = [
  {
    id: "1",
    company: "Google",
    position: "Senior Frontend Developer",
    status: "por_revisar",
    date: "12 Oct 2026",
    location: "Remoto (España)",
    salary: "€65k - €78k",
    matchScore: 96,
    tags: ["React", "TypeScript", "Next.js"],
    notes: "Vacante encontrada por el agente IA en LinkedIn.",
  },
  {
    id: "2",
    company: "Spotify",
    position: "React Engineer (Web & Mobile)",
    status: "aplicado",
    date: "10 Oct 2026",
    location: "Híbrido (Madrid)",
    salary: "€55k - €65k",
    matchScore: 92,
    tags: ["React", "Redux", "Tailwind"],
    notes: "Postulado con CV optimizado versión 2.",
  },
  {
    id: "3",
    company: "Vercel",
    position: "Staff Frontend Architect",
    status: "entrevista",
    date: "08 Oct 2026",
    location: "100% Remoto",
    salary: "$90k - $110k",
    matchScore: 98,
    tags: ["Turbopack", "React 19", "Node.js"],
    notes: "Entrevista técnica programada para este viernes.",
  },
  {
    id: "4",
    company: "Microsoft",
    position: "Fullstack Node.js / React",
    status: "por_revisar",
    date: "15 Oct 2026",
    location: "Barcelona",
    salary: "€58k - €70k",
    matchScore: 89,
    tags: ["Azure", "PostgreSQL", "Prisma"],
    notes: "Pendiente de revisar requerimientos de inglés.",
  },
  {
    id: "5",
    company: "Stripe",
    position: "UI/UX Engineering Lead",
    status: "oferta",
    date: "03 Oct 2026",
    location: "Remoto (EU)",
    salary: "€85k + Equity",
    matchScore: 95,
    tags: ["Design Systems", "TypeScript", "Accessibility"],
    notes: "Oferta formal recibida, plazo de aceptación: 7 días.",
  },
];

export function useJobs() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Helper para obtener headers de autenticación si existe token
  const getHeaders = () => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  // 1. CARGA (Fetch manual para botón de recargar)
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setSyncError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout para free-tier cold starts

      const response = await fetch(`${API_URL}/api/jobs`, {
        headers: getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setJobs(data);
          return;
        } else if (data.jobs && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
          return;
        }
      }
      setJobs(INITIAL_MOCK_JOBS);
    } catch {
      console.info(
        "[Talent-AI] Backend en espera. Usando datos locales de demostración.",
      );
      setJobs(INITIAL_MOCK_JOBS);
    } finally {
      setTimeout(() => setIsLoading(false), 600);
    }
  }, []);

  // CARGA INICIAL AL MONTAR (Sin setState síncrono en el cuerpo del efecto)
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(`${API_URL}/api/jobs`, {
          headers: getHeaders(),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (active) {
            if (Array.isArray(data)) {
              setJobs(data);
            } else if (data.jobs && Array.isArray(data.jobs)) {
              setJobs(data.jobs);
            } else {
              setJobs(INITIAL_MOCK_JOBS);
            }
          }
          return;
        }
      } catch {
        console.info(
          "[Talent-AI] Backend en espera. Usando datos locales de demostración.",
        );
      }

      if (active) {
        setJobs(INITIAL_MOCK_JOBS);
      }
      setTimeout(() => {
        if (active) setIsLoading(false);
      }, 600);
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // 2. MOVER TARJETA (Optimistic Update con Rollback)
  const moveJob = async (jobId: string, newStatus: ColumnStatus) => {
    const previousJobs = [...jobs];

    // Optimistic update
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)),
    );

    try {
      const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok && response.status !== 404) {
        throw new Error("No se pudo actualizar el estado en el servidor.");
      }

      return true;
    } catch (error: unknown) {
      console.warn("[Talent-AI] Moviendo tarjeta en modo local/simulado.");
      // Si fue un fallo real que queremos alertar:
      if (error instanceof Error && error.message.includes("No se pudo")) {
        setJobs(previousJobs);
        setSyncError(error.message);
        setTimeout(() => setSyncError(null), 3500);
        return false;
      }
      return true;
    }
  };

  // 3. ELIMINAR POSTULACIÓN
  const deleteJob = async (jobId: string) => {
    const previousJobs = [...jobs];
    setJobs((prev) => prev.filter((j) => j.id !== jobId));

    try {
      const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok && response.status !== 404) {
        throw new Error("Error al eliminar la postulación en el servidor.");
      }
      return true;
    } catch (error: unknown) {
      console.warn("[Talent-AI] Eliminando tarjeta en modo local.");
      if (
        error instanceof Error &&
        error.message.includes("Error al eliminar")
      ) {
        setJobs(previousJobs);
        setSyncError(error.message);
        setTimeout(() => setSyncError(null), 3500);
        return false;
      }
      return true;
    }
  };

  // 4. CREAR NUEVA POSTULACIÓN
  const addJob = async (newJobData: Omit<JobApplication, "id" | "date">) => {
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
      matchScore: newJobData.matchScore || Math.floor(Math.random() * 15) + 85, // 85 - 99% match
    };

    setJobs((prev) => [newJob, ...prev]);

    try {
      const response = await fetch(`${API_URL}/api/jobs`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(newJob),
      });

      if (response.ok) {
        const serverJob = await response.json();
        if (serverJob && serverJob.id) {
          setJobs((prev) =>
            prev.map((j) => (j.id === tempId ? { ...j, id: serverJob.id } : j)),
          );
        }
      }
      return true;
    } catch {
      console.info("[Talent-AI] Nueva postulación guardada en estado local.");
      return true;
    }
  };

  // 5. EDITAR POSTULACIÓN EXISTENTE
  const updateJob = async (
    jobId: string,
    updatedFields: Partial<JobApplication>,
  ) => {
    const previousJobs = [...jobs];

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, ...updatedFields } : j)),
    );

    try {
      const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok && response.status !== 404) {
        throw new Error("Error al guardar cambios de la postulación.");
      }
      return true;
    } catch (error: unknown) {
      console.warn("[Talent-AI] Postulación actualizada en estado local.");
      if (
        error instanceof Error &&
        error.message.includes("Error al guardar")
      ) {
        setJobs(previousJobs);
        setSyncError(error.message);
        setTimeout(() => setSyncError(null), 3500);
        return false;
      }
      return true;
    }
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
