// src/components/candidate/Profile.tsx
import React, { useEffect, useState } from 'react';
import { fetchProfile, updateProfile } from '../../api/profileApi';
import type { Profile as ProfileType } from '../../account/types/profile.types';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileType>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProfile();
        setProfile(data);
        setFormData(data);
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      setError(null);
      const updated = await updateProfile({ ...formData, id: profile.id });
      setProfile(updated);
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
        <p className="text-center text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
        <p className="text-center text-red-600">No profile data available.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Profile</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block font-medium text-gray-700 mb-1">Bio</label>
        {editing ? (
          <textarea
            name="bio"
            value={formData.bio || ''}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Tell us about yourself..."
            disabled={saving}
          />
        ) : (
          <p className="text-gray-900">{profile.bio || '-'}</p>
        )}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">Location</label>
        {editing ? (
          <input
            type="text"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="City, Country"
            disabled={saving}
          />
        ) : (
          <p className="text-gray-900">{profile.location || '-'}</p>
        )}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">Phone</label>
        {editing ? (
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+1 (555) 000-0000"
            disabled={saving}
          />
        ) : (
          <p className="text-gray-900">{profile.phone || '-'}</p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        {editing ? (
          <>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              onClick={handleCancel}
              disabled={saving}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </>
        ) : (
          <button 
            onClick={() => setEditing(true)} 
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;