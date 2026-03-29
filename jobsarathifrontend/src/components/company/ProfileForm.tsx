import React, { useEffect, useMemo, useState } from 'react';
import {
  INDUSTRY_TYPE_OPTIONS,
  type CompanyProfile,
  type CompanyProfilePayload,
  type IndustryType,
} from '../../api/companyDashboardApi';

interface ProfileFormProps {
  profile: CompanyProfile | null;
  loading: boolean;
  saving: boolean;
  onSubmit: (payload: CompanyProfilePayload) => Promise<void>;
}

interface ProfileFormState {
  name: string;
  description: string;
  location: string;
  website: string;
  industry_type: IndustryType | '';
}

const getAbsoluteMediaUrl = (path: string | null): string | null => {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const rawBase = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
  const base = String(rawBase).replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const defaultState: ProfileFormState = {
  name: '',
  description: '',
  location: '',
  website: '',
  industry_type: '',
};

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, loading, saving, onSubmit }) => {
  const [form, setForm] = useState<ProfileFormState>(defaultState);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const serverLogoUrl = useMemo(() => getAbsoluteMediaUrl(profile?.logo ?? null), [profile?.logo]);

  useEffect(() => {
    if (!profile) {
      setForm(defaultState);
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    setForm({
      name: profile.name || '',
      description: profile.description || '',
      location: profile.location || '',
      website: profile.website || '',
      industry_type: profile.industry_type || '',
    });
    setLogoFile(null);
    setLogoPreview(null);
  }, [profile]);

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      ...form,
      logoFile,
    });
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-6 w-52 animate-pulse rounded bg-slate-200" />
        <div className="space-y-3">
          <div className="h-11 animate-pulse rounded bg-slate-100" />
          <div className="h-24 animate-pulse rounded bg-slate-100" />
          <div className="h-11 animate-pulse rounded bg-slate-100" />
          <div className="h-11 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-1 text-xl font-semibold text-slate-900">Company Profile</h2>
      <p className="mb-6 text-sm text-slate-500">
        Update your public company details. Email is read-only and comes from your account.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Company Name
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Your company name"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            value={profile?.user_email || ''}
            readOnly
            className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
            Company Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Tell candidates about your company"
          />
        </div>

        <div>
          <label htmlFor="location" className="mb-1 block text-sm font-medium text-slate-700">
            Location
          </label>
          <input
            id="location"
            name="location"
            value={form.location}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="City, Country"
          />
        </div>

        <div>
          <label htmlFor="website" className="mb-1 block text-sm font-medium text-slate-700">
            Website URL
          </label>
          <input
            id="website"
            name="website"
            type="url"
            value={form.website}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label htmlFor="industry_type" className="mb-1 block text-sm font-medium text-slate-700">
            Industry Type
          </label>
          <select
            id="industry_type"
            name="industry_type"
            value={form.industry_type}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Select industry</option>
            {INDUSTRY_TYPE_OPTIONS.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="logo" className="mb-1 block text-sm font-medium text-slate-700">
            Company Logo
          </label>
          <input
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-indigo-600"
          />
          {(logoPreview || serverLogoUrl) && (
            <div className="mt-3">
              <img
                src={logoPreview || serverLogoUrl || ''}
                alt="Company logo preview"
                className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
