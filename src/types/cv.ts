export interface JobExperience {
  id: string;
  role: string;
  company: string;
  period: string;
  achievements: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  period: string;
  details?: string;
}

export interface LanguageItem {
  language: string;
  level: string;
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
}
