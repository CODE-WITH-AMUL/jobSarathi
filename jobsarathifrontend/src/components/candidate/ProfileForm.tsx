import React, { useEffect, useMemo, useState } from 'react';
import type {
  CandidateProfileData,
  CandidateProfilePayload,
} from '../../api/candidateDashboardApi';

interface ProfileFormProps {
  profile: CandidateProfileData | null;
  loading: boolean;
  saving: boolean;
  onSubmit: (payload: CandidateProfilePayload) => Promise<void>;
}

interface FormState {
  full_name: string;
  phone: string;
  location: string;
  experience: string;
  education: string;
}

const defaultForm: FormState = {
  full_name: '',
  phone: '',
  location: '',
  experience: '',
  education: '',
};

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, loading, saving, onSubmit }) => {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (!profile) {
      setForm(defaultForm);
      setSkills([]);
      setResumeFile(null);
      return;
    }

    setForm({
      full_name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
      phone: profile.phone || '',
      location: profile.location || '',
      experience: profile.experience || '',
      education: profile.education || '',
    });
    setSkills(Array.isArray(profile.skills) ? profile.skills : []);
    setResumeFile(null);
  }, [profile]);

  const resumeLabel = useMemo(() => {
    if (resumeFile) {
      return resumeFile.name;
    }

    if (profile?.resume_url) {
      const parts = profile.resume_url.split('/');
      return parts[parts.length - 1] || 'Current Resume';
    }

    return 'No resume uploaded';
  }, [profile?.resume_url, resumeFile]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) {
      return;
    }

    if (skills.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setSkillInput('');
      return;
    }

    setSkills((prev) => [...prev, value]);
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const handleSkillInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addSkill();
    }
  };

  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setResumeFile(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      skills,
      experience: form.experience.trim(),
      education: form.education.trim(),
      resumeFile,
    });
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="space-y-3">
          <div className="h-11 animate-pulse rounded bg-slate-100" />
          <div className="h-11 animate-pulse rounded bg-slate-100" />
          <div className="h-24 animate-pulse rounded bg-slate-100" />
          <div className="h-24 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-xl font-semibold text-slate-900">Candidate Profile</h2>
      <p className="mb-6 text-sm text-slate-500">
        Keep your profile updated so companies can evaluate your applications quickly.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Your full name"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            value={profile?.email || ''}
            readOnly
            className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="98XXXXXXXX"
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
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Kathmandu, Nepal"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="skills" className="mb-1 block text-sm font-medium text-slate-700">
            Skills
          </label>
          <div className="rounded-lg border border-slate-300 p-2">
            <div className="mb-2 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  {skill} x
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                id="skills"
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={handleSkillInputKeyDown}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="Type a skill and press Enter"
              />
              <button
                type="button"
                onClick={addSkill}
                className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="experience" className="mb-1 block text-sm font-medium text-slate-700">
            Experience
          </label>
          <textarea
            id="experience"
            name="experience"
            value={form.experience}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Summarize your experience"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="education" className="mb-1 block text-sm font-medium text-slate-700">
            Education
          </label>
          <textarea
            id="education"
            name="education"
            value={form.education}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Add your education details"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="resume" className="mb-1 block text-sm font-medium text-slate-700">
            Resume Upload (PDF)
          </label>
          <input
            id="resume"
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleResumeChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-indigo-600"
          />
          <p className="mt-2 text-xs text-slate-500">Current: {resumeLabel}</p>
          {profile?.resume_url && (
            <a
              href={profile.resume_url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-xs font-medium text-indigo-600 hover:underline"
            >
              Preview Uploaded Resume
            </a>
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
