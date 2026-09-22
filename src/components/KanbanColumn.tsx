import type { ReactNode } from "react";

interface Props {
  title: string;
  count: number;
  children: ReactNode;
}

export default function KanbanColumn({ title, count, children }: Props) {
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

      {/*Contenedor donde caeran las tarjetas */}
      <div className="flex-1 flex flex-col gap-3 p-3 rounded-2xl min-h-[500px] bg-slate-100/50">
        {children}
      </div>
    </div>
  );
}
