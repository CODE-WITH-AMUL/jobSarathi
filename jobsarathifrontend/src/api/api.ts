// src/api/api.ts
import axios from 'axios';
import type { LoginFormData, RegisterFormData } from '../account/types/auth.types';

const API_URL = import.meta.env.VITE_API_URL as string;

export const loginUser = async (data: LoginFormData) => {
  try {
    const response = await axios.post(`${API_URL}/login/`, {
      username: data.email, // Django default: username field
      password: data.password,
    });
    return response.data; // { access, refresh }
  } catch (error: any) {
    throw error.response?.data || { detail: 'Login failed' };
  }
};

export const registerUser = async (data: RegisterFormData) => {
  try {
    const response = await axios.post(`${API_URL}/register/`, {
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