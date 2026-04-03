import axios from 'axios';
import api from './apiClient';

export const JOB_TYPE_OPTIONS = ['Full Time', 'Part Time', 'Internship', 'Remote'] as const;
export const EXPERIENCE_LEVEL_OPTIONS = [
  'Entry Level',
  'Mid Level',
  'Senior',
  'Executive',
  'Any',
] as const;
export const INDUSTRY_TYPE_OPTIONS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Hospitality',
  'Media',
  'Government',
  'Other',
] as const;

export type JobType = (typeof JOB_TYPE_OPTIONS)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVEL_OPTIONS)[number];
export type IndustryType = (typeof INDUSTRY_TYPE_OPTIONS)[number];

export interface CompanyProfile {
  id: number;
  name: string;
  user_email: string;
  description: string | null;
  location: string | null;
  website: string | null;
  industry_type: IndustryType | null;
  logo: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfilePayload {
  name: string;
  description: string;
  location: string;
  website: string;
  industry_type: IndustryType | '';
  logoFile?: File | null;
}

export interface CompanyJob {
  id: number;
  company_name: string;
  job_title: string;
  description: string;
  location_city: string;
  location_state: string | null;
  location_country: string;
  job_type: JobType;
  job_status: 'Open' | 'Closed';
  experience_level: ExperienceLevel;
  skills_required: string;
  salary_min: string;
  salary_max: string;
  posting_date: string;
  expiration_date: string | null;
  applications_count?: number;
  application_count?: number;
  status?: 'active' | 'closed';
}

export interface CompanyJobPayload {
  job_title: string;
  description: string;
  location_city: string;
  location_state?: string;
  location_country: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  skills_required: string[];
  salary_min: number;
  salary_max: number;
  expiration_date?: string | null;
}

export interface CompanyDashboardStats {
  total_jobs: number;
  open_jobs: number;
  closed_jobs: number;
  total_applications: number;
  application_stats: Record<string, number>;
}

export type CompanyApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'selected'
  | 'rejected'
  | 'withdrawn';

export interface CompanyApplication {
  id: number;
  job: number;
  job_title: string;
  candidate: number;
  candidate_name: string;
  candidate_email: string;
  email: string;
  phone: string;
  location: string | null;
  status: CompanyApplicationStatus;
  source: string | null;
  cover_letter: string | null;
  resume_url: string | null;
  candidate_resume_url: string | null;
  candidate_skills: string[];
  candidate_headline: string | null;
  candidate_summary: string | null;
  applied_date: string;
  resume_match_score: number | null;
  resume_analysis: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyApplicationReviewPayload {
  status?: 'under_review' | 'shortlisted' | 'selected' | 'rejected';
  notes?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const normalizeArrayPayload = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (isRecord(payload) && Array.isArray(payload.results)) {
    return payload.results as T[];
  }

  return [];
};

export const getApiErrorMessage = (error: unknown, fallback = 'Request failed'): string => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data;
  if (!data) {
    return error.message || fallback;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (isRecord(data)) {
    if (typeof data.detail === 'string') {
      return data.detail;
    }

    if (typeof data.message === 'string') {
      return data.message;
    }

    for (const value of Object.values(data)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        return value[0];
      }
      if (typeof value === 'string') {
        return value;
      }
    }
  }

  return error.message || fallback;
};

const ensureSkillsAsArray = (skills: string[] | string): string[] => {
  if (Array.isArray(skills)) {
    return skills.map((skill) => skill.trim()).filter(Boolean);
  }
  return skills.split(',').map((skill) => skill.trim()).filter(Boolean);
};

const serializeJobPayload = (payload: CompanyJobPayload): Record<string, unknown> => {
  return {
    job_title: payload.job_title,
    description: payload.description,
    location_city: payload.location_city,
    location_state: payload.location_state || '',
    location_country: payload.location_country,
    job_type: payload.job_type,
    experience_level: payload.experience_level,
    skills_required: ensureSkillsAsArray(payload.skills_required),
    salary_min: payload.salary_min,
    salary_max: payload.salary_max,
    expiration_date: payload.expiration_date || null,
  };
};

export const fetchCompanyProfile = async (): Promise<CompanyProfile> => {
  const response = await api.get<CompanyProfile[]>('/api/company/profile/');
  if (!Array.isArray(response.data) || response.data.length === 0) {
    throw new Error('Company profile not found.');
  }
  return response.data[0];
};

export const updateCompanyProfile = async (
  payload: CompanyProfilePayload,
): Promise<CompanyProfile> => {
  const hasLogo = payload.logoFile instanceof File;

  if (hasLogo) {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('description', payload.description);
    formData.append('location', payload.location);
    formData.append('website', payload.website);
    formData.append('industry_type', payload.industry_type);
    formData.append('logo', payload.logoFile as File);

    const response = await api.patch<CompanyProfile>('/api/company/profile/update/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  const response = await api.patch<CompanyProfile>('/api/company/profile/update/', {
    name: payload.name,
    description: payload.description,
    location: payload.location,
    website: payload.website,
    industry_type: payload.industry_type || null,
  });
  return response.data;
};

export const fetchCompanyJobs = async (): Promise<CompanyJob[]> => {
  const response = await api.get<unknown>('/api/company/jobs/');
  return normalizeArrayPayload<CompanyJob>(response.data);
};

export const createCompanyJob = async (payload: CompanyJobPayload): Promise<CompanyJob> => {
  const response = await api.post<CompanyJob>('/api/jobs/create/', serializeJobPayload(payload));
  return response.data;
};

export const updateCompanyJob = async (
  id: number,
  payload: CompanyJobPayload,
): Promise<CompanyJob> => {
  const response = await api.put<CompanyJob>(`/api/jobs/${id}/update/`, serializeJobPayload(payload));
  return response.data;
};

export const deleteCompanyJob = async (id: number): Promise<void> => {
  await api.delete(`/api/jobs/${id}/delete/`);
};

export const toggleCompanyJobStatus = async (id: number): Promise<CompanyJob> => {
  const response = await api.patch<CompanyJob>(`/api/company/jobs/${id}/toggle-status/`);
  return response.data;
};

export const fetchCompanyDashboardStats = async (): Promise<CompanyDashboardStats> => {
  const response = await api.get<CompanyDashboardStats>('/api/company/dashboard/stats/');
  return response.data;
};

export const fetchCompanyApplications = async (): Promise<CompanyApplication[]> => {
  const response = await api.get<unknown>('/api/company/applications/');
  return normalizeArrayPayload<CompanyApplication>(response.data);
};

export const reviewCompanyApplication = async (
  applicationId: number,
  payload: CompanyApplicationReviewPayload,
): Promise<CompanyApplication> => {
  const body: Record<string, string> = {};

  if (payload.status) {
    body.status = payload.status;
  }

  if (payload.notes !== undefined) {
    body.resume_analysis = payload.notes;
  }

  const response = await api.patch<CompanyApplication>(
    `/api/company/applications/${applicationId}/review/`,
    body,
  );
  return response.data;
};
