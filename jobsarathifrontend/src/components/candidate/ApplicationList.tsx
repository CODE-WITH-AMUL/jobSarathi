import React from 'react';
import {
  toDisplayApplicationStatus,
  type CandidateApplication,
} from '../../api/candidateDashboardApi';

interface ApplicationListProps {
  applications: CandidateApplication[];
  loading: boolean;
}

const getStatusClasses = (status: 'Pending' | 'Accepted' | 'Rejected'): string => {
  if (status === 'Accepted') {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (status === 'Rejected') {
    return 'bg-red-100 text-red-700';
  }
  return 'bg-amber-100 text-amber-700';
};

const formatDate = (value?: string): string => {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
};

const ApplicationList: React.FC<ApplicationListProps> = ({ applications, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h3 className="text-lg font-semibold text-slate-800">No applications yet</h3>
        <p className="mt-2 text-sm text-slate-500">
          Browse jobs and apply to start tracking your application statuses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((application) => {
        const status = toDisplayApplicationStatus(application.status);
        return (
          <article
            key={application.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{application.job_title}</h3>
                <p className="mt-1 text-sm text-slate-600">{application.company_name}</p>
                <p className="mt-1 text-xs text-slate-500">Applied: {formatDate(application.applied_date || application.created_at)}</p>
              </div>

              <div className="text-right">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(status)}`}>
                  {status}
                </span>
                {application.location && (
                  <p className="mt-2 text-xs text-slate-500">{application.location}</p>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default ApplicationList;
