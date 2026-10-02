// src/components/profile/ExperienceEditor.tsx
// Experiencia: recuadros con fecha; añadir, editar y eliminar.
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { JobExperience } from "../../types/cv";

const EMPTY: JobExperience = { id: "", role: "", company: "", period: "", achievements: [] };

const inputCls =
  "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500";

function Form({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: JobExperience;
  setDraft: (d: JobExperience) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="grid gap-2 mt-2 pt-2 border-t border-slate-800">
      <input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Puesto" className={inputCls} />
      <input value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} placeholder="Empresa" className={inputCls} />
      <input value={draft.period} onChange={(e) => setDraft({ ...draft, period: e.target.value })} placeholder="Fecha (p. ej. ene 2022 – actualidad)" className={inputCls} />
      <textarea
        value={draft.achievements.join("\n")}
        onChange={(e) => setDraft({ ...draft, achievements: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
        placeholder="Logros (uno por línea)"
        rows={2}
        className={inputCls}
      />
      <div className="flex gap-2">
        <button type="button" onClick={onSave} className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 cursor-pointer">Guardar</button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer">Cancelar</button>
      </div>
    </div>
  );
}

export default function ExperienceEditor({
  items,
  onChange,
}: {
  items: JobExperience[];
  onChange: (items: JobExperience[]) => void;
}) {
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<JobExperience>(EMPTY);

  const save = () => {
    if (!draft.role.trim() && !draft.company.trim()) return;
    if (editing === "new")
      onChange([...items, { ...draft, id: `manual-${Date.now()}` }]);
    else if (typeof editing === "number")
      onChange(items.map((it, i) => (i === editing ? draft : it)));
    setEditing(null);
  };

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
        Experiencia ({items.length})
      </h3>
      <div className="grid gap-2 mb-2">
        {items.map((exp, i) => (
          <div key={exp.id || i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{exp.role || "Sin puesto"}</p>
                <p className="text-[11px] text-slate-400 truncate">{exp.company || "Sin empresa"}</p>
                {exp.period && <p className="text-[11px] text-aplika-lima-400 font-semibold mt-0.5">{exp.period}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button type="button" onClick={() => { setDraft({ ...exp }); setEditing(i); }} title="Editar" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} title="Eliminar" className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {editing === i && <Form draft={draft} setDraft={setDraft} onSave={save} onCancel={() => setEditing(null)} />}
          </div>
        ))}
      </div>
      {editing === "new" ? (
        <div className="bg-slate-950/60 border border-aplika-lima-500/30 rounded-xl p-3 mb-2">
          <Form draft={draft} setDraft={setDraft} onSave={save} onCancel={() => setEditing(null)} />
        </div>
      ) : (
        <button type="button" onClick={() => { setDraft(EMPTY); setEditing("new"); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Añadir experiencia
        </button>
      )}
    </div>
  );
}
