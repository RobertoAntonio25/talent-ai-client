export interface JobExperience {
  id: string;
  role: string;
  company: string;
  period: string;
  achievements: string[];
  // Issue #107: fechas ISO de ida y vuelta con el back (el `period` es
  // solo texto de muestra). Opcionales para no romper el CV manual local.
  startDate?: string | null;
  endDate?: string | null;
}

export interface EducationItem {
  institution: string;
  degree: string;
  period: string;
  details?: string;
  // Issue #107: año de ida y vuelta con el back (`graduationYear`
  // requerido allí). Opcional para no romper el CV manual local.
  graduationYear?: number | null;
}

export interface LanguageItem {
  language: string;
  level: string;
}

export interface CvProject {
  name: string;
  technologies: string[];
  repoUrl?: string;
}

export interface SkillsCategorized {
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  practices: string[];
}

export interface GeneratedCV {
  fullName: string;
  targetRole: string;
  summary: string;
  contact?: {
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  skillsCategorized?: SkillsCategorized;
  skills: string[];
  experience: JobExperience[];
  education?: EducationItem[];
  languages?: LanguageItem[];
  projects?: CvProject[];
}
