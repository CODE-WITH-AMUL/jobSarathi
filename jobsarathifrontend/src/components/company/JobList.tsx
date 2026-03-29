import React from 'react';
import type { CompanyJob } from '../../api/companyDashboardApi';
import JobCard from './JobCard';

interface JobListProps {
  jobs: CompanyJob[];
  loading: boolean;
  actionJobId: number | null;
  actionType: 'delete' | 'toggle' | null;
  onEdit: (job: CompanyJob) => void;
  onDelete: (jobId: number) => void;
  onToggleStatus: (jobId: number) => void;
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  loading,
  actionJobId,
  actionType,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h3 className="text-lg font-semibold text-slate-800">No jobs posted yet</h3>
        <p className="mt-2 text-sm text-slate-500">
          Create your first job in the Post Job section to start receiving applicants.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          actionInProgress={actionJobId === job.id ? actionType : null}
        />
      ))}
    </div>
  );
};

export default JobList;
