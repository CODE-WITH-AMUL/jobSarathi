// src/api/apiClient.ts
import axios, { AxiosHeaders } from 'axios';

const rawBase = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
const API_URL = String(rawBase).replace(/\/+$/, '');

const getAccessToken = (): string | null => {
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken')
  );
};

const api = axios.create({
  baseURL: API_URL,
});

// Add JWT token automatically to requests
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (!token) {
    return config;
  }

  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  if (config.headers instanceof AxiosHeaders) {
    config.headers.set('Authorization', `Bearer ${token}`);
  } else {
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;