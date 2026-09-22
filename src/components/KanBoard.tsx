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

// Componentes y Tipos
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import type { JobApplication, ColumnStatus } from "../types/kanban";

// ==========================================
// 1. CONSTANTES Y DATOS DE PRUEBA (MOCKS)
// ==========================================
// Se declaran fuera del componente para que no se recreen en cada render de React.

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
    position: "Frontend Developer",
    status: "por_revisar",
    date: "12 Oct 2026",
  },
  {
    id: "2",
    company: "Spotify",
    position: "React Engineer",
    status: "aplicado",
    date: "10 Oct 2026",
  },
  {
    id: "3",
    company: "Vercel",
    position: "Senior Web Dev",
    status: "entrevista",
    date: "08 Oct 2026",
  },
  {
    id: "4",
    company: "Microsoft",
    position: "Fullstack Node.js",
    status: "por_revisar",
    date: "15 Oct 2026",
  },
];

// Simulación de una llamada al backend (Fetch PATCH)
const updateJobStatusInDB = async (jobId: string, newStatus: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% de éxito
      if (success) resolve("Guardado exitosamente");
      else reject(new Error("Error en el servidor al guardar el estado."));
    }, 500);
  });
};

// ==========================================
// 2. COMPONENTE PRINCIPAL
// ==========================================
export default function KanbanBoard() {
  // --- A. ESTADOS ---
  const [jobs, setJobs] = useState<JobApplication[]>(INITIAL_JOBS);
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // --- B. CONFIGURACIÓN DE SENSORES ---
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 }, // Previene drags accidentales al hacer clic normal
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 }, // Soporte para móviles (evita arrastrar al hacer scroll)
    }),
  );

  // --- C. MANEJADORES DE EVENTOS (HANDLERS) ---
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const job = jobs.find((j) => j.id === active.id);
    if (job) setActiveJob(job);
  };

  // ¡CORRECCIÓN!: Se añadió 'async' porque usamos 'await' adentro
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
      console.log(
        `✅ Backend sincronizado: Tarjeta ${jobId} movida a ${newStatus}`,
      );
    } catch (error: any) {
      // 4. ROLLBACK (Restaurar si falla)
      console.error("❌ Falló la sincronización:", error);
      setJobs(previousJobs);
      setSyncError(
        "Se perdió la conexión. La tarjeta volvió a su lugar original.",
      );

      setTimeout(() => setSyncError(null), 3000);
    }
  };

  // --- D. RENDERIZADO (UI) ---
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Contenedor principal del Kanban */}
      <div className="flex gap-6 overflow-x-auto pb-4 h-full scrollbar-thin">
        {COLUMNS.map((col) => {
          const jobsInColumn = jobs.filter((job) => job.status === col.id);

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
                <div className="text-xs text-slate-400 font-medium text-center py-4">
                  No hay postulaciones
                </div>
              )}
            </KanbanColumn>
          );
        })}
      </div>

      {/* ¡CORRECCIÓN!: Renderizado del Toast de Error */}
      {syncError && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium border border-red-500/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {syncError}
          </div>
        </div>
      )}

      {/* Capa flotante para la animación suave (Fantasma) */}
      <DragOverlay>
        {activeJob ? <KanbanCard job={activeJob} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
