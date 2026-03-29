// src/api/api.ts
import axios from 'axios';
import type { LoginFormData, RegisterFormData } from '../account/types/auth.types';

const rawBase = import.meta.env.VITE_API_URL ?? '';
const API_URL = String(rawBase || '').replace(/\/+$/, '');
if (!API_URL) {
  console.warn('VITE_API_URL is not defined for auth API; falling back to same-origin.');
}

const getApiErrorData = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error) && error.response?.data) {
    return error.response.data;
  }
  return { detail: fallbackMessage };
};

export const loginUser = async (data: LoginFormData) => {
  const base = API_URL || '';
  const url = `${base}/api/auth/candidate/login/`;
  try {
    const response = await axios.post(url, {
      username: data.email,
      password: data.password,
    });
    return response.data;
  } catch (error: unknown) {
    throw getApiErrorData(error, 'Login failed');
  }
};

export const registerUser = async (data: RegisterFormData) => {
  const base = API_URL || '';
  const url = `${base}/api/auth/candidate/register/`;
  try {
    const response = await axios.post(url, {
      username: data.username,
      email: data.email,
      password: data.password,
      confirm_password: data.confirmPassword,
    });
    return response.data;
  } catch (error: unknown) {
    throw getApiErrorData(error, 'Registration failed');
  }
};