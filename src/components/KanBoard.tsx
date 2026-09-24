import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AlertCircle, PlusCircle } from "lucide-react";

// Componentes y Tipos
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import type { JobApplication, ColumnStatus } from "../types/kanban";

// ==========================================
// 1. CONSTANTES Y DATOS DE PRUEBA (MOCKS)
// ==========================================

const COLUMNS: { id: ColumnStatus; title: string }[] = [
  { id: "por_revisar", title: "Por Revisar" },
  { id: "aplicado", title: "Aplicado" },
  { id: "entrevista", title: "Entrevistas" },
  { id: "oferta", title: "Ofertas" },
];

const INITIAL_JOBS: JobApplication[] = [
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
  },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Simulación de una llamada al backend (Fetch PATCH)
const updateJobStatusInDB = async (jobId: string, newStatus: string) => {
  try {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      // Si el backend aún no está levantado en local o no existe endpoint, simulamos éxito en demo
      return { success: true, simulated: true };
    }

    return response.json();
  } catch {
    // Si la conexión falla pero estamos en modo demo local
    console.info(
      `[Demo Mode] Estado de la tarjeta ${jobId} actualizado localmente a ${newStatus}`,
    );
    return { success: true, simulated: true };
  }
};

// ==========================================
// 2. COMPONENTE PRINCIPAL
// ==========================================
interface KanbanBoardProps {
  searchQuery?: string;
}

export default function KanbanBoard({ searchQuery = "" }: KanbanBoardProps) {
  // --- A. ESTADOS ---
  const [jobs, setJobs] = useState<JobApplication[]>(INITIAL_JOBS);
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // --- B. CONFIGURACIÓN DE SENSORES ---
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  // --- C. MANEJADORES DE EVENTOS (HANDLERS) ---
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const job = jobs.find((j) => j.id === active.id);
    if (job) setActiveJob(job);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Limpieza de estados temporales
    setActiveJob(null);
    setSyncError(null);

    // Cancelar si se suelta fuera de una zona válida
    if (!over) return;

    const jobId = active.id as string;
    const newStatus = over.id as ColumnStatus;

    // Verificar si realmente hubo un cambio de columna
    const jobToMove = jobs.find((j) => j.id === jobId);
    if (!jobToMove || jobToMove.status === newStatus) return;

    // 1. BACKUP (Por si falla el servidor)
    const previousJobs = [...jobs];

    // 2. OPTIMISTIC UPDATE (Actualización instantánea en UI)
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job,
      ),
    );

    // 3. LLAMADA AL BACKEND
    try {
      await updateJobStatusInDB(jobId, newStatus);
    } catch (error: unknown) {
      // 4. ROLLBACK (Restaurar si falla)
      setJobs(previousJobs);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Se perdió la conexión. La tarjeta volvió a su lugar original.";
      setSyncError(errorMessage);

      setTimeout(() => setSyncError(null), 3500);
    }
  };

  // Filtrado por búsqueda
  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      job.company.toLowerCase().includes(q) ||
      job.position.toLowerCase().includes(q) ||
      (job.tags && job.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  // --- D. RENDERIZADO (UI) ---
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Contenedor principal del Kanban con scroll horizontal suave */}
      <div className="flex gap-5 overflow-x-auto pb-6 pt-2 h-full scrollbar-thin">
        {COLUMNS.map((col) => {
          const jobsInColumn = filteredJobs.filter(
            (job) => job.status === col.id,
          );

          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              count={jobsInColumn.length}
            >
              {jobsInColumn.length > 0 ? (
                jobsInColumn.map((job) => <KanbanCard key={job.id} job={job} />)
              ) : (
                <div className="h-40 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-2">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    Sin postulaciones
                  </span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Arrastra una tarjeta aquí
                  </p>
                </div>
              )}
            </KanbanColumn>
          );
        })}
      </div>

      {/* Toast de Notificación / Error */}
      {syncError && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-medium border border-red-500/40 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{syncError}</span>
          </div>
        </div>
      )}

      {/* Capa flotante con elevación y rotación sutil al arrastrar */}
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeJob ? (
          <div className="rotate-2 scale-105 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500/60 rounded-2xl">
            <KanbanCard job={activeJob} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
