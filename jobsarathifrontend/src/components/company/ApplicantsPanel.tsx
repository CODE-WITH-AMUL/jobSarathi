import React, { useEffect, useMemo, useState } from 'react';
import type {
  CompanyApplication,
  CompanyApplicationReviewPayload,
  CompanyJob,
} from '../../api/companyDashboardApi';

interface ApplicantsPanelProps {
  applications: CompanyApplication[];
  jobs: CompanyJob[];
  onReview: (applicationId: number, payload: CompanyApplicationReviewPayload) => Promise<void>;
}

const STATUS_LABELS: Record<string, string> = {
  applied: 'Applied',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  selected: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const STATUS_STYLES: Record<string, string> = {
  applied: 'bg-slate-100 text-slate-700',
  under_review: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  selected: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-600',
};

const getDisplayStatus = (status: string) => STATUS_LABELS[status] || status;

const ApplicantsPanel: React.FC<ApplicantsPanelProps> = ({ applications, jobs, onReview }) => {
  const [jobFilter, setJobFilter] = useState<number | 'all'>('all');
  const [query, setQuery] = useState('');
  const [statusActionId, setStatusActionId] = useState<number | null>(null);
  const [noteActionId, setNoteActionId] = useState<number | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});

  useEffect(() => {
    const nextDrafts: Record<number, string> = {};
    applications.forEach((application) => {
      nextDrafts[application.id] = application.resume_analysis || '';
    });
    setNoteDrafts(nextDrafts);
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return applications.filter((application) => {
      if (jobFilter !== 'all' && application.job !== jobFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchable = [
        application.candidate_name,
        application.candidate_email,
        application.job_title,
        application.phone,
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [applications, jobFilter, query]);

  const formatDate = (dateValue: string) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleString();
  };

  const onStatusChange = async (
    applicationId: number,
    status: CompanyApplicationReviewPayload['status'],
  ) => {
    if (!status) {
      return;
    }

    setStatusActionId(applicationId);
    try {
      await onReview(applicationId, { status });
    } finally {
      setStatusActionId(null);
    }
  };

  const onSaveNote = async (applicationId: number) => {
    setNoteActionId(applicationId);
    try {
      await onReview(applicationId, { notes: noteDrafts[applicationId] || '' });
    } finally {
      setNoteActionId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Applicant Management</h2>
        <span className="text-xs text-slate-500">{filteredApplications.length} applicants</span>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, email, job..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={jobFilter}
          onChange={(event) => {
            const value = event.target.value;
            setJobFilter(value === 'all' ? 'all' : Number(value));
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">All Jobs</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.job_title}
            </option>
          ))}
        </select>
      </div>

      {filteredApplications.length === 0 ? (
        <p className="text-sm text-slate-500">No applicants found for current filters.</p>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const resumeLink = application.resume_url || application.candidate_resume_url;
            const statusStyle = STATUS_STYLES[application.status] || 'bg-slate-100 text-slate-700';

            return (
              <article key={application.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{application.candidate_name}</h3>
                    <p className="mt-1 text-xs text-slate-500">{application.candidate_email}</p>
                    <p className="mt-1 text-xs text-slate-500">{application.phone || 'Phone not available'}</p>
                    <p className="mt-1 text-xs text-slate-400">Applied: {formatDate(application.applied_date)}</p>
                  </div>

                  <div className="text-right">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}>
                      {getDisplayStatus(application.status)}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">{application.job_title}</p>
                    <p className="text-xs text-slate-400">{application.location || 'Location N/A'}</p>
                  </div>
                </div>

                {application.candidate_headline && (
                  <p className="mt-3 text-xs font-medium text-slate-700">{application.candidate_headline}</p>
                )}

                {application.candidate_summary && (
                  <p className="mt-2 line-clamp-3 text-xs text-slate-600">{application.candidate_summary}</p>
                )}

                {application.candidate_skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {application.candidate_skills.slice(0, 12).map((skill) => (
                      <span key={`${application.id}-${skill}`} className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {application.cover_letter && (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cover Letter</p>
                    <p className="mt-1 line-clamp-4 text-xs text-slate-700">{application.cover_letter}</p>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {resumeLink ? (
                    <a
                      href={resumeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View Resume
                    </a>
                  ) : (
                    <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-400">
                      Resume not uploaded
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => onStatusChange(application.id, 'under_review')}
                    disabled={statusActionId === application.id}
                    className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                  >
                    Review
                  </button>
                  <button
                    type="button"
                    onClick={() => onStatusChange(application.id, 'shortlisted')}
                    disabled={statusActionId === application.id}
                    className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    onClick={() => onStatusChange(application.id, 'selected')}
                    disabled={statusActionId === application.id}
                    className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => onStatusChange(application.id, 'rejected')}
                    disabled={statusActionId === application.id}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>

                <div className="mt-3">
                  <label htmlFor={`note-${application.id}`} className="mb-1 block text-xs font-medium text-slate-600">
                    Applicant Notes
                  </label>
                  <textarea
                    id={`note-${application.id}`}
                    value={noteDrafts[application.id] || ''}
                    onChange={(event) =>
                      setNoteDrafts((prev) => ({ ...prev, [application.id]: event.target.value }))
                    }
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                    placeholder="Add private notes about this applicant"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onSaveNote(application.id)}
                      disabled={noteActionId === application.id}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {noteActionId === application.id ? 'Saving...' : 'Save Note'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ApplicantsPanel;
