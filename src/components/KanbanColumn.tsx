import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Clock, Send, Users, Award } from "lucide-react";
import type { ColumnStatus } from "../types/kanban";

interface Props {
  id: ColumnStatus;
  title: string;
  count: number;
  children: ReactNode;
}

const COLUMN_CONFIG: Record<
  ColumnStatus,
  {
    icon: typeof Clock;
    color: string;
    dotColor: string;
    badgeBg: string;
    borderColor: string;
  }
> = {
  por_revisar: {
    icon: Clock,
    color: "text-amber-400",
    dotColor: "bg-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    borderColor: "hover:border-amber-500/30",
  },
  aplicado: {
    icon: Send,
    color: "text-blue-400",
    dotColor: "bg-blue-400",
    badgeBg: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    borderColor: "hover:border-blue-500/30",
  },
  entrevista: {
    icon: Users,
    color: "text-purple-400",
    dotColor: "bg-purple-400",
    badgeBg: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    borderColor: "hover:border-purple-500/30",
  },
  oferta: {
    icon: Award,
    color: "text-emerald-400",
    dotColor: "bg-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    borderColor: "hover:border-emerald-500/30",
  },
};

export default function KanbanColumn({ id, title, count, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const config = COLUMN_CONFIG[id] || COLUMN_CONFIG.por_revisar;
  const Icon = config.icon;

  return (
    <div className="flex flex-col w-full min-w-[290px] sm:w-[320px] shrink-0">
      {/* Cabecera de la columna */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${config.dotColor} shadow-sm shadow-current`}
          ></span>
          <Icon className={`w-4 h-4 ${config.color}`} />
          <h3 className="font-bold text-slate-200 text-xs sm:text-sm tracking-wide uppercase">
            {title}
          </h3>
        </div>

        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${config.badgeBg}`}
        >
          {count}
        </span>
      </div>

      {/* Zona de Caída (Droppable Container) */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-3 p-3 rounded-2xl min-h-[540px] transition-all duration-200 border
          ${
            isOver
              ? "bg-blue-950/40 border-blue-500/60 border-dashed ring-2 ring-blue-500/20"
              : "bg-slate-900/40 border-slate-800/80 backdrop-blur-xs"
          }
        `}
      >
        {children}
      </div>
    </div>
  );
}
