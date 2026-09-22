// KanbanCard.tsx
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Building2, Calendar, GripVertical } from "lucide-react";
import type { JobApplication } from "../types/kanban";

interface Props {
  job: JobApplication;
}

export default function KanbanCard({ job }: Props) {
  // 1. Inicializamos el hook con un ID único obligatorio
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: job.id,
      data: job, // Guardamos los datos completos por si los necesitamos al soltar
    });

  // 2. Convertimos el movimiento del ratón en una transformación CSS
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      // 3. Conectamos los refs y listeners de dnd-kit al contenedor
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative flex flex-col bg-white p-4 rounded-xl border transition-all duration-200 group cursor-grab active:cursor-grabbing
        ${isDragging ? "opacity-30 border-2 border-dashed border-blue-400 shadow-none z-0" : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md z-10"}
      `}
    >
      <div className="absolute top-4 right-3 text-slate-300 opacity-50 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4" />
      </div>

      <h4 className="font-bold text-slate-800 text-sm mb-1 pr-6">
        {job.position}
      </h4>

      <div className="flex items-center text-xs text-slate-500 mb-2">
        <Building2 className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
        {job.company}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          {job.date}
        </span>
      </div>
    </div>
  );
}
