import React from 'react';
import type { JobApplication } from '../../types/candidate';

interface RecentApplicationsProps {
	applications: JobApplication[];
}

const STATUS_STYLES: Record<JobApplication['status'], string> = {
	pending: 'bg-amber-50 text-amber-700',
	reviewed: 'bg-blue-50 text-blue-700',
	shortlisted: 'bg-emerald-50 text-emerald-700',
	rejected: 'bg-red-50 text-red-700',
	offered: 'bg-violet-50 text-violet-700',
};

const STATUS_LABELS: Record<JobApplication['status'], string> = {
	pending: 'Pending',
	reviewed: 'Reviewed',
	shortlisted: 'Shortlisted',
	rejected: 'Rejected',
	offered: 'Offered',
};

const formatDate = (dateValue: string): string => {
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) {
		return '-';
	}
	return date.toLocaleDateString();
};

export const RecentApplications: React.FC<RecentApplicationsProps> = ({ applications }) => {
	if (applications.length === 0) {
		return (
			<section className="rounded-2xl border border-slate-200 bg-white p-6">
				<h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
				<p className="mt-1 text-sm text-slate-500">No applications yet. Start applying to jobs to track progress.</p>
			</section>
		);
	}

	return (
		<section className="rounded-2xl border border-slate-200 bg-white p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
				<span className="text-xs text-slate-500">{applications.length} records</span>
			</div>

			<div className="space-y-3">
				{applications.slice(0, 5).map((application) => (
					<article key={application.id} className="rounded-xl border border-slate-100 p-4">
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div>
								<h3 className="text-sm font-semibold text-slate-900">{application.job.title}</h3>
								<p className="mt-1 text-xs text-slate-500">{application.job.company.name}</p>
								<p className="mt-1 text-xs text-slate-400">Applied: {formatDate(application.applied_at)}</p>
							</div>

							<div className="text-right">
								<span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[application.status]}`}>
									{STATUS_LABELS[application.status]}
								</span>
								{application.match_score > 0 && (
									<p className="mt-1 text-xs text-slate-500">Match: {application.match_score}%</p>
								)}
							</div>
						</div>
					</article>
				))}
			</div>
		</section>
	);
};
