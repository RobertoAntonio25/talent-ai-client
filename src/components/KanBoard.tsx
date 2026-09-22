// KanbanBoard.tsx
import { useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import type { JobApplication, ColumnStatus } from "../types/kanban";

// Datos de prueba para maquetar
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

const COLUMNS: { id: ColumnStatus; title: string }[] = [
  { id: "por_revisar", title: "Por Revisar" },
  { id: "aplicado", title: "Aplicado" },
  { id: "entrevista", title: "Entrevistas" },
  { id: "oferta", title: "Ofertas" },
];

export default function KanbanBoard() {
  // Inicializamos el estado con nuestros datos de prueba
  const [jobs, setJobs] = useState<JobApplication[]>(INITIAL_JOBS);

  //Esta funcion se dispara exactamente cuando el usuario suelta el click
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    //Si solto la tarjeta fuera de cualquier columna valida, cancelamos if(!over) return;
    if (!over) return;

    const jobId = active.id as string;
    const newStatus = over.id as ColumnStatus;

    //Actualizamos el estado inmutablemente
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job,
      ),
    );
  };

  return (
    //Envolvemos el tablero y le pasamos nuestra funcion manejadora
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4 h-full scrollbar-thin">
        {COLUMNS.map((col) => {
          // 1. Filtramos los trabajos que pertenecen a esta columna
          const jobsInColumn = jobs.filter((job) => job.status === col.id);

          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              count={jobsInColumn.length}
            >
              {/* 2. Mapeamos las tarjetas reales en lugar del recuadro punteado */}
              {jobsInColumn.length > 0 ? (
                jobsInColumn.map((job) => <KanbanCard key={job.id} job={job} />)
              ) : (
                // 3. Estado vacío (Empty State) para columnas sin tarjetas
                <div className="text-xs text-slate-400 font-medium text-center py-4">
                  No hay postulaciones
                </div>
              )}
            </KanbanColumn>
          );
        })}
      </div>
    </DndContext>
  );
}
