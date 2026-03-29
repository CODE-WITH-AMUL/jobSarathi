import React from 'react';
import { Bookmark, BookmarkCheck, X } from 'lucide-react';
import type { CandidateJob } from '../../api/candidateDashboardApi';

interface JobDetailsModalProps {
  open: boolean;
  job: CandidateJob | null;
  alreadyApplied: boolean;
  applying: boolean;
  saved: boolean;
  saving: boolean;
  onClose: () => void;
  onApply: (job: CandidateJob) => void;
  onToggleSave: (job: CandidateJob) => void;
}

const formatSalary = (salaryMin: string, salaryMax: string): string => {
  const min = Number(salaryMin);
  const max = Number(salaryMax);

  if (Number.isFinite(min) && Number.isFinite(max)) {
    return `${min.toLocaleString()} - ${max.toLocaleString()}`;
  }

  return `${salaryMin} - ${salaryMax}`;
};

const parseSkills = (skillsRaw: string): string[] => {
  return skillsRaw
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
};

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  open,
  job,
  alreadyApplied,
  applying,
  saved,
  saving,
  onClose,
  onApply,
  onToggleSave,
}) => {
  if (!open || !job) {
    return null;
  }

  const skills = parseSkills(job.skills_required || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{job.job_title}</h2>
            <p className="mt-1 text-sm text-slate-600">{job.company_name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-2">
          <p>
            <span className="font-semibold">Location:</span> {job.location_city}, {job.location_country}
          </p>
          <p>
            <span className="font-semibold">Job Type:</span> {job.job_type}
          </p>
          <p>
            <span className="font-semibold">Salary:</span> {formatSalary(job.salary_min, job.salary_max)}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {job.job_status}
          </p>
        </div>

        <div className="mt-5">
          <h3 className="text-base font-semibold text-slate-900">Job Description</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{job.description}</p>
        </div>

        {skills.length > 0 && (
          <div className="mt-5">
            <h3 className="text-base font-semibold text-slate-900">Required Skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => onToggleSave(job)}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saved ? <BookmarkCheck size={16} className="text-indigo-600" /> : <Bookmark size={16} />}
            {saved ? 'Saved' : 'Save Job'}
          </button>
          <button
            type="button"
            onClick={() => onApply(job)}
            disabled={alreadyApplied || applying}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {alreadyApplied ? 'Already Applied' : applying ? 'Applying...' : 'Apply Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
