import type { GeneratedCV } from "../types/cv";
import type { ExtractedCvData } from "../services/aiService";
import type { User } from "../context/AuthContext";

function formatPeriod(start?: string | null, end?: string | null): string {
  const fmt = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso; // si Groq mandó texto libre, lo respetamos
    return d.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
  };
  const s = fmt(start) ?? "Inicio N/D";
  const e = fmt(end) ?? "Actualidad";
  return `${s} – ${e}`;
}

export function mapExtractedToGeneratedCV(
  data: ExtractedCvData,
  user: User | null,
): GeneratedCV {
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Mi CV optimizado";

  return {
    fullName,
    targetRole: data.targetRole || "Perfil profesional",
    summary: data.summary || "Resumen generado por IA a partir de tu PDF.",
    contact: {
      email: user?.email || "[tu email]",
      phone: "[tu teléfono]",
      location: user?.location || data.targetCity || "[tu ubicación]",
      linkedin: "[tu linkedin]",
      portfolio: "[tu portfolio]",
    },
    skills: data.skills ?? [],
    experience: (data.experiences ?? []).map((exp, i) => ({
      id: String(i + 1),
      role: exp.role || "Puesto no especificado",
      company: exp.company || "Empresa no especificada",
      period: formatPeriod(exp.startDate, exp.endDate),
      achievements: exp.description ? [exp.description] : [],
    })),
    education: (data.education ?? []).map((edu) => ({
      institution: edu.institution || "Institución no especificada",
      degree: edu.degree || "Estudios no especificados",
      period: edu.graduationYear ? String(edu.graduationYear) : "",
    })),
    languages: (data.languages ?? []).map((lang) => ({
      language: lang.language || "Idioma no especificado",
      level: lang.level || "",
    })),
    projects: (data.projects ?? []).map((p) => ({
      name: p.name || "Proyecto sin nombre",
      technologies: p.technologies ?? [],
      repoUrl: p.repoUrl || undefined,
    })),
  };
}
