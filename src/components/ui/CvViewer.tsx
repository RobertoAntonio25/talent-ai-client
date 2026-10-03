import { useState, useRef } from "react";
import { Copy, CheckCheck, Download, Loader2, Sparkles } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import type { GeneratedCV } from "../../types/cv";
import { useAuth } from "../../context/AuthContext";
import type { OptimizedCv } from "../../services/aiService";

interface CvViewerProps {
  cv: GeneratedCV;
  optimizedData?: OptimizedCv | null;
  isLoadingOptimized?: boolean;
  optimizedError?: string | null;
  onRegenerate?: () => void;
}

interface SkillsShown {
  languages: string[];
  frameworks: string[];
  databases: string[];
  technologiesTools: string[];
  practices: string[];
}

// Categorizado determinista solo para MOSTRAR (no inventa skills, solo ordena
// las que ya existen). Se usa cuando la IA devolvió categorías vacías o el
// CV clásico solo trae lista plana.
function categorizeSkillsFallback(skills: string[]): SkillsShown {
  const out: SkillsShown = { languages: [], frameworks: [], databases: [], technologiesTools: [], practices: [] };
  for (const raw of skills) {
    const t = raw.trim();
    if (!t) continue;
    const low = t.toLowerCase();
    if (/^(java|javascript|typescript|python|sql|html|css|php|c\+\+|c#|go|rust|kotlin|swift|ruby|scala|r)$/.test(low)) out.languages.push(t);
    else if (/(react|angular|vue|svelte|spring|django|flask|express|nest|next\.?js|nuxt|flutter|\.net)/.test(low)) out.frameworks.push(t);
    else if (/(mysql|postgres|mongo|sqlite|oracle|redis|neo4j|maria|supabase|firebase|dynamo|cassandra|elastic)/.test(low)) out.databases.push(t);
    else if (/(agile|scrum|kanban|solid|tdd|bdd|clean code|code review|pair programming)/.test(low)) out.practices.push(t);
    else out.technologiesTools.push(t);
  }
  return out;
}

function skillsTotal(s: SkillsShown): number {
  return s.languages.length + s.frameworks.length + s.databases.length + s.technologiesTools.length + s.practices.length;
}

// Niveles del enum (BASIC…NATIVE) en español para el documento.
// Si llega un nivel libre (ej. "C1 Advanced"), se deja tal cual.
function formatLevel(level: string): string {
  const map: Record<string, string> = {
    NATIVE: "Nativo",
    ADVANCED: "Avanzado",
    INTERMEDIATE: "Intermedio",
    BASIC: "Básico",
  };
  return map[level.trim().toUpperCase()] ?? level;
}

export default function CvViewer({
  cv,
  optimizedData,
  isLoadingOptimized = false,
  optimizedError = null,
  onRegenerate,
}: CvViewerProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const cvRef = useRef<HTMLDivElement>(null);
  const optimizedRef = useRef<HTMLDivElement>(null);
  const activeExportRef = optimizedData ? optimizedRef : cvRef;
  const { user } = useAuth();

  const contact = cv.contact ?? {
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
  };
  const skillsCat = cv.skillsCategorized ?? {
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
    practices: [],
  };
  const classicExperience = cv.experience ?? [];
  const classicEducation = cv.education ?? [];
  const classicLanguages = cv.languages ?? [];

  const hasClassicContact = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.portfolio,
  ].some((v) => v.trim().length > 0);

  const optHeader = optimizedData?.header;
  const optDisplayName =
    (optHeader?.fullName?.trim() || cv.fullName?.startsWith("[") === false
      ? cv.fullName
      : "") ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Mi CV optimizado";
  const optHeadline = optHeader?.headline?.trim() || cv.targetRole;
  const isPlaceholder = (v: string) => v.trim().startsWith("[");
  const cleanContact = (v: string | undefined) => {
    const t = (v || "").trim();
    return t && !isPlaceholder(t) ? t : "";
  };  const optContactLine = [
    cleanContact(optHeader?.email) || cleanContact(contact.email),
    cleanContact(optHeader?.phone) || cleanContact(contact.phone),
    cleanContact(optHeader?.location) || cleanContact(contact.location),
    cleanContact(optHeader?.linkedin) || cleanContact(contact.linkedin),
    cleanContact(optHeader?.portfolio) || cleanContact(contact.portfolio),
  ].filter(Boolean).join(" | ");
  const optSkills = optimizedData?.skills;
  const optSkillsShown: SkillsShown =
    optSkills && skillsTotal(optSkills) > 0
      ? optSkills
      : categorizeSkillsFallback(optimizedData?.skillsMatched ?? []);
  const hasOptSkills = skillsTotal(optSkillsShown) > 0;
  const classicSkillsShown: SkillsShown =
    skillsTotal({ ...skillsCat, technologiesTools: skillsCat.tools }) > 0
      ? { ...skillsCat, technologiesTools: skillsCat.tools }
      : categorizeSkillsFallback(cv.skills ?? []);
  const hasClassicSkillsShown = skillsTotal(classicSkillsShown) > 0;
  const splitBullets = (exp: { bullets?: string[]; description?: string }): string[] => {
    const raw = exp.bullets && exp.bullets.length ? exp.bullets : exp.description ? [exp.description] : [];
    let out: string[] = [];
    for (const item of raw) {
      for (const part of String(item).split("•")) {
        const c = part.trim().replace(/^[-*\d]+[.)\s]+/, "").trim();
        if (c) out.push(c);
      }
    }
    // Cachés viejas con 1 bullet párrafo: se parten en frases para el visor.
    if (out.length <= 1 && out[0] && out[0].length > 300) {
      const parts = out[0].split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean).slice(0, 4);
      if (parts.length >= 2) out = parts;
    }
    return out.slice(0, 4);
  };
  const contactLine = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.portfolio,
  ]
    .map((v) => v.trim())
    .filter((v) => v && !isPlaceholder(v))
    .join(" | ");
  const displayName =
    cv.fullName && !cv.fullName.startsWith("[")
      ? cv.fullName
      : [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        "Mi CV optimizado";

  const generateCleanAtsText = () => {
    if (optimizedData) {
      let text = `${optDisplayName.toUpperCase()}\n${optHeadline}\n`;
      if (optContactLine) text += `${optContactLine}\n`;
      text += `\nRESUMEN PROFESIONAL\n${optimizedData.summary}\n\n`;
      if (hasOptSkills) {
        text += `HABILIDADES\n`;
        if (optSkillsShown.languages.length) text += `Lenguajes: ${optSkillsShown.languages.join(", ")}\n`;
        if (optSkillsShown.frameworks.length) text += `Frameworks: ${optSkillsShown.frameworks.join(", ")}\n`;
        if (optSkillsShown.databases.length) text += `Bases de datos: ${optSkillsShown.databases.join(", ")}\n`;
        if (optSkillsShown.technologiesTools.length) text += `Tecnologías / Herramientas: ${optSkillsShown.technologiesTools.join(", ")}\n`;
        if (optSkillsShown.practices.length) text += `Prácticas: ${optSkillsShown.practices.join(", ")}\n`;
        text += `\n`;
      }
      text += `EXPERIENCIA\n`;
      optimizedData.experiences.forEach((exp) => {
        const dates = [exp.startDate, exp.endDate].filter(Boolean).join(" – ");
        text += `${exp.company}${dates ? ` ${dates}` : ""}\n${exp.role}${exp.location ? ` ${exp.location}` : ""}\n`;
        splitBullets(exp).forEach((b) => {
          text += `• ${b}\n`;
        });
        text += `\n`;
      });
      (optimizedData.projects ?? []).forEach((p) => {
        text += `PROYECTOS\n${p.name}${p.repoUrl ? ` ${p.repoUrl}` : ""}\n${p.description ?? ""}\n\n`;
      });
      (optimizedData.education ?? []).forEach((e) => {
        text += `EDUCACIÓN\n${e.institution}${e.graduationYear ? ` ${e.graduationYear}` : ""}\n${e.degree}\n\n`;
      });
      if ((optimizedData.languages ?? []).length) {
        text += `IDIOMAS\n${(optimizedData.languages ?? []).map((l) => `${l.language}: ${formatLevel(l.level)}`).join(" · ")}\n`;
      }
      return text.trim();
    }
    let text = `${displayName.toUpperCase()}\n${cv.targetRole}\n`;
    if (contactLine) text += `${contactLine}\n`;
    text += `\n`;
    if (cv.summary?.trim()) text += `RESUMEN PROFESIONAL\n${cv.summary.trim()}\n\n`;
    if (hasClassicSkillsShown) {
      text += `HABILIDADES\n`;
      if (classicSkillsShown.languages.length)
        text += `Lenguajes: ${classicSkillsShown.languages.join(", ")}\n`;
      if (classicSkillsShown.frameworks.length)
        text += `Frameworks: ${classicSkillsShown.frameworks.join(", ")}\n`;
      if (classicSkillsShown.databases.length)
        text += `Bases de datos: ${classicSkillsShown.databases.join(", ")}\n`;
      if (classicSkillsShown.technologiesTools.length)
        text += `Tecnologías / Herramientas: ${classicSkillsShown.technologiesTools.join(", ")}\n`;
      if (classicSkillsShown.practices.length)
        text += `Prácticas: ${classicSkillsShown.practices.join(", ")}\n`;
      text += `\n`;
    }
    if (classicExperience.length) {
      text += `EXPERIENCIA\n`;
      classicExperience.forEach((exp) => {
        text += `${exp.company} | ${exp.period}\n${exp.role}\n`;
        exp.achievements.forEach((a) => {
          text += `• ${a}\n`;
        });
        text += `\n`;
      });
    }
    if (classicEducation.length) {
      text += `EDUCACIÓN\n`;
      classicEducation.forEach((edu) => {
        text += `${edu.institution} | ${edu.period}\n${edu.degree}\n`;
        if (edu.details) text += `${edu.details}\n`;
        text += `\n`;
      });
    }
    if (classicLanguages.length) {
      text += `IDIOMAS\n${classicLanguages.map((l) => `${l.language}: ${formatLevel(l.level)}`).join(" · ")}\n`;
    }
    return text.trim();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateCleanAtsText());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar texto ATS:", err);
    }
  };

  const handleDownloadPDF = async () => {
    const element = activeExportRef.current;
    if (!element) return;
    setIsGeneratingPdf(true);
    try {
      const dataUrl = await toPng(element, {
        pixelRatio: 2.5,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      pdf.addImage(
        dataUrl,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST",
      );
      const cleanFileName = optDisplayName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_");
      pdf.save(`${cleanFileName}_CV_ATS.pdf`);
    } catch (error) {
      console.error("Error generando el PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white">
            Formato ATS Compatible
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-purple-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3" />{" "}
            {optimizedData ? "CV optimizado" : "98% Match IA"}
          </span>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isLoadingOptimized}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-xl transition-all active:scale-95 border border-slate-700/80"
            >
              <span>{isLoadingOptimized ? "Generando…" : "↻ Regenerar con IA"}</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all active:scale-95 border border-slate-700/80"
          >
            {isCopied ? (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-aplika-lima-500 hover:bg-aplika-lima-400 text-aplika-night-950 text-xs font-semibold rounded-xl transition-all shadow-md shadow-aplika-lima-500/25 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF (A4)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isLoadingOptimized ? (
        <p className="text-xs text-purple-400">
          Generando CV optimizado con IA…
        </p>
      ) : (
        optimizedError && (
          <p className="text-xs text-red-400">{optimizedError}</p>
        )
      )}

      {!isLoadingOptimized && !optimizedError && optimizedData && (
        <div className="w-full flex flex-col items-center gap-3 pb-4">
          <article
            ref={optimizedRef}
            className="bg-white text-black font-sans leading-relaxed w-[794px] min-w-[794px] p-10 border border-slate-200 shadow-xl relative select-text"
            style={{ boxSizing: "border-box" }}
          >
            <header className="text-center pb-2 mb-3">
              <h1 className="text-2xl font-bold text-black tracking-tight uppercase">
                {optDisplayName}
              </h1>
              <p className="text-xs font-semibold text-black mt-0.5">
                {optHeadline}
              </p>
              {optContactLine && (
                <p className="text-[11px] text-black mt-1 leading-normal">
                  {optContactLine}
                </p>
              )}
            </header>
            <section className="mb-3.5">
              <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                Resumen profesional
              </h2>
              <p className="text-[11px] text-black leading-relaxed whitespace-pre-line">
                {optimizedData.summary}
              </p>
            </section>
            {hasOptSkills && (
              <section className="mb-3.5">
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Habilidades
                </h2>
                <div className="text-[11px] text-black space-y-0.5">
                  {optSkillsShown.languages.length > 0 && (
                    <p>
                      <strong className="font-bold">Lenguajes:</strong>{" "}
                      {optSkillsShown.languages.join(", ")}
                    </p>
                  )}
                  {optSkillsShown.frameworks.length > 0 && (
                    <p>
                      <strong className="font-bold">Frameworks:</strong>{" "}
                      {optSkillsShown.frameworks.join(", ")}
                    </p>
                  )}
                  {optSkillsShown.databases.length > 0 && (
                    <p>
                      <strong className="font-bold">Bases de datos:</strong>{" "}
                      {optSkillsShown.databases.join(", ")}
                    </p>
                  )}
                  {optSkillsShown.technologiesTools.length > 0 && (
                    <p>
                      <strong className="font-bold">
                        Tecnologías / Herramientas:
                      </strong>{" "}
                      {optSkillsShown.technologiesTools.join(", ")}
                    </p>
                  )}
                  {optSkillsShown.practices.length > 0 && (
                    <p>
                      <strong className="font-bold">Prácticas:</strong>{" "}
                      {optSkillsShown.practices.join(", ")}
                    </p>
                  )}
                </div>
              </section>
            )}
            <section className="mb-3.5">
              <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                Experiencia
              </h2>
              <div className="space-y-3">
                {optimizedData.experiences.map((exp, index) => (
                  <div key={`${exp.role}-${exp.company}-${index}`}>
                    <div className="flex justify-between items-baseline text-[11px]">
                      <span className="font-bold text-black">
                        {exp.company}
                      </span>
                      <span className="text-black font-medium">
                        {[exp.startDate, exp.endDate]
                          .filter(Boolean)
                          .join(" – ")}
                      </span>
                    </div>
                    <div className="text-[11px] italic text-black mb-1">
                      {exp.role}
                      {exp.location ? ` · ${exp.location}` : ""}
                    </div>
                    <ul className="list-disc list-outside ml-4 text-[11px] text-black space-y-1">
                      {splitBullets(exp).map((b, bi) => (
                        <li key={bi} className="leading-snug">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
            {(optimizedData.projects ?? []).length > 0 && (
              <section className="mb-3.5">
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Proyectos
                </h2>
                <div className="space-y-2 text-[11px] text-black">
                  {(optimizedData.projects ?? []).map((p, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold">{p.name}</span>
                        {p.repoUrl && (
                          <span className="font-medium">{p.repoUrl}</span>
                        )}
                      </div>
                      {p.description && (
                        <p className="leading-snug">
                          {p.description}
                          {p.technologies.length
                            ? ` Built with ${p.technologies.join(", ")}.`
                            : ""}
                        </p>
                      )}
                      {!p.description && p.technologies.length > 0 && (
                        <p className="leading-snug">
                          Built with {p.technologies.join(", ")}.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {(optimizedData.education ?? []).length > 0 && (
              <section className="mb-3.5">
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Educación
                </h2>
                <div className="space-y-2 text-[11px] text-black">
                  {(optimizedData.education ?? []).map((edu, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold">{edu.institution}</span>
                        <span className="font-medium">
                          {edu.graduationYear ?? ""}
                        </span>
                      </div>
                      <p className="leading-snug">{edu.degree}</p>
                      {edu.details && (
                        <p className="text-[10px] text-black leading-snug mt-0.5">
                          {edu.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {(optimizedData.languages ?? []).length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Idiomas
                </h2>
                <div className="text-[11px] text-black">
                  <p>
                    {(optimizedData.languages ?? [])
                      .map((l) => `${l.language}: ${formatLevel(l.level)}`)
                      .join(" · ")}
                  </p>
                </div>
              </section>
            )}
          </article>
        </div>
      )}

      {!isLoadingOptimized && !optimizedError && !optimizedData && (
        <div className="w-full flex justify-center overflow-x-auto pb-4">
          <article
            ref={cvRef}
            className="bg-white text-black font-sans leading-relaxed w-[794px] min-w-[794px] p-10 border border-slate-200 shadow-xl relative select-text"
            style={{ boxSizing: "border-box" }}
          >
            <header className="text-center pb-2 mb-3">
              <h1 className="text-2xl font-bold text-black tracking-tight uppercase">
                {displayName}
              </h1>
              <p className="text-xs font-semibold text-black mt-0.5">
                {cv.targetRole}
              </p>
              {hasClassicContact && (
                <p className="text-[11px] text-black mt-1 leading-normal">
                  {contactLine}
                </p>
              )}
            </header>
            {cv.summary?.trim() && (
              <section className="mb-3.5">
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Resumen profesional
                </h2>
                <p className="text-[11px] text-black leading-relaxed whitespace-pre-line">
                  {cv.summary}
                </p>
              </section>
            )}
            {hasClassicSkillsShown && (
              <section className="mb-3.5">
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Habilidades
                </h2>
                <div className="text-[11px] text-black space-y-0.5">
                  {classicSkillsShown.languages.length > 0 && (
                    <p>
                      <strong className="font-bold">Lenguajes:</strong>{" "}
                      {classicSkillsShown.languages.join(", ")}
                    </p>
                  )}
                  {classicSkillsShown.frameworks.length > 0 && (
                    <p>
                      <strong className="font-bold">Frameworks:</strong>{" "}
                      {classicSkillsShown.frameworks.join(", ")}
                    </p>
                  )}
                  {classicSkillsShown.databases.length > 0 && (
                    <p>
                      <strong className="font-bold">Bases de datos:</strong>{" "}
                      {classicSkillsShown.databases.join(", ")}
                    </p>
                  )}
                  {classicSkillsShown.technologiesTools.length > 0 && (
                    <p>
                      <strong className="font-bold">
                        Tecnologías / Herramientas:
                      </strong>{" "}
                      {classicSkillsShown.technologiesTools.join(", ")}
                    </p>
                  )}
                  {classicSkillsShown.practices.length > 0 && (
                    <p>
                      <strong className="font-bold">Prácticas:</strong>{" "}
                      {classicSkillsShown.practices.join(", ")}
                    </p>
                  )}
                </div>
              </section>
            )}
            {classicExperience.length > 0 && (
              <section className="mb-3.5">
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Experiencia
                </h2>
                <div className="space-y-3">
                  {classicExperience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline text-[11px]">
                        <span className="font-bold text-black">
                          {exp.company}
                        </span>
                        <span className="text-black font-medium">
                          {exp.period}
                        </span>
                      </div>
                      <div className="text-[11px] italic text-black mb-1">
                        {exp.role}
                      </div>
                      <ul className="list-disc list-outside ml-4 text-[11px] text-black space-y-1">
                        {exp.achievements.map((a, i) => (
                          <li key={i} className="leading-snug">
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {classicEducation.length > 0 && (
              <section className="mb-3.5">
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Educación
                </h2>
                <div className="space-y-2 text-[11px] text-black">
                  {classicEducation.map((edu, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold">{edu.institution}</span>
                        <span className="font-medium">{edu.period}</span>
                      </div>
                      <p className="leading-snug">{edu.degree}</p>
                      {edu.details && (
                        <p className="text-[10px] text-black leading-snug mt-0.5">
                          {edu.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {classicLanguages.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Idiomas
                </h2>
                <div className="text-[11px] text-black">
                  {classicLanguages.map((lang, idx) => (
                    <p key={idx}>
                      <strong className="font-bold">{lang.language}:</strong>{" "}
                      {formatLevel(lang.level)}
                    </p>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      )}
    </div>
  );
}
