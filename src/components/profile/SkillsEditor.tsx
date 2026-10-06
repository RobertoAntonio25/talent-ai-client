// src/components/profile/SkillsEditor.tsx
// Habilidades como botones: añadir con el input, eliminar con la X al pasar el cursor.
import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function SkillsEditor({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const value = draft.trim();
    if (!value || skills.includes(value)) return;
    onChange([...skills, value]);
    setDraft("");
  };

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
        Habilidades ({skills.length})
      </h3>
      {skills.length === 0 && (
        <p className="text-xs text-slate-500 mb-2">Sin habilidades todavía.</p>
      )}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {skills.map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => onChange(skills.filter((s) => s !== skill))}
            title={`Eliminar ${skill}`}
            aria-label={`Eliminar ${skill}`}
            className="group inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-semibold bg-aplika-lima-500/10 text-aplika-lima-300 border border-aplika-lima-500/30 hover:border-red-500/50 transition-colors cursor-pointer"
          >
            {skill}
            <span className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full inline-flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-red-600 transition-all">
              <X className="w-3 h-3" />
            </span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder="Añadir habilidad…"
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-aplika-lima-500/40 focus:border-aplika-lima-500"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-aplika-night-950 bg-aplika-lima-500 hover:bg-aplika-lima-400 disabled:opacity-40 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Añadir
        </button>
      </div>
    </div>
  );
}
