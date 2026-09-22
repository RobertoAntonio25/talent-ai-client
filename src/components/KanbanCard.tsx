// import { useDraggable } from "@dnd-kit/core";
// import { CSS } from "@dnd-kit/utilities";
import { Building2, Calendar, GripVertical } from "lucide-react";
import type { JobApplication } from "../types/kanban";

interface Props {
  job: JobApplication;
}

export default function KanbanCard({ job }: Props) {
  //   const { attributes, listeners, setNodeRef, transform, isDragging } =
  //     useDraggable({
  //       id: job.id,
  //       data: job,
  //     });

  //   //Convertimos las coordenadas de arrastre a CSS transform
  //   const style = {
  //     transform: CSS.Translate.toString(transform),
  //   };

  return (
    <div className="relative flex flex-col bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-200 group">
      {/*Icono de arrastre para UX intuitiva */}
      <div className="absolute top-4 right-3 text-slate-300 opacity-50 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical className="w-4 h-4" />
      </div>

      {/*Posicion y Empresa */}
      <h4 className="font-bold text-slate-800 text-sm mb-1 pr-6">
        {job.position}
      </h4>

      <div className="flex items-center text-xs text-slate-500 mb-2">
        <Building2 className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
        {job.company}
      </div>

      {/*Fecha (Separada por una linea sutil) */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          {job.date}
        </span>
      </div>
    </div>
  );
}
