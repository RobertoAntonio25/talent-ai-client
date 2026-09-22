import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Building2, Calendar, GripVertical } from "lucide-react";
import type { JobApplication } from "../types/kanban";

interface Props {
  job: JobApplication;
}

export default function KanbanCard({ job }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: job.id,
      data: job,
    });

  //Convertimos las coordenadas de arrastre a CSS transform
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        relative flex flex-col bg-white p-4 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing
        ${
          isDragging
            ? "border-blue-500 shadow-xl shadow-blue-500/20 scale-105 z-50 opacity-90"
            : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
        }
      `}
    >
      {/*Icono de arrastre para UX intuitiva */}
      <div className="absolute top-4 right-3 text-slate-300">
        <GripVertical className="w-4 h-4" />
      </div>
    </div>
  );
}
