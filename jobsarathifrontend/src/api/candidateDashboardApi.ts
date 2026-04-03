import axios from 'axios';
import api from './apiClient';

export const CANDIDATE_JOB_TYPE_OPTIONS = ['Full Time', 'Part Time', 'Internship', 'Remote'] as const;

export type CandidateJobType = (typeof CANDIDATE_JOB_TYPE_OPTIONS)[number];

export interface CandidateProfileData {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
  city: string;
  state: string | null;
  country: string;
  resume: string | null;
  resume_url: string | null;
  skills: string[];
  experience: string;
  education: string;
}

export interface CandidateProfilePayload {
  full_name: string;
  phone: string;
  location: string;
  skills: string[];
  experience: string;
  education: string;
  resumeFile?: File | null;
}

export interface CandidateJob {
  id: number;
  company_name: string;
  job_title: string;
  description: string;
  location_city: string;
  location_state: string | null;
  location_country: string;
  job_type: CandidateJobType;
  job_status: 'Open' | 'Closed';
  skills_required: string;
  salary_min: string;
  salary_max: string;
  posting_date: string;
  expiration_date: string | null;
  status: 'active' | 'closed';
}

export interface CandidateJobListResponse {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: CandidateJob[];
}

export interface CandidateApplication {
  id: number;
  job: number;
  job_title: string;
  company_name: string;
  status: string;
  applied_date: string;
  created_at: string;
  location: string | null;
  resume_url: string | null;
}

export interface SavedJob {
  id: number;
  job: number;
  job_title: string;
  company_name: string;
  created_at: string;
}

export interface JobSearchFilters {
  search?: string;
  location?: string;
  jobType?: CandidateJobType | '';
  page?: number;
  pageSize?: number;
}

interface ApplyPayload {
  jobId: number;
  resumeFile?: File | null;
  coverLetter?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const getCandidateApiErrorMessage = (error: unknown, fallback = 'Request failed'): string => {
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

const normalizeProfile = (payload: unknown): CandidateProfileData => {
  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      throw new Error('Candidate profile not found.');
    }
    return payload[0] as CandidateProfileData;
  }

  if (!isRecord(payload)) {
    throw new Error('Invalid profile response.');
  }

  return payload as unknown as CandidateProfileData;
};

const normalizeJobList = (payload: unknown): CandidateJobListResponse => {
  if (isRecord(payload) && Array.isArray(payload.results)) {
    return {
      count: Number(payload.count ?? payload.results.length),
      page: Number(payload.page ?? 1),
      page_size: Number(payload.page_size ?? payload.results.length),
      total_pages: Number(payload.total_pages ?? 1),
      results: payload.results as CandidateJob[],
    };
  }

  if (Array.isArray(payload)) {
    return {
      count: payload.length,
      page: 1,
      page_size: payload.length,
      total_pages: 1,
      results: payload as CandidateJob[],
    };
  }

  return {
    count: 0,
    page: 1,
    page_size: 10,
    total_pages: 1,
    results: [],
  };
};

export const fetchCandidateProfile = async (): Promise<CandidateProfileData> => {
  const response = await api.get('/api/candidate/profile/update/');
  return normalizeProfile(response.data);
};

export const updateCandidateProfile = async (
  payload: CandidateProfilePayload,
): Promise<CandidateProfileData> => {
  const hasResume = payload.resumeFile instanceof File;

  if (hasResume) {
    const formData = new FormData();
    formData.append('full_name', payload.full_name);
    formData.append('phone', payload.phone);
    formData.append('location', payload.location);
    formData.append('skills', payload.skills.join(','));
    formData.append('experience', payload.experience);
    formData.append('education', payload.education);
    formData.append('resume', payload.resumeFile as File);

    const response = await api.patch('/api/candidate/profile/update/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeProfile(response.data);
  }

  const response = await api.patch('/api/candidate/profile/update/', {
    full_name: payload.full_name,
    phone: payload.phone,
    location: payload.location,
    skills: payload.skills,
    experience: payload.experience,
    education: payload.education,
  });
  return normalizeProfile(response.data);
};

export const fetchJobsForCandidate = async (
  filters: JobSearchFilters = {},
): Promise<CandidateJobListResponse> => {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    page_size: filters.pageSize ?? 9,
  };

  if (filters.search?.trim()) {
    params.keyword = filters.search.trim();
  }
  if (filters.location?.trim()) {
    params.location = filters.location.trim();
  }
  if (filters.jobType) {
    params.type = filters.jobType;
  }

  const response = await api.get('/api/jobs/', { params });
  return normalizeJobList(response.data);
};

export const fetchJobDetails = async (jobId: number): Promise<CandidateJob> => {
  const response = await api.get<CandidateJob>(`/api/jobs/${jobId}/`);
  return response.data;
};

export const applyToJob = async (payload: ApplyPayload): Promise<CandidateApplication> => {
  const formData = new FormData();
  formData.append('job_id', String(payload.jobId));

  if (payload.coverLetter?.trim()) {
    formData.append('cover_letter', payload.coverLetter.trim());
  }

  if (payload.resumeFile instanceof File) {
    formData.append('resume', payload.resumeFile);
  }

  const response = await api.post<CandidateApplication>('/api/applications/apply/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const fetchCandidateApplications = async (): Promise<CandidateApplication[]> => {
  const response = await api.get<CandidateApplication[]>('/api/candidate/applications/');
  return Array.isArray(response.data) ? response.data : [];
};

export const fetchSavedJobs = async (): Promise<SavedJob[]> => {
  const response = await api.get<SavedJob[]>('/api/candidate/saved-jobs/');
  return Array.isArray(response.data) ? response.data : [];
};

export const saveJobForCandidate = async (jobId: number): Promise<SavedJob> => {
  const response = await api.post<SavedJob>('/api/candidate/saved-jobs/', { job: jobId });
  return response.data;
};

export const unsaveJobForCandidate = async (savedJobId: number): Promise<void> => {
  await api.delete(`/api/candidate/saved-jobs/${savedJobId}/`);
};

export const toDisplayApplicationStatus = (status: string): 'Pending' | 'Accepted' | 'Rejected' => {
  if (status === 'selected' || status === 'shortlisted') {
    return 'Accepted';
  }
  if (status === 'rejected' || status === 'withdrawn') {
    return 'Rejected';
  }
  return 'Pending';
};
