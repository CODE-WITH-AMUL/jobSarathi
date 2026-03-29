import React from 'react';
import type { CompanyJob } from '../../api/companyDashboardApi';

interface JobCardProps {
  job: CompanyJob;
  onEdit: (job: CompanyJob) => void;
  onDelete: (jobId: number) => void;
  onToggleStatus: (jobId: number) => void;
  actionInProgress?: 'delete' | 'toggle' | null;
}

const formatSalaryRange = (min: string, max: string): string => {
  const minValue = Number(min);
  const maxValue = Number(max);

  if (Number.isFinite(minValue) && Number.isFinite(maxValue)) {
    return `${minValue.toLocaleString()} - ${maxValue.toLocaleString()}`;
  }

  return `${min} - ${max}`;
};

const JobCard: React.FC<JobCardProps> = ({
  job,
  onEdit,
  onDelete,
  onToggleStatus,
  actionInProgress,
}) => {
  const isOpen = job.job_status === 'Open';

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{job.job_title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {job.location_city}, {job.location_country}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            Salary: {formatSalaryRange(job.salary_min, job.salary_max)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
              {job.job_type}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
              {job.experience_level}
            </span>
            <span
              className={`rounded-full px-2 py-1 font-semibold ${
                isOpen
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isOpen ? 'Active' : 'Closed'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit(job)}
            className="rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Edit Job
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(job.id)}
            disabled={actionInProgress === 'toggle'}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionInProgress === 'toggle' ? 'Updating...' : isOpen ? 'Close Job' : 'Activate Job'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(job.id)}
            disabled={actionInProgress === 'delete'}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionInProgress === 'delete' ? 'Deleting...' : 'Delete Job'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default JobCard;
