// src/api/profileApi.ts
import api from './apiClient';
import type { Profile } from '../account/types/profile.types';

export const fetchProfile = async (): Promise<Profile> => {
  const res = await api.get('/profile/');
  return res.data[0]; // assuming the API returns an array
};

export const updateProfile = async (profile: Partial<Profile>): Promise<Profile> => {
  const res = await api.put(`/profile/${profile.id}/`, profile);
  return res.data;
};