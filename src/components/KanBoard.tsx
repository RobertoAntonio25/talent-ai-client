import { useState } from "react";
import KanbanColumn from "./KanbanColumn";
import type { JobApplication, ColumnStatus } from "../types/kanban";

//Nuestras 4 columnas oficiales

const COLUMNS: { id: ColumnStatus; title: string }[] = [
  { id: "por_revisar", title: "Por Revisar" },
  { id: "aplicado", title: "Aplicado" },
  { id: "entrevista", title: "Entrevistas" },
  { id: "oferta", title: "Ofertas" },
];

export default function KanbanBoard() {
  //Estado que pronto llenaremos con tarjetas reales
  const [jobs, setJobs] = useState<JobApplication[]>([]);

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-full scrollbar-thin">
      {COLUMNS.map((col) => {
        //Calculamos cuantos trabajos hay en esta columna
        const jobsInColumn = jobs.filter((job) => job.status === col.id);
        return (
          <KanbanColumn
            key={col.id}
            title={col.title}
            count={jobsInColumn.length}
          >
            {/* Marcador temporal para ver donde iran las tarjetas */}
            <div className="text-sm text-slate-400 p-2 border-2 border*dashed border-slate-300 rounded-lg text-center">
              Espacio para tarjetas
            </div>
          </KanbanColumn>
        );
      })}
    </div>
  );
}
