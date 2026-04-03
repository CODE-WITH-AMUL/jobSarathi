import axios from 'axios';
import api from '../api/apiClient';
import type { CandidateProfile, DashboardStats, Job, JobApplication } from '../types/candidate';

interface ListParams {
  limit?: number;
}

interface ListResponse<T> {
  count: number;
  results: T[];
}

interface SavedJobApiItem {
  id: number;
  job: number;
  job_title: string;
  company_name: string;
  created_at: string;
}

interface ApplyToJobPayload {
  coverLetter?: string;
  resumeFile?: File | null;
}

const getWithFallback = async (
  primaryPath: string,
  fallbackPath: string,
  config?: Parameters<typeof api.get>[1],
) => {
  try {
    return await api.get(primaryPath, config);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return api.get(fallbackPath, config);
    }
    throw error;
  }
};

const normalizeListPayload = <T>(payload: unknown): ListResponse<T> => {
  if (Array.isArray(payload)) {
    return { count: payload.length, results: payload as T[] };
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as { results?: unknown[] }).results)) {
    const typed = payload as { count?: number; results: unknown[] };
    return {
      count: Number(typed.count ?? typed.results.length),
      results: typed.results as T[],
    };
  }

  return { count: 0, results: [] };
};

const toJobType = (value?: string): Job['type'] => {
  switch (value) {
    case 'Full Time':
      return 'Full-time';
    case 'Part Time':
      return 'Part-time';
    case 'Contract':
      return 'Contract';
    case 'Hybrid':
      return 'Hybrid';
    case 'Remote':
    default:
      return 'Remote';
  }
};

const toExperienceLevel = (value?: string): Job['experience_level'] => {
  switch (value) {
    case 'Entry Level':
      return 'Entry';
    case 'Mid Level':
      return 'Mid';
    case 'Senior':
      return 'Senior';
    case 'Executive':
      return 'Lead';
    default:
      return 'Mid';
  }
};

const mapJob = (raw: Record<string, unknown>): Job => {
  const id = Number(raw.id ?? 0);
  const companyName = String(raw.company_name ?? 'Company');
  const city = String(raw.location_city ?? '').trim();
  const state = String(raw.location_state ?? '').trim();
  const country = String(raw.location_country ?? '').trim();
  const locationParts = [city, state, country].filter(Boolean);

  return {
    id,
    title: String(raw.job_title ?? raw.title ?? 'Untitled role'),
    company: {
      id: Number(raw.company_id ?? 0),
      name: companyName,
      logo: typeof raw.company_logo === 'string' ? raw.company_logo : undefined,
      industry: String(raw.industry ?? 'General'),
    },
    location: locationParts.join(', ') || 'Location not specified',
    type: toJobType(typeof raw.job_type === 'string' ? raw.job_type : undefined),
    experience_level: toExperienceLevel(typeof raw.experience_level === 'string' ? raw.experience_level : undefined),
    salary_min: Number(raw.salary_min ?? 0),
    salary_max: Number(raw.salary_max ?? 0),
    currency: String(raw.currency ?? 'NPR'),
    description: String(raw.description ?? ''),
    requirements: String(raw.description ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 6),
    skills_required: String(raw.skills_required ?? '')
      .split(',')
      .map((skill, index) => ({ id: index + 1, name: skill.trim() }))
      .filter((skill) => skill.name.length > 0),
    posted_at: String(raw.posting_date ?? raw.created_at ?? new Date().toISOString()),
    deadline: String(raw.expiration_date ?? ''),
    is_saved: Boolean(raw.is_saved ?? false),
    has_applied: Boolean(raw.has_applied ?? false),
    match_score: raw.match_score != null ? Number(raw.match_score) : undefined,
  };
};

const toAppStatus = (value?: string): JobApplication['status'] => {
  switch (value) {
    case 'shortlisted':
      return 'shortlisted';
    case 'rejected':
    case 'withdrawn':
      return 'rejected';
    case 'selected':
      return 'offered';
    case 'under_review':
      return 'reviewed';
    default:
      return 'pending';
  }
};

const mapSavedJob = (item: SavedJobApiItem): Job => {
  return {
    id: Number(item.job),
    title: item.job_title,
    company: {
      id: 0,
      name: item.company_name,
      industry: 'General',
    },
    location: 'Location not specified',
    type: 'Remote',
    experience_level: 'Mid',
    salary_min: 0,
    salary_max: 0,
    currency: 'NPR',
    description: '',
    requirements: [],
    skills_required: [],
    posted_at: item.created_at,
    deadline: '',
    is_saved: true,
    has_applied: false,
  };
};

const mapApplication = (item: Record<string, unknown>): JobApplication => {
  const job: Job = {
    id: Number(item.job ?? 0),
    title: String(item.job_title ?? 'Untitled role'),
    company: {
      id: 0,
      name: String(item.company_name ?? 'Company'),
      industry: 'General',
    },
    location: String(item.location ?? 'Location not specified'),
    type: 'Remote',
    experience_level: 'Mid',
    salary_min: 0,
    salary_max: 0,
    currency: 'NPR',
    description: '',
    requirements: [],
    skills_required: [],
    posted_at: String(item.created_at ?? new Date().toISOString()),
    deadline: '',
    is_saved: false,
    has_applied: true,
    match_score: item.resume_match_score != null ? Number(item.resume_match_score) : undefined,
  };

  return {
    id: Number(item.id ?? 0),
    job,
    status: toAppStatus(typeof item.status === 'string' ? item.status : undefined),
    applied_at: String(item.applied_date ?? item.created_at ?? new Date().toISOString()),
    match_score: item.resume_match_score != null ? Number(item.resume_match_score) : 0,
    notes: typeof item.resume_analysis === 'string' ? item.resume_analysis : undefined,
  };
};

const computeCompleteness = (profile: CandidateProfile): number => {
  let score = 0;
  if (profile.user.first_name) score += 15;
  if (profile.phone) score += 10;
  if (profile.location) score += 10;
  if (profile.summary) score += 15;
  if (profile.skills.length > 0) score += 20;
  if (profile.experience.length > 0) score += 15;
  if (profile.education.length > 0) score += 10;
  if (profile.resume) score += 5;
  return Math.min(score, 100);
};

const mapProfile = (raw: Record<string, unknown>): CandidateProfile => {
  const firstName = String(raw.first_name ?? '').trim();
  const lastName = String(raw.last_name ?? '').trim();
  const fullName = String(raw.full_name ?? `${firstName} ${lastName}`.trim()).trim();
  const parsedFirst = fullName.split(' ')[0] || firstName;
  const parsedLast = fullName.split(' ').slice(1).join(' ') || lastName;

  const profile: CandidateProfile = {
    id: Number(raw.id ?? 0),
    user: {
      id: Number(raw.user_id ?? 0),
      email: String(raw.email ?? ''),
      first_name: parsedFirst,
      last_name: parsedLast,
    },
    phone: String(raw.phone ?? ''),
    location: String(raw.location ?? ''),
    headline: String(raw.taglines ?? ''),
    summary: String(raw.experience ?? raw.description ?? ''),
    skills: Array.isArray(raw.skills)
      ? raw.skills.map((skill, index) => ({ id: index + 1, name: String(skill) }))
      : [],
    experience: raw.experience
      ? [
          {
            id: 1,
            title: 'Experience',
            company: 'Summary',
            location: String(raw.location ?? ''),
            start_date: '',
            end_date: null,
            current: true,
            description: String(raw.experience),
          },
        ]
      : [],
    education: raw.education
      ? [
          {
            id: 1,
            degree: 'Other',
            institution: 'Summary',
            field_of_study: '',
            start_date: '',
            end_date: null,
            grade: '',
          },
        ]
      : [],
    resume: typeof raw.resume_url === 'string' && raw.resume_url
      ? {
          id: Number(raw.id ?? 0),
          file: raw.resume_url,
          uploaded_at: new Date().toISOString(),
        }
      : null,
    social_links: {
      portfolio: typeof raw.portfolio === 'string' ? raw.portfolio : undefined,
    },
    profile_completeness: 0,
  };

  profile.profile_completeness = computeCompleteness(profile);
  return profile;
};

export const candidateAPI = {
  async getProfile(): Promise<CandidateProfile> {
    const response = await getWithFallback('/api/candidate/profile/update/', '/api/candidate/profile/');
    const payload = Array.isArray(response.data) ? response.data[0] : response.data;
    return mapProfile((payload ?? {}) as Record<string, unknown>);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const [applicationsResponse, savedJobsResponse] = await Promise.all([
      api.get('/api/candidate/applications/'),
      api.get('/api/candidate/saved-jobs/'),
    ]);

    const applications = normalizeListPayload<Record<string, unknown>>(applicationsResponse.data).results;
    const savedJobs = normalizeListPayload<SavedJobApiItem>(savedJobsResponse.data).results;

    const shortlisted = applications.filter((item) => item.status === 'shortlisted' || item.status === 'selected').length;
    const rejected = applications.filter((item) => item.status === 'rejected' || item.status === 'withdrawn').length;
    const active = applications.filter((item) => item.status === 'applied' || item.status === 'under_review').length;

    return {
      total_applications: applications.length,
      active_applications: active,
      shortlisted_count: shortlisted,
      rejected_count: rejected,
      saved_jobs_count: savedJobs.length,
      profile_views: 0,
    };
  },

  async getRecommendedJobs(params: ListParams = {}): Promise<ListResponse<Job>> {
    const response = await getWithFallback('/api/jobs/', '/api/candidate/jobs/', {
      params: { page: 1, page_size: params.limit ?? 5 },
    });
    const normalized = normalizeListPayload<Record<string, unknown>>(response.data);
    return {
      count: normalized.count,
      results: normalized.results.map((item) => mapJob(item)),
    };
  },

  async getApplications(params: ListParams = {}): Promise<ListResponse<JobApplication>> {
    const response = await api.get('/api/candidate/applications/', {
      params: { page_size: params.limit ?? 5 },
    });
    const normalized = normalizeListPayload<Record<string, unknown>>(response.data);
    return {
      count: normalized.count,
      results: normalized.results.map((item) => mapApplication(item)),
    };
  },

  async getSavedJobs(params: ListParams = {}): Promise<ListResponse<Job>> {
    const response = await api.get('/api/candidate/saved-jobs/', {
      params: { page_size: params.limit ?? 5 },
    });
    const normalized = normalizeListPayload<SavedJobApiItem>(response.data);
    return {
      count: normalized.count,
      results: normalized.results.map((item) => mapSavedJob(item)),
    };
  },

  async saveJob(jobId: number): Promise<unknown> {
    const response = await api.post('/api/candidate/saved-jobs/', { job: jobId });
    return response.data;
  },

  async applyToJob(jobId: number, payload: ApplyToJobPayload = {}): Promise<unknown> {
    const formData = new FormData();
    formData.append('job_id', String(jobId));

    if (payload.coverLetter?.trim()) {
      formData.append('cover_letter', payload.coverLetter.trim());
    }

    if (payload.resumeFile instanceof File) {
      formData.append('resume', payload.resumeFile);
    }

    const response = await api.post('/api/applications/apply/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async unsaveJob(jobId: number): Promise<void> {
    const response = await api.get('/api/candidate/saved-jobs/');
    const savedJobs = normalizeListPayload<SavedJobApiItem>(response.data).results;
    const match = savedJobs.find((item) => Number(item.job) === Number(jobId));
    if (!match) {
      return;
    }
    await api.delete(`/api/candidate/saved-jobs/${match.id}/`);
  },
};
