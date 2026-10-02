// src/components/profile/ProjectsEditor.tsx
// Proyectos: recuadros con tecnologías; añadir, editar y eliminar.
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { CvProject } from "../../types/cv";

const EMPTY: CvProject = { name: "", technologies: [], repoUrl: "" };

const inputCls =
  "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500";

function Form({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: CvProject;
  setDraft: (d: CvProject) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="grid gap-2 mt-2 pt-2 border-t border-slate-800">
      <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Nombre del proyecto" className={inputCls} />
      <input
        value={draft.technologies.join(", ")}
        onChange={(e) => setDraft({ ...draft, technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
        placeholder="Tecnologías (separadas por comas)"
        className={inputCls}
      />
      <input value={draft.repoUrl ?? ""} onChange={(e) => setDraft({ ...draft, repoUrl: e.target.value })} placeholder="URL del repositorio (opcional)" className={inputCls} />
      <div className="flex gap-2">
        <button type="button" onClick={onSave} className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 cursor-pointer">Guardar</button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer">Cancelar</button>
      </div>
    </div>
  );
}

export default function ProjectsEditor({
  items,
  onChange,
}: {
  items: CvProject[];
  onChange: (items: CvProject[]) => void;
}) {
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<CvProject>(EMPTY);

  const save = () => {
    if (!draft.name.trim()) return;
    if (editing === "new") onChange([...items, draft]);
    else if (typeof editing === "number")
      onChange(items.map((it, i) => (i === editing ? draft : it)));
    setEditing(null);
  };

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
        Proyectos ({items.length})
      </h3>
      <div className="grid gap-2 mb-2">
        {items.map((proj, i) => (
          <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{proj.name || "Sin nombre"}</p>
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proj.technologies.map((t) => (
                      <span key={t} className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button type="button" onClick={() => { setDraft({ ...proj }); setEditing(i); }} title="Editar" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
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
          <Plus className="w-3.5 h-3.5" /> Añadir proyecto
        </button>
      )}
    </div>
  );
}
