// src/api/profileApi.ts
import api from './apiClient';
import type { Profile } from '../account/types/profile.types';

const PROFILE_COLLECTION_ENDPOINT = '/api/profile/';

const getProfileFromResponse = (data: unknown): Profile => {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      throw new Error('Profile not found');
    }
    return data[0] as Profile;
  }
  return data as Profile;
};

export const fetchProfile = async (): Promise<Profile> => {
  const res = await api.get(PROFILE_COLLECTION_ENDPOINT);
  return getProfileFromResponse(res.data);
};

export const updateProfile = async (profile: Partial<Profile>): Promise<Profile> => {
  if (!profile.id) {
    throw new Error('Profile id is required to update profile');
  }

  const res = await api.put(`/api/profile/${profile.id}/`, profile);
  return res.data;
};