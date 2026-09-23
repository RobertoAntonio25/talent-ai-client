import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { ColumnStatus } from "../types/kanban";

interface Props {
  id: ColumnStatus;
  title: string;
  count: number;
  children: ReactNode;
}

export default function KanbanColumn({ id, title, count, children }: Props) {
  //1. Inicializamos la zona de caida
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });
  return (
    <div className="flex fle-col w-full min-w-[280px] sm:w-[320px] shrink-0">
      {/*Cabecera de la columna*/}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
          {title}
        </h3>
        <span className="bg-slate-200 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>

      {/*Conectamos la referencia y usamos 'isOver' para cambiar el color si una tarjeta esta sobrevolando  */}

      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-3 p-3 rounded-2xl min-h-[500px] transition-colors duration-200 border-2
          ${isOver ? "bg-blue-50/80 border-blue-300 border-dashed" : "bg-slate-100/50 border-transparent"}
        `}
      >
        {children}
      </div>
    </div>
  );
}
