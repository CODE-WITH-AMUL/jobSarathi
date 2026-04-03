// components/candidate/RecommendedJobs.tsx
import React, { useState } from 'react';
import { Building2, MapPin, Briefcase, Bookmark, BookmarkCheck, Clock, TrendingUp } from 'lucide-react';
import type { Job } from '../../types/candidate';
import { candidateAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';

interface RecommendedJobsProps {
  jobs: Job[];
  onJobUpdate: () => void;
}

export const RecommendedJobs: React.FC<RecommendedJobsProps> = ({ jobs, onJobUpdate }) => {
  const [savingJobs, setSavingJobs] = useState<Set<number>>(new Set());
  const [applyingJobs, setApplyingJobs] = useState<Set<number>>(new Set());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applyError, setApplyError] = useState('');
  const { showToast } = useToast();

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (!error || typeof error !== 'object') {
      return fallback;
    }

    const maybeError = error as { response?: { data?: unknown }; message?: string };
    const data = maybeError.response?.data;

    if (typeof data === 'string') {
      return data;
    }

    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (typeof record.detail === 'string') {
        return record.detail;
      }
      if (typeof record.message === 'string') {
        return record.message;
      }

      for (const value of Object.values(record)) {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
          return value[0];
        }
        if (typeof value === 'string') {
          return value;
        }
      }
    }

    return maybeError.message || fallback;
  };

  const handleSaveJob = async (jobId: number, isSaved: boolean) => {
    setSavingJobs(prev => new Set(prev).add(jobId));
    try {
      if (isSaved) {
        await candidateAPI.unsaveJob(jobId);
        showToast('Job removed from saved', 'success');
      } else {
        await candidateAPI.saveJob(jobId);
        showToast('Job saved successfully', 'success');
      }
      onJobUpdate();
    } catch (error) {
      showToast('Failed to update saved job', 'error');
    } finally {
      setSavingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleApplyJob = async (
    jobId: number,
    payload: { coverLetter?: string; resumeFile?: File | null } = {},
  ): Promise<boolean> => {
    setApplyingJobs((prev) => new Set(prev).add(jobId));
    try {
      await candidateAPI.applyToJob(jobId, payload);
      showToast('Application submitted successfully', 'success');
      onJobUpdate();
      return true;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to apply for this job');
      showToast(message, 'error');
      setApplyError(message);
      return false;
    } finally {
      setApplyingJobs((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  const openApplyModal = (job: Job) => {
    setSelectedJob(job);
    setCoverLetter('');
    setResumeFile(null);
    setApplyError('');
  };

  const closeApplyModal = () => {
    setSelectedJob(null);
    setCoverLetter('');
    setResumeFile(null);
    setApplyError('');
  };

  const handleSubmitManualApply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedJob) {
      return;
    }

    if (!resumeFile) {
      setApplyError('Please upload your resume to continue.');
      return;
    }

    setApplyError('');
    const success = await handleApplyJob(selectedJob.id, {
      coverLetter,
      resumeFile,
    });

    if (success) {
      closeApplyModal();
    }
  };

  const getTimeAgo = (date: string) => {
    const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 3600 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)} weeks ago`;
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recommended for you</h2>
            <p className="text-sm text-gray-500 mt-0.5">Based on your skills and profile</p>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Briefcase size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No recommended jobs at the moment</p>
            <p className="text-sm text-gray-400 mt-1">Complete your profile for better recommendations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="group bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{job.title}</h3>
                      {job.match_score && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          <TrendingUp size={10} />
                          {job.match_score}% match
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Building2 size={14} />
                        {job.company.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={14} />
                        {job.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {getTimeAgo(job.posted_at)}
                      </span>
                      <span>
                        {job.salary_min && job.salary_max 
                          ? `${job.currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                          : 'Salary not disclosed'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveJob(job.id, job.is_saved);
                      }}
                      disabled={savingJobs.has(job.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {savingJobs.has(job.id) ? (
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                      ) : job.is_saved ? (
                        <BookmarkCheck size={18} className="text-blue-500 fill-blue-500" />
                      ) : (
                        <Bookmark size={18} className="text-gray-400 group-hover:text-gray-600" />
                      )}
                    </button>
                    {job.has_applied ? (
                      <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">
                        Applied
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openApplyModal(job);
                        }}
                        disabled={applyingJobs.has(job.id)}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Easy Apply
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeApplyModal}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Easy Apply</h3>
              <p className="mt-1 text-sm text-slate-600">
                {selectedJob.title} at {selectedJob.company.name}
              </p>
            </div>

            <form onSubmit={handleSubmitManualApply} className="space-y-4 px-6 py-5">
              <div>
                <label htmlFor="resume_upload" className="mb-1 block text-sm font-medium text-slate-700">
                  Upload Resume
                </label>
                <input
                  id="resume_upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setResumeFile(file);
                    setApplyError('');
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-xs file:font-medium file:text-indigo-700"
                />
                <p className="mt-1 text-xs text-slate-500">PDF, DOC, or DOCX up to 5MB.</p>
              </div>

              <div>
                <label htmlFor="cover_letter" className="mb-1 block text-sm font-medium text-slate-700">
                  Cover Letter (Optional)
                </label>
                <textarea
                  id="cover_letter"
                  rows={5}
                  value={coverLetter}
                  onChange={(event) => setCoverLetter(event.target.value)}
                  placeholder="Briefly explain why you are a strong fit for this role."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {applyError && <p className="text-sm text-red-600">{applyError}</p>}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeApplyModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyingJobs.has(selectedJob.id)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {applyingJobs.has(selectedJob.id) ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
};