import React, { useEffect, useMemo, useState } from 'react';
import {
  EXPERIENCE_LEVEL_OPTIONS,
  JOB_TYPE_OPTIONS,
  type CompanyJob,
  type CompanyJobPayload,
  type ExperienceLevel,
  type JobType,
} from '../../api/companyDashboardApi';

interface JobFormProps {
  mode: 'create' | 'edit';
  initialJob?: CompanyJob | null;
  submitting: boolean;
  onSubmit: (payload: CompanyJobPayload) => Promise<void>;
  onCancel?: () => void;
}

interface JobFormValues {
  job_title: string;
  description: string;
  salary_min: string;
  salary_max: string;
  job_type: JobType;
  location_city: string;
  location_state: string;
  location_country: string;
  experience_level: ExperienceLevel;
  expiration_date: string;
}

interface JobFormErrors {
  job_title?: string;
  description?: string;
  salary_min?: string;
  salary_max?: string;
  location_city?: string;
  location_country?: string;
  skills_required?: string;
}

const getInitialValues = (job?: CompanyJob | null): JobFormValues => {
  return {
    job_title: job?.job_title || '',
    description: job?.description || '',
    salary_min: job?.salary_min || '',
    salary_max: job?.salary_max || '',
    job_type: job?.job_type || 'Full Time',
    location_city: job?.location_city || '',
    location_state: job?.location_state || '',
    location_country: job?.location_country || 'Nepal',
    experience_level: job?.experience_level || 'Any',
    expiration_date: job?.expiration_date || '',
  };
};

const parseSkills = (skillsRaw?: string): string[] => {
  if (!skillsRaw) {
    return [];
  }
  return skillsRaw
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
};

const JobForm: React.FC<JobFormProps> = ({ mode, initialJob, submitting, onSubmit, onCancel }) => {
  const [values, setValues] = useState<JobFormValues>(getInitialValues(initialJob));
  const [skills, setSkills] = useState<string[]>(parseSkills(initialJob?.skills_required));
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<JobFormErrors>({});

  useEffect(() => {
    setValues(getInitialValues(initialJob));
    setSkills(parseSkills(initialJob?.skills_required));
    setSkillInput('');
    setErrors({});
  }, [initialJob]);

  const title = useMemo(
    () => (mode === 'create' ? 'Post a New Job' : `Edit Job: ${initialJob?.job_title || ''}`),
    [initialJob?.job_title, mode],
  );

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const addSkill = () => {
    const cleaned = skillInput.trim();
    if (!cleaned) {
      return;
    }
    if (skills.some((skill) => skill.toLowerCase() === cleaned.toLowerCase())) {
      setSkillInput('');
      return;
    }
    setSkills((prev) => [...prev, cleaned]);
    setSkillInput('');
    setErrors((prev) => ({ ...prev, skills_required: undefined }));
  };

  const handleSkillKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const validate = (): boolean => {
    const nextErrors: JobFormErrors = {};

    if (!values.job_title.trim()) {
      nextErrors.job_title = 'Job title is required.';
    }
    if (!values.description.trim()) {
      nextErrors.description = 'Job description is required.';
    }
    if (!values.location_city.trim()) {
      nextErrors.location_city = 'Location is required.';
    }
    if (!values.location_country.trim()) {
      nextErrors.location_country = 'Country is required.';
    }

    const minSalary = Number(values.salary_min);
    const maxSalary = Number(values.salary_max);

    if (!values.salary_min || Number.isNaN(minSalary) || minSalary < 0) {
      nextErrors.salary_min = 'Enter a valid minimum salary.';
    }

    if (!values.salary_max || Number.isNaN(maxSalary) || maxSalary < 0) {
      nextErrors.salary_max = 'Enter a valid maximum salary.';
    }

    if (!nextErrors.salary_min && !nextErrors.salary_max && minSalary > maxSalary) {
      nextErrors.salary_max = 'Maximum salary must be greater than or equal to minimum salary.';
    }

    if (skills.length === 0) {
      nextErrors.skills_required = 'Add at least one required skill.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      job_title: values.job_title.trim(),
      description: values.description.trim(),
      location_city: values.location_city.trim(),
      location_state: values.location_state.trim(),
      location_country: values.location_country.trim(),
      job_type: values.job_type,
      experience_level: values.experience_level,
      skills_required: skills,
      salary_min: Number(values.salary_min),
      salary_max: Number(values.salary_max),
      expiration_date: values.expiration_date || null,
    });

    if (mode === 'create') {
      setValues(getInitialValues(null));
      setSkills([]);
      setSkillInput('');
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mb-6 text-sm text-slate-500">
        Fill all required fields before submitting the job post.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="job_title" className="mb-1 block text-sm font-medium text-slate-700">
            Job Title
          </label>
          <input
            id="job_title"
            name="job_title"
            value={values.job_title}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Senior Frontend Engineer"
          />
          {errors.job_title && <p className="mt-1 text-xs text-red-600">{errors.job_title}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
            Job Description
          </label>
          <textarea
            id="description"
            name="description"
            value={values.description}
            onChange={handleInputChange}
            rows={5}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Describe responsibilities, qualifications, and benefits"
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="salary_min" className="mb-1 block text-sm font-medium text-slate-700">
            Minimum Salary
          </label>
          <input
            id="salary_min"
            name="salary_min"
            type="number"
            min="0"
            value={values.salary_min}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="50000"
          />
          {errors.salary_min && <p className="mt-1 text-xs text-red-600">{errors.salary_min}</p>}
        </div>

        <div>
          <label htmlFor="salary_max" className="mb-1 block text-sm font-medium text-slate-700">
            Maximum Salary
          </label>
          <input
            id="salary_max"
            name="salary_max"
            type="number"
            min="0"
            value={values.salary_max}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="120000"
          />
          {errors.salary_max && <p className="mt-1 text-xs text-red-600">{errors.salary_max}</p>}
        </div>

        <div>
          <label htmlFor="job_type" className="mb-1 block text-sm font-medium text-slate-700">
            Job Type
          </label>
          <select
            id="job_type"
            name="job_type"
            value={values.job_type}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            {JOB_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="experience_level" className="mb-1 block text-sm font-medium text-slate-700">
            Experience Level
          </label>
          <select
            id="experience_level"
            name="experience_level"
            value={values.experience_level}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            {EXPERIENCE_LEVEL_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location_city" className="mb-1 block text-sm font-medium text-slate-700">
            Location
          </label>
          <input
            id="location_city"
            name="location_city"
            value={values.location_city}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Kathmandu"
          />
          {errors.location_city && <p className="mt-1 text-xs text-red-600">{errors.location_city}</p>}
        </div>

        <div>
          <label htmlFor="location_country" className="mb-1 block text-sm font-medium text-slate-700">
            Country
          </label>
          <input
            id="location_country"
            name="location_country"
            value={values.location_country}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Nepal"
          />
          {errors.location_country && <p className="mt-1 text-xs text-red-600">{errors.location_country}</p>}
        </div>

        <div>
          <label htmlFor="location_state" className="mb-1 block text-sm font-medium text-slate-700">
            State (Optional)
          </label>
          <input
            id="location_state"
            name="location_state"
            value={values.location_state}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Bagmati"
          />
        </div>

        <div>
          <label htmlFor="expiration_date" className="mb-1 block text-sm font-medium text-slate-700">
            Expiration Date (Optional)
          </label>
          <input
            id="expiration_date"
            name="expiration_date"
            type="date"
            value={values.expiration_date}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="skills_input" className="mb-1 block text-sm font-medium text-slate-700">
            Required Skills
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
                id="skills_input"
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={handleSkillKeyDown}
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
          {errors.skills_required && <p className="mt-1 text-xs text-red-600">{errors.skills_required}</p>}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        {mode === 'edit' && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving...' : mode === 'create' ? 'Post Job' : 'Update Job'}
        </button>
      </div>
    </form>
  );
};

export default JobForm;
