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
}

export default function CvViewer({
  cv,
  optimizedData,
  isLoadingOptimized = false,
  optimizedError = null,
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

  const hasClassicContact = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.portfolio,
  ].some((v) => v.trim().length > 0);
  const hasClassicSkills =
    skillsCat.languages.length +
      skillsCat.frameworks.length +
      skillsCat.databases.length +
      skillsCat.tools.length +
      skillsCat.practices.length >
    0;

  const optHeader = optimizedData?.header;
  const optDisplayName =
    (optHeader?.fullName?.trim() || cv.fullName?.startsWith("[") === false
      ? cv.fullName
      : "") ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Mi CV optimizado";
  const optHeadline = optHeader?.headline?.trim() || cv.targetRole;
  const optContactLine = [
    optHeader?.email || contact.email,
    optHeader?.phone || contact.phone,
    optHeader?.location || contact.location,
    optHeader?.linkedin || contact.linkedin,
    optHeader?.portfolio || contact.portfolio,
  ]
    .map((v) => (v || "").trim())
    .filter(Boolean)
    .join(" | ");
  const optSkills = optimizedData?.skills;
  const hasOptSkills =
    !!optSkills && Object.values(optSkills).some((a) => (a ?? []).length > 0);
  const contactLine = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.portfolio,
  ]
    .map((v) => v.trim())
    .filter(Boolean)
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
      if (hasOptSkills && optSkills) {
        text += `SKILLS\n`;
        if (optSkills.languages.length)
          text += `Languages: ${optSkills.languages.join(", ")}\n`;
        if (optSkills.frameworks.length)
          text += `Frameworks: ${optSkills.frameworks.join(", ")}\n`;
        if (optSkills.databases.length)
          text += `Databases: ${optSkills.databases.join(", ")}\n`;
        if (optSkills.technologiesTools.length)
          text += `Technologies / Tools: ${optSkills.technologiesTools.join(", ")}\n`;
        if (optSkills.practices.length)
          text += `Practices: ${optSkills.practices.join(", ")}\n`;
        text += `\n`;
      }
      text += `EXPERIENCE\n`;
      optimizedData.experiences.forEach((exp) => {
        const dates = [exp.startDate, exp.endDate].filter(Boolean).join(" – ");
        text += `${exp.company}${dates ? ` ${dates}` : ""}\n${exp.role}${exp.location ? ` ${exp.location}` : ""}\n`;
        (exp.bullets ?? []).forEach((b) => {
          text += `• ${b}\n`;
        });
        if (!(exp.bullets ?? []).length && exp.description)
          text += `${exp.description}\n`;
        text += `\n`;
      });
      (optimizedData.projects ?? []).forEach((p) => {
        text += `PROJECTS\n${p.name}${p.repoUrl ? ` ${p.repoUrl}` : ""}\n${p.description ?? ""}\n\n`;
      });
      (optimizedData.education ?? []).forEach((e) => {
        text += `EDUCATION\n${e.institution}${e.graduationYear ? ` ${e.graduationYear}` : ""}\n${e.degree}\n\n`;
      });
      if ((optimizedData.languages ?? []).length) {
        text += `LANGUAGES\n${(optimizedData.languages ?? []).map((l) => `${l.language}: ${l.level}`).join(" · ")}\n`;
      }
      return text.trim();
    }
    let text = `${displayName.toUpperCase()}\n${cv.targetRole}\n`;
    if (contactLine) text += `${contactLine}\n`;
    text += `\n`;
    if (hasClassicSkills) {
      text += `HABILIDADES\n`;
      if (skillsCat.languages.length)
        text += `Lenguajes: ${skillsCat.languages.join(", ")}\n`;
      if (skillsCat.frameworks.length)
        text += `Frameworks: ${skillsCat.frameworks.join(", ")}\n`;
      if (skillsCat.databases.length)
        text += `Bases de datos: ${skillsCat.databases.join(", ")}\n`;
      if (skillsCat.tools.length)
        text += `Tecnologías / Herramientas: ${skillsCat.tools.join(", ")}\n`;
      if (skillsCat.practices.length)
        text += `Prácticas: ${skillsCat.practices.join(", ")}\n`;
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
            {hasOptSkills && optSkills && (
              <section className="mb-3.5">
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Skills
                </h2>
                <div className="text-[11px] text-black space-y-0.5">
                  {optSkills.languages.length > 0 && (
                    <p>
                      <strong className="font-bold">Languages:</strong>{" "}
                      {optSkills.languages.join(", ")}
                    </p>
                  )}
                  {optSkills.frameworks.length > 0 && (
                    <p>
                      <strong className="font-bold">Frameworks:</strong>{" "}
                      {optSkills.frameworks.join(", ")}
                    </p>
                  )}
                  {optSkills.databases.length > 0 && (
                    <p>
                      <strong className="font-bold">Databases:</strong>{" "}
                      {optSkills.databases.join(", ")}
                    </p>
                  )}
                  {optSkills.technologiesTools.length > 0 && (
                    <p>
                      <strong className="font-bold">
                        Technologies / Tools:
                      </strong>{" "}
                      {optSkills.technologiesTools.join(", ")}
                    </p>
                  )}
                  {optSkills.practices.length > 0 && (
                    <p>
                      <strong className="font-bold">Practices:</strong>{" "}
                      {optSkills.practices.join(", ")}
                    </p>
                  )}
                </div>
              </section>
            )}
            <section className="mb-3.5">
              <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                Experience
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
                      {(exp.bullets && exp.bullets.length
                        ? exp.bullets
                        : exp.description
                          ? [exp.description]
                          : []
                      ).map((b, bi) => (
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
                  Projects
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
                  Education
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
                  Languages
                </h2>
                <div className="text-[11px] text-black">
                  <p>
                    {(optimizedData.languages ?? [])
                      .map((l) => `${l.language}: ${l.level}`)
                      .join(" · ")}
                  </p>
                </div>
              </section>
            )}
          </article>
          {(optimizedData.keywordsInjected.length > 0 ||
            optimizedData.keywordsSkipped.length > 0) && (
            <details className="w-[794px] max-w-full text-[11px] text-slate-400">
              <summary className="cursor-pointer">
                Debug QA (no va al PDF ni al copiar)
              </summary>
              <p>Matched: {optimizedData.skillsMatched.join(", ")}</p>
              <p>Injected: {optimizedData.keywordsInjected.join(", ")}</p>
              <p>Skipped: {optimizedData.keywordsSkipped.join(", ")}</p>
            </details>
          )}
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
            {hasClassicSkills && (
              <section className="mb-3.5">
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Habilidades
                </h2>
                <div className="text-[11px] text-black space-y-0.5">
                  {skillsCat.languages.length > 0 && (
                    <p>
                      <strong className="font-bold">Lenguajes:</strong>{" "}
                      {skillsCat.languages.join(", ")}
                    </p>
                  )}
                  {skillsCat.frameworks.length > 0 && (
                    <p>
                      <strong className="font-bold">Frameworks:</strong>{" "}
                      {skillsCat.frameworks.join(", ")}
                    </p>
                  )}
                  {skillsCat.databases.length > 0 && (
                    <p>
                      <strong className="font-bold">Bases de datos:</strong>{" "}
                      {skillsCat.databases.join(", ")}
                    </p>
                  )}
                  {skillsCat.tools.length > 0 && (
                    <p>
                      <strong className="font-bold">
                        Tecnologías / Herramientas:
                      </strong>{" "}
                      {skillsCat.tools.join(", ")}
                    </p>
                  )}
                  {skillsCat.practices.length > 0 && (
                    <p>
                      <strong className="font-bold">Prácticas:</strong>{" "}
                      {skillsCat.practices.join(", ")}
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
          </article>
        </div>
      )}
    </div>
  );
}
