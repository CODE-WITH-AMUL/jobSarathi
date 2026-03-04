// src/components/candidate/Profile.tsx
import React, { useEffect, useState } from 'react';
import { fetchProfile , updateProfile } from '../../api/profileApi';
import type { Profile as ProfileType  } from '../../account/types/profile.types';
import { fetchP}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileType>>({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setProfile(data);
        setFormData(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      const updated = await updateProfile({ ...formData, id: profile.id });
      setProfile(updated);
      setEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold">Profile</h2>

      <div>
        <label className="block font-medium">Bio</label>
        {editing ? (
          <textarea
            name="bio"
            value={formData.bio || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        ) : (
          <p>{profile.bio || '-'}</p>
        )}
      </div>

      <div>
        <label className="block font-medium">Location</label>
        {editing ? (
          <input
            type="text"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        ) : (
          <p>{profile.location || '-'}</p>
        )}
      </div>

      <div>
        <label className="block font-medium">Phone</label>
        {editing ? (
          <input
            type="text"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        ) : (
          <p>{profile.phone || '-'}</p>
        )}
      </div>

      <div className="flex gap-2">
        {editing ? (
          <>
            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
              Save
            </button>
            <button onClick={() => setEditing(false)} className="bg-gray-300 px-4 py-2 rounded">
              Cancel
            </button>
          </>
        ) : (
          <button onClick={() => setEditing(true)} className="bg-green-500 text-white px-4 py-2 rounded">
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;