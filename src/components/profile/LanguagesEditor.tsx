// src/components/profile/LanguagesEditor.tsx
// Idiomas: recuadros con nivel; añadir, editar y eliminar.
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { LanguageItem } from "../../types/cv";

const EMPTY: LanguageItem = { language: "", level: "" };

const inputCls =
  "mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500";

function Form({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: LanguageItem;
  setDraft: (d: LanguageItem) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="grid gap-2 mt-2 pt-2 border-t border-slate-800">
      <input value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value })} placeholder="Idioma" className={inputCls} />
      <input value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })} placeholder="Nivel (p. ej. B2, nativo…)" className={inputCls} />
      <div className="flex gap-2">
        <button type="button" onClick={onSave} className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 cursor-pointer">Guardar</button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer">Cancelar</button>
      </div>
    </div>
  );
}

export default function LanguagesEditor({
  items,
  onChange,
}: {
  items: LanguageItem[];
  onChange: (items: LanguageItem[]) => void;
}) {
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<LanguageItem>(EMPTY);

  const save = () => {
    if (!draft.language.trim()) return;
    if (editing === "new") onChange([...items, draft]);
    else if (typeof editing === "number")
      onChange(items.map((it, i) => (i === editing ? draft : it)));
    setEditing(null);
  };

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
        Idiomas ({items.length})
      </h3>
      <div className="grid gap-2 mb-2">
        {items.map((lang, i) => (
          <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{lang.language || "Sin idioma"}</p>
                {lang.level && <p className="text-[11px] text-aplika-lima-400 font-semibold mt-0.5">{lang.level}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button type="button" onClick={() => { setDraft({ ...lang }); setEditing(i); }} title="Editar" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
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
          <Plus className="w-3.5 h-3.5" /> Añadir idioma
        </button>
      )}
    </div>
  );
}
