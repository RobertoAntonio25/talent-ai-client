export interface JobExperience {
  id: string;
  role: string;
  company: string;
  period: string;
  achievements: string[];
}

export interface GeneratedCV {
  fullName: string;
  targetRole: string;
  summary: string;
  experience: JobExperience[];
  skills: string[];
}
