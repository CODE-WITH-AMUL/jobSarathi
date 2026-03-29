import React from 'react';
import { Bookmark, BookmarkCheck, Building2, MapPin } from 'lucide-react';
import type { CandidateJob } from '../../api/candidateDashboardApi';

interface JobCardProps {
  job: CandidateJob;
  alreadyApplied: boolean;
  saved: boolean;
  applying: boolean;
  saving: boolean;
  onViewDetails: (job: CandidateJob) => void;
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
    .filter(Boolean)
    .slice(0, 4);
};

const JobCard: React.FC<JobCardProps> = ({
  job,
  alreadyApplied,
  saved,
  applying,
  saving,
  onViewDetails,
  onApply,
  onToggleSave,
}) => {
  const skills = parseSkills(job.skills_required || '');

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-900">{job.job_title}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <Building2 size={15} />
            {job.company_name}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={15} />
            {job.location_city}, {job.location_country}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggleSave(job)}
          disabled={saving}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={saved ? 'Remove saved job' : 'Save job'}
        >
          {saved ? <BookmarkCheck size={18} className="text-indigo-600" /> : <Bookmark size={18} />}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">{job.job_type}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
          Salary: {formatSalary(job.salary_min, job.salary_max)}
        </span>
        {alreadyApplied && (
          <span className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700">
            Already Applied
          </span>
        )}
      </div>

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(job)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          View Details
        </button>
        <button
          type="button"
          onClick={() => onApply(job)}
          disabled={alreadyApplied || applying}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {alreadyApplied ? 'Applied' : applying ? 'Applying...' : 'Apply Now'}
        </button>
      </div>
    </article>
  );
};

export default JobCard;
