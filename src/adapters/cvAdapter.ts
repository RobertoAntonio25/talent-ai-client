import type { GeneratedCV } from "../types/cv";
import type { ExtractedCvData } from "../services/aiService";
import type { ProfileCvData, ProfileCvPatch } from "../services/userProfile.service";
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

/** Primer año de 4 dígitos en un texto libre ("2020 – 2024" → 2020). */
function parseYear(text?: string | null): number | null {
  if (!text) return null;
  const m = text.match(/\b(19|20)\d{2}\b/);
  return m ? Number(m[0]) : null;
}

/** Nivel del back (enum) a etiqueta de muestra (el editor lo edita libre). */
function formatLevel(level?: string | null): string {
  if (!level) return "";
  const map: Record<string, string> = {
    BASIC: "Básico",
    INTERMEDIATE: "Intermedio",
    ADVANCED: "Avanzado",
    NATIVE: "Nativo",
  };
  return map[level] ?? level;
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
      // Issue #107: conservar fechas para el viaje de vuelta (si el
      // usuario edita a mano, el PATCH no debe resetearlas a "ahora").
      startDate: exp.startDate ?? null,
      endDate: exp.endDate ?? null,
    })),
    education: (data.education ?? []).map((edu) => ({
      institution: edu.institution || "Institución no especificada",
      degree: edu.degree || "Estudios no especificados",
      period: edu.graduationYear ? String(edu.graduationYear) : "",
      graduationYear: edu.graduationYear ?? null,
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

// Issue #107: CV persistido en el back → GeneratedCV (hidratación).
// Conserva las fechas ISO y el año para el viaje de vuelta (PATCH).
export function mapProfileCvToGeneratedCV(
  data: ProfileCvData,
  user: User | null,
): GeneratedCV {
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Mi CV optimizado";

  return {
    fullName,
    targetRole: data.targetRole || "Perfil profesional",
    summary: data.summary || "",
    contact: {
      email: user?.email || "[tu email]",
      phone: user?.phone || "[tu teléfono]",
      location: user?.location || data.targetCity || "[tu ubicación]",
      linkedin: "[tu linkedin]",
      portfolio: "[tu portfolio]",
    },
    skills: data.skills ?? [],
    experience: (data.experiences ?? []).map((exp, i) => ({
      id: `srv-${i}`,
      role: exp.role || "Puesto no especificado",
      company: exp.company || "Empresa no especificada",
      period: formatPeriod(exp.startDate, exp.endDate),
      achievements: exp.description ? [exp.description] : [],
      startDate: exp.startDate ?? null,
      endDate: exp.endDate ?? null,
    })),
    education: (data.education ?? []).map((edu) => ({
      institution: edu.institution || "Institución no especificada",
      degree: edu.degree || "Estudios no especificados",
      period:
        typeof edu.graduationYear === "number"
          ? String(edu.graduationYear)
          : "",
      graduationYear:
        typeof edu.graduationYear === "number" ? edu.graduationYear : null,
    })),
    languages: (data.languages ?? []).map((lang) => ({
      language: lang.language || "Idioma no especificado",
      level: formatLevel(lang.level),
    })),
    projects: (data.projects ?? []).map((p) => ({
      name: p.name || "Proyecto sin nombre",
      technologies: p.technologies ?? [],
      repoUrl: p.repoUrl || undefined,
    })),
  };
}

/** GeneratedCV → PATCH /api/profile/cv (solo claves con contenido real;
 * los "[tu …]" no viajan para no ensuciar la BD). */
export function mapGeneratedCVToProfilePatch(
  cv: GeneratedCV,
): ProfileCvPatch {
  const patch: ProfileCvPatch = {};
  if (cv.summary?.trim()) patch.summary = cv.summary.trim();
  if (Array.isArray(cv.skills)) patch.skills = cv.skills;
  if (cv.targetRole?.trim()) patch.targetRole = cv.targetRole.trim();
  const location = cv.contact?.location?.trim();
  if (location && !location.startsWith("[")) patch.targetCity = location;
  if (Array.isArray(cv.experience)) {
    patch.experiences = cv.experience.map((e) => ({
      role: e.role || null,
      company: e.company || null,
      startDate: e.startDate ?? null,
      endDate: e.endDate ?? null,
      description: e.achievements.join("\n") || null,
    }));
  }
  if (Array.isArray(cv.education)) {
    patch.education = cv.education.map((e) => ({
      degree: e.degree || null,
      institution: e.institution || null,
      graduationYear: e.graduationYear ?? parseYear(e.period),
    }));
  }
  if (Array.isArray(cv.projects)) {
    patch.projects = cv.projects.map((p) => ({
      name: p.name || null,
      technologies: p.technologies ?? [],
      repoUrl: p.repoUrl || null,
    }));
  }
  if (Array.isArray(cv.languages)) {
    patch.languages = cv.languages.map((l) => ({
      language: l.language,
      level: l.level || null,
    }));
  }
  return patch;
}
