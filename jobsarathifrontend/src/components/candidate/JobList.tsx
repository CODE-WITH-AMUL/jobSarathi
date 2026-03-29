import React from 'react';
import type { CandidateJob } from '../../api/candidateDashboardApi';
import JobCard from './JobCard';

interface JobListProps {
  jobs: CandidateJob[];
  loading: boolean;
  appliedJobIds: Set<number>;
  savedJobIds: Set<number>;
  applyingJobId: number | null;
  savingJobId: number | null;
  onViewDetails: (job: CandidateJob) => void;
  onApply: (job: CandidateJob) => void;
  onToggleSave: (job: CandidateJob) => void;
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  loading,
  appliedJobIds,
  savedJobIds,
  applyingJobId,
  savingJobId,
  onViewDetails,
  onApply,
  onToggleSave,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h3 className="text-lg font-semibold text-slate-800">No jobs found</h3>
        <p className="mt-2 text-sm text-slate-500">
          Try updating your search or filters to discover more opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          alreadyApplied={appliedJobIds.has(job.id)}
          saved={savedJobIds.has(job.id)}
          applying={applyingJobId === job.id}
          saving={savingJobId === job.id}
          onViewDetails={onViewDetails}
          onApply={onApply}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
};

export default JobList;
