// src/api/api.ts
import axios from 'axios';
import type { LoginFormData, RegisterFormData } from '../account/types/auth.types';

const rawBase = import.meta.env.VITE_API_URL ?? '';
const API_URL = String(rawBase || '').replace(/\/+$/, '');
if (!API_URL) {
  console.warn('VITE_API_URL is not defined for auth API; falling back to same-origin.');
}

export const loginUser = async (data: LoginFormData) => {
  const base = API_URL || '';
  const url = `${base}/login/`;
  try {
    const response = await axios.post(url, {
      username: data.email, // Django default: username field
      password: data.password,
    });
    return response.data; // { access, refresh }
  } catch (error: any) {
    throw error.response?.data || { detail: 'Login failed' };
  }
};

export const registerUser = async (data: RegisterFormData) => {
  const base = API_URL || '';
  const url = `${base}/register/`;
  try {
    const response = await axios.post(url, {
      username: data.username,
      email: data.email,
      password: data.password,
      confirm_password: data.confirmPassword,
    });
    return response.data; // new user info
  } catch (error: any) {
    throw error.response?.data || { detail: 'Registration failed' };
  }
};