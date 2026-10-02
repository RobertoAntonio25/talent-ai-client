// src/components/profile/EducationEditor.tsx
// Estudios: cada uno en su recuadro con fecha; añadir, editar y eliminar.
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { EducationItem } from "../../types/cv";

const EMPTY: EducationItem = { institution: "", degree: "", period: "", details: "" };

const inputCls =
  "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500";

export default function EducationEditor({
  items,
  onChange,
}: {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
}) {
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<EducationItem>(EMPTY);

  const openNew = () => {
    setDraft(EMPTY);
    setEditing("new");
  };
  const openEdit = (index: number) => {
    setDraft({ ...items[index] });
    setEditing(index);
  };
  const save = () => {
    if (!draft.institution.trim() && !draft.degree.trim()) return;
    if (editing === "new") onChange([...items, draft]);
    else if (typeof editing === "number")
      onChange(items.map((it, i) => (i === editing ? draft : it)));
    setEditing(null);
  };

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
        Estudios ({items.length})
      </h3>
      <div className="grid gap-2 mb-2">
        {items.map((edu, i) => (
          <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{edu.degree || "Sin título"}</p>
                <p className="text-[11px] text-slate-400 truncate">{edu.institution || "Sin institución"}</p>
                {edu.period && <p className="text-[11px] text-aplika-lima-400 font-semibold mt-0.5">{edu.period}</p>}
                {edu.details && <p className="text-[11px] text-slate-500 mt-1">{edu.details}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button type="button" onClick={() => openEdit(i)} title="Editar" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} title="Eliminar" className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {editing === i && (
              <div className="grid gap-2 mt-2 pt-2 border-t border-slate-800">
                <input value={draft.degree} onChange={(e) => setDraft({ ...draft, degree: e.target.value })} placeholder="Título" className={inputCls} />
                <input value={draft.institution} onChange={(e) => setDraft({ ...draft, institution: e.target.value })} placeholder="Institución" className={inputCls} />
                <input value={draft.period} onChange={(e) => setDraft({ ...draft, period: e.target.value })} placeholder="Fecha (p. ej. 2020 – 2024)" className={inputCls} />
                <div className="flex gap-2">
                  <button type="button" onClick={save} className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 cursor-pointer">Guardar</button>
                  <button type="button" onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {editing === "new" ? (
        <div className="grid gap-2 mb-2 bg-slate-950/60 border border-aplika-lima-500/30 rounded-xl p-3">
          <input value={draft.degree} onChange={(e) => setDraft({ ...draft, degree: e.target.value })} placeholder="Título" className={inputCls} />
          <input value={draft.institution} onChange={(e) => setDraft({ ...draft, institution: e.target.value })} placeholder="Institución" className={inputCls} />
          <input value={draft.period} onChange={(e) => setDraft({ ...draft, period: e.target.value })} placeholder="Fecha (p. ej. 2020 – 2024)" className={inputCls} />
          <div className="flex gap-2">
            <button type="button" onClick={save} className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 cursor-pointer">Guardar</button>
            <button type="button" onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer">Cancelar</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 shadow-lg shadow-aplika-lima-500/20 transition-all active:scale-95 cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Añadir estudios
        </button>
      )}
    </div>
  );
}
