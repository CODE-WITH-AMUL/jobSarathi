// types/candidate.ts
export interface CandidateProfile {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  phone: string;
  location: string;
  headline: string;
  summary: string;
  skills: Array<{ id: number; name: string }>;
  experience: Array<{
    id: number;
    title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string | null;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: number;
    degree: string;
    institution: string;
    field_of_study: string;
    start_date: string;
    end_date: string | null;
    grade: string;
  }>;
  resume: {
    id: number;
    file: string;
    uploaded_at: string;
  } | null;
  social_links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  profile_completeness: number;
}

export interface Job {
  id: number;
  title: string;
  company: {
    id: number;
    name: string;
    logo?: string;
    industry: string;
  };
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid';
  experience_level: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  salary_min: number;
  salary_max: number;
  currency: string;
  description: string;
  requirements: string[];
  skills_required: Array<{ id: number; name: string }>;
  posted_at: string;
  deadline: string;
  is_saved: boolean;
  has_applied: boolean;
  match_score?: number;
}

export interface JobApplication {
  id: number;
  job: Job;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'offered';
  applied_at: string;
  match_score: number;
  notes?: string;
}

export interface DashboardStats {
  total_applications: number;
  active_applications: number;
  shortlisted_count: number;
  rejected_count: number;
  saved_jobs_count: number;
  profile_views?: number;
}