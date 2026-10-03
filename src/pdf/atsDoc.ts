// Modelo intermedio: los visores convierten sus datos a AtsCvDoc y el
// documento PDF solo sabe pintar. Títulos ya en español, sin mezcla.
export interface AtsSkillGroup {
  label: string;
  items: string[];
}

export interface AtsExperience {
  company: string;
  dates: string;
  roleLine: string;
  bullets: string[];
}

export interface AtsProject {
  name: string;
  repoUrl?: string;
  description: string;
}

export interface AtsEducation {
  institution: string;
  period: string;
  degree: string;
  details?: string;
}

export interface AtsCvDoc {
  displayName: string;
  headline: string;
  contactLine: string;
  summary: string;
  skills: AtsSkillGroup[];
  experience: AtsExperience[];
  projects: AtsProject[];
  education: AtsEducation[];
  languagesLine: string;
}

export function emptyAtsDoc(): AtsCvDoc {
  return {
    displayName: "",
    headline: "",
    contactLine: "",
    summary: "",
    skills: [],
    experience: [],
    projects: [],
    education: [],
    languagesLine: "",
  };
}
