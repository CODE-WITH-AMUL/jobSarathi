// API utility functions for Django backend communication

type AccountType = 'company' | 'candidate';

const rawBase = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
const API_BASE_URL = String(rawBase).replace(/\/+$/, '');

const getAccessToken = (): string | null => {
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken')
  );
};

const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken');
};

const toApiPath = (endpoint: string): string => {
  if (endpoint.startsWith('/api/')) {
    return endpoint;
  }
  if (endpoint.startsWith('/')) {
    return `/api${endpoint}`;
  }
  return `/api/${endpoint}`;
};

const isFormDataBody = (body: BodyInit | null | undefined): body is FormData => {
  return typeof FormData !== 'undefined' && body instanceof FormData;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const parseApiErrorMessage = (data: unknown, status: number): string => {
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

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  return `HTTP error! status: ${status}`;
};

const apiRequest = async <T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const body = options.body;
  const headers = new Headers(options.headers ?? undefined);
  const token = getAccessToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const method = options.method?.toUpperCase() ?? 'GET';
  if (!isFormDataBody(body) && !headers.has('Content-Type') && method !== 'GET' && method !== 'HEAD') {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE_URL}${toApiPath(endpoint)}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const data: unknown = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(parseApiErrorMessage(data, response.status)) as Error & {
      status: number;
      data: unknown;
    };
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
};

const inferUsernameFromEmail = (email: string): string => {
  const localPart = email.split('@')[0] || 'user';
  return localPart.replace(/[^a-zA-Z0-9_]/g, '_');
};

const resolveSingleResourceId = async (endpoint: string): Promise<number> => {
  const data = await apiRequest<unknown>(endpoint);

  if (Array.isArray(data) && data.length > 0 && isRecord(data[0]) && typeof data[0].id === 'number') {
    return data[0].id;
  }

  if (isRecord(data) && typeof data.id === 'number') {
    return data.id;
  }

  throw new Error(`Could not resolve resource id for ${endpoint}`);
};

// Authentication API functions
export const authAPI = {
  login: async (credentials: {
    email: string;
    password: string;
    account_type: AccountType;
  }) => {
    return apiRequest(`/auth/${credentials.account_type}/login/`, {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.email,
        password: credentials.password,
      }),
    });
  },

  register: async (userData: {
    email: string;
    password: string;
    account_type: AccountType;
    username?: string;
    confirm_password?: string;
    confirmPassword?: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
  }) => {
    const payload: Record<string, unknown> = {
      username: userData.username || inferUsernameFromEmail(userData.email),
      email: userData.email,
      password: userData.password,
      confirm_password: userData.confirm_password || userData.confirmPassword || userData.password,
    };

    if (userData.account_type === 'company' && userData.company_name) {
      payload.company_name = userData.company_name;
    }

    return apiRequest(`/auth/${userData.account_type}/register/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userRole');
    return { success: true };
  },

  getCurrentUser: async () => {
    const data = await apiRequest<unknown>('/profile/');
    return Array.isArray(data) ? (data[0] ?? null) : data;
  },

  refreshToken: async () => {
    const refresh = getRefreshToken();
    if (!refresh) {
      throw new Error('No refresh token found');
    }

    return apiRequest('/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });
  },
};

// Job-related API functions
export const jobsAPI = {
  getJobs: async (params?: Record<string, string | number | boolean>) => {
    const queryString = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    return apiRequest(`/candidate/jobs/${queryString ? `?${queryString}` : ''}`);
  },

  getJob: async (id: number) => {
    return apiRequest(`/candidate/jobs/${id}/`);
  },

  createJob: async (jobData: Record<string, unknown>) => {
    return apiRequest('/company/jobs/', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  updateJob: async (id: number, jobData: Record<string, unknown>) => {
    return apiRequest(`/company/jobs/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  },

  deleteJob: async (id: number) => {
    return apiRequest(`/company/jobs/${id}/`, {
      method: 'DELETE',
    });
  },
};

// Application-related API functions
export const applicationsAPI = {
  getApplications: async (params?: { job_id?: number; page?: number; account_type?: AccountType }) => {
    const { account_type = 'candidate', ...query } = params || {};
    const queryString = Object.keys(query).length > 0 ? new URLSearchParams(query as Record<string, string>).toString() : '';
    const endpoint = account_type === 'company' ? '/company/applications/' : '/candidate/applications/';
    return apiRequest(`${endpoint}${queryString ? `?${queryString}` : ''}`);
  },

  createApplication: async (applicationData: { job: number; resume?: File; cover_letter?: string }) => {
    const formData = new FormData();
    formData.append('job', applicationData.job.toString());
    if (applicationData.resume) {
      formData.append('resume_file', applicationData.resume);
    }
    if (applicationData.cover_letter) {
      formData.append('cover_letter', applicationData.cover_letter);
    }

    return apiRequest('/candidate/applications/', {
      method: 'POST',
      body: formData,
    });
  },

  updateApplicationStatus: async (id: number, status: string) => {
    return apiRequest(`/company/applications/${id}/review/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// Company profile API functions
export const companyAPI = {
  getProfile: async () => {
    return apiRequest('/company/profile/');
  },

  updateProfile: async (profileData: Record<string, unknown>) => {
    const profileId =
      typeof profileData.id === 'number'
        ? profileData.id
        : await resolveSingleResourceId('/company/profile/');

    return apiRequest(`/company/profile/${profileId}/`, {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },
};

// Candidate profile API functions
export const candidateAPI = {
  getProfile: async () => {
    return apiRequest('/candidate/profile/');
  },

  updateProfile: async (profileData: Record<string, unknown>) => {
    const profileId =
      typeof profileData.id === 'number'
        ? profileData.id
        : await resolveSingleResourceId('/candidate/profile/');

    return apiRequest(`/candidate/profile/${profileId}/`, {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  uploadResume: async (resume: File, title?: string) => {
    const formData = new FormData();
    formData.append('file', resume);
    if (title) {
      formData.append('title', title);
    }

    return apiRequest('/candidate/resumes/', {
      method: 'POST',
      body: formData,
    });
  },
};