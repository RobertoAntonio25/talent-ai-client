// src/components/ui/CvViewer.tsx
import { useState, useRef } from "react";
import { Copy, CheckCheck, Download, Loader2, Sparkles } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import type { GeneratedCV } from "../../types/cv";
import { useAuth } from "../../context/AuthContext";
import type {
  OptimizedCv,
  OptimizedExperience,
} from "../../services/aiService";

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

  const education = cv.education ?? [];

  const languages = cv.languages ?? [];
  const classicExperience = cv.experience ?? [];

  // Secciones del modo clásico con datos. Se calculan una vez para que
  // el render, el texto ATS y el PDF usen exactamente el mismo criterio.
  const hasClassicContact = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.portfolio,
  ].some((value) => value.trim().length > 0);
  const hasClassicSkills =
    skillsCat.languages.length +
      skillsCat.frameworks.length +
      skillsCat.databases.length +
      skillsCat.tools.length +
      skillsCat.practices.length >
    0;
  const hasClassicExperience = classicExperience.length > 0;
  const hasClassicEducation = education.length > 0;
  const hasClassicLanguages = languages.length > 0;

  const { user } = useAuth();

  const displayName =
    cv.fullName && !cv.fullName.startsWith("[")
      ? cv.fullName
      : [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        "Mi CV optimizado";

  const contactLine = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.portfolio,
  ]
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .join(" | ");

  // === Datos del CV optimizado (contrato v2) ==============================
  const optHeader = optimizedData?.header;
  const optName = optHeader?.fullName || displayName;
  const optHeadline = optHeader?.headline || cv.targetRole;
  const optContactLine = optHeader
    ? [
        optHeader.email,
        optHeader.phone,
        optHeader.location,
        optHeader.linkedin,
        optHeader.portfolio,
      ]
        .filter((v): v is string => Boolean(v && v.trim()))
        .map((v) => v.trim())
        .join(" | ")
    : contactLine;

  const optSkills = optimizedData?.skills;
  const skillCategories: Array<{ label: string; values: string[] }> = optSkills
    ? [
        { label: "Lenguajes", values: optSkills.languages },
        { label: "Frameworks", values: optSkills.frameworks },
        { label: "Bases de datos", values: optSkills.databases },
        {
          label: "Tecnologías / Herramientas",
          values: optSkills.technologiesTools,
        },
        { label: "Prácticas", values: optSkills.practices },
      ].filter((cat) => cat.values.length > 0)
    : [];

  const optBullets = (exp: OptimizedExperience): string[] =>
    exp.bullets?.length > 0
      ? exp.bullets
      : exp.description
        ? [exp.description]
        : [];

  const periodOf = (exp: OptimizedExperience): string => {
    if (exp.period) return exp.period;
    if (exp.startDate) return `${exp.startDate} – ${exp.endDate ?? "Presente"}`;
    return exp.endDate ?? "";
  };

  const generateCleanAtsText = () => {
    if (optimizedData) {
      let text = `${optName.toUpperCase()}\n`;
      text += `${optHeadline}\n`;
      if (optContactLine) text += `${optContactLine}\n`;
      text += `\nRESUMEN\n${optimizedData.summary}\n\n`;

      if (skillCategories.length > 0) {
        text += `HABILIDADES\n`;
        skillCategories.forEach((cat) => {
          text += `${cat.label}: ${cat.values.join(", ")}\n`;
        });
        text += `\n`;
      }

      if (optimizedData.experiences.length > 0) {
        text += `EXPERIENCIA\n`;
        optimizedData.experiences.forEach((exp) => {
          text += `${exp.company} | ${periodOf(exp)}\n`;
          text += `${exp.role}${exp.location ? ` · ${exp.location}` : ""}\n`;
          optBullets(exp).forEach((bullet) => {
            text += `• ${bullet}\n`;
          });
          text += `\n`;
        });
      }

      if (optimizedData.projects && optimizedData.projects.length > 0) {
        text += `PROYECTOS\n`;
        optimizedData.projects.forEach((proj) => {
          text += `${proj.name}${proj.repoUrl ? ` | ${proj.repoUrl}` : ""}\n`;
          if (proj.technologies && proj.technologies.length > 0) {
            text += `${proj.technologies.join(", ")}\n`;
          }
          if (proj.description) text += `${proj.description}\n`;
          text += `\n`;
        });
      }

      if (optimizedData.education && optimizedData.education.length > 0) {
        text += `EDUCACIÓN\n`;
        optimizedData.education.forEach((edu) => {
          text += `${edu.institution}${edu.period ? ` | ${edu.period}` : ""}\n`;
          text += `${edu.degree}\n`;
          if (edu.details) text += `${edu.details}\n`;
          text += `\n`;
        });
      }

      if (optimizedData.languages && optimizedData.languages.length > 0) {
        text += `IDIOMAS\n`;
        optimizedData.languages.forEach((lang) => {
          text += `${lang.language}: ${lang.level}\n`;
        });
      }

      return text.trim();
    }

    let text = `${displayName.toUpperCase()}\n`;
    text += `${cv.targetRole}\n`;
    if (contactLine) text += `${contactLine}\n`;
    text += `\n`;

    if (hasClassicSkills) {
      text += `HABILIDADES\n`;
      if (skillsCat.languages.length > 0) {
        text += `Lenguajes: ${skillsCat.languages.join(", ")}\n`;
      }
      if (skillsCat.frameworks.length > 0) {
        text += `Frameworks: ${skillsCat.frameworks.join(", ")}\n`;
      }
      if (skillsCat.databases.length > 0) {
        text += `Bases de datos: ${skillsCat.databases.join(", ")}\n`;
      }
      if (skillsCat.tools.length > 0) {
        text += `Tecnologías / Herramientas: ${skillsCat.tools.join(", ")}\n`;
      }
      if (skillsCat.practices.length > 0) {
        text += `Prácticas: ${skillsCat.practices.join(", ")}\n`;
      }
      text += `\n`;
    }

    if (hasClassicExperience) {
      text += `EXPERIENCIA\n`;
      classicExperience.forEach((exp) => {
        text += `${exp.company} | ${exp.period}\n`;
        text += `${exp.role}\n`;
        exp.achievements.forEach((ach) => {
          text += `• ${ach}\n`;
        });
        text += `\n`;
      });
    }

    if (hasClassicEducation) {
      text += `EDUCACIÓN\n`;
      education.forEach((edu) => {
        text += `${edu.institution} | ${edu.period}\n`;
        text += `${edu.degree}\n`;
        if (edu.details) text += `${edu.details}\n`;
        text += `\n`;
      });
    }

    if (hasClassicLanguages) {
      text += `IDIOMAS\n`;
      languages.forEach((lang) => {
        text += `${lang.language}: ${lang.level}\n`;
      });
    }

    return text.trim();
  };

  const handleCopy = async () => {
    try {
      const cleanText = generateCleanAtsText();
      await navigator.clipboard.writeText(cleanText);
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

      const cleanFileName = cv.fullName
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
      {/* 🛠️ BARRA DE HERRAMIENTAS MODERNA */}
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

      {/* 📄 EL DOCUMENTO CV ESTILO TECH */}
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
        <div className="w-full flex justify-center overflow-x-auto pb-4">
          <article
            ref={optimizedRef}
            className="bg-white text-black font-sans leading-relaxed w-[794px] min-w-[794px] p-10 border border-slate-200 shadow-xl relative select-text"
            style={{ boxSizing: "border-box" }}
          >
            <header className="text-center pb-2 mb-3">
              <h1 className="text-2xl font-bold text-black tracking-tight uppercase">
                {optName}
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
                Resumen
              </h2>
              <p className="text-[11px] text-black leading-relaxed whitespace-pre-line">
                {optimizedData.summary}
              </p>
            </section>

            {skillCategories.length > 0 && (
              <section className="mb-3.5">
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Habilidades
                </h2>
                <div className="space-y-1">
                  {skillCategories.map((cat) => (
                    <p
                      key={cat.label}
                      className="text-[11px] text-black leading-snug"
                    >
                      <span className="font-semibold">{cat.label}:</span>{" "}
                      {cat.values.join(", ")}
                    </p>
                  ))}
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
                        {periodOf(exp)}
                      </span>
                    </div>
                    <p className="text-[11px] italic text-black">
                      {exp.role}
                      {exp.location ? ` · ${exp.location}` : ""}
                    </p>
                    {optBullets(exp).length > 0 && (
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        {optBullets(exp).map((bullet, bulletIndex) => (
                          <li
                            key={bulletIndex}
                            className="text-[11px] text-black leading-relaxed"
                          >
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {optimizedData.projects && optimizedData.projects.length > 0 && (
              <section className="mb-3.5">
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Proyectos
                </h2>
                <div className="space-y-2">
                  {optimizedData.projects.map((proj) => (
                    <div key={proj.name}>
                      <p className="text-[11px] font-bold text-black">
                        {proj.name}
                        {proj.repoUrl && (
                          <span className="font-normal"> | {proj.repoUrl}</span>
                        )}
                      </p>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <p className="text-[11px] text-black">
                          {proj.technologies.join(", ")}
                        </p>
                      )}
                      {proj.description && (
                        <p className="text-[11px] text-black leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {optimizedData.education && optimizedData.education.length > 0 && (
              <section className="mb-3.5">
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Educación
                </h2>
                <div className="space-y-2">
                  {optimizedData.education.map((edu) => (
                    <div key={`${edu.institution}-${edu.degree}`}>
                      <div className="flex justify-between items-baseline text-[11px]">
                        <span className="font-bold text-black">
                          {edu.institution}
                        </span>
                        <span className="text-black font-medium">
                          {edu.period ??
                            (edu.graduationYear
                              ? String(edu.graduationYear)
                              : "")}
                        </span>
                      </div>
                      <p className="text-[11px] text-black">{edu.degree}</p>
                      {edu.details && (
                        <p className="text-[11px] text-black">{edu.details}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {optimizedData.languages && optimizedData.languages.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Idiomas
                </h2>
                <p className="text-[11px] text-black">
                  {optimizedData.languages
                    .map((lang) => `${lang.language}: ${lang.level}`)
                    .join(" | ")}
                </p>
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
            {/* Encabezado ATS con identidad real: nombre del CV o del usuario logueado. */}
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

            {/* Sección Habilidades Categorizadas */}
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

            {/* Sección Experiencia Laboral */}
            {hasClassicExperience && (
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
                        {exp.achievements.map((achievement, index) => (
                          <li key={index} className="leading-snug">
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sección Educación */}
            {hasClassicEducation && (
              <section className="mb-3.5">
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Educación
                </h2>
                <div className="space-y-2 text-[11px] text-black">
                  {education.map((edu, idx) => (
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

            {/* Sección Idiomas */}
            {hasClassicLanguages && (
              <section>
                <h2 className="text-xs font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                  Idiomas
                </h2>
                <div className="text-[11px] text-black">
                  {languages.map((lang, idx) => (
                    <p key={idx}>
                      <strong className="font-bold">{lang.language}:</strong>{" "}
                      {lang.level}
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
