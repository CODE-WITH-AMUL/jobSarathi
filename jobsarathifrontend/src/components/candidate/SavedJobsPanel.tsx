import React, { useState } from 'react';
import { BookmarkCheck, Trash2 } from 'lucide-react';
import type { Job } from '../../types/candidate';
import { candidateAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';

interface SavedJobsPanelProps {
	jobs: Job[];
	onJobUpdate: () => void;
}

export const SavedJobsPanel: React.FC<SavedJobsPanelProps> = ({ jobs, onJobUpdate }) => {
	const [removingJobId, setRemovingJobId] = useState<number | null>(null);
	const { showToast } = useToast();

	const handleRemove = async (jobId: number) => {
		setRemovingJobId(jobId);
		try {
			await candidateAPI.unsaveJob(jobId);
			showToast('Removed from saved jobs', 'success');
			onJobUpdate();
		} catch {
			showToast('Failed to remove saved job', 'error');
		} finally {
			setRemovingJobId(null);
		}
	};

	return (
		<section className="rounded-2xl border border-slate-200 bg-white p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-slate-900">Saved Jobs</h2>
				<span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
					<BookmarkCheck size={12} />
					{jobs.length}
				</span>
			</div>

			{jobs.length === 0 ? (
				<p className="text-sm text-slate-500">No saved jobs yet.</p>
			) : (
				<div className="space-y-3">
					{jobs.slice(0, 5).map((job) => (
						<article key={job.id} className="rounded-xl border border-slate-100 p-3">
							<div className="flex items-start justify-between gap-2">
								<div className="min-w-0">
									<h3 className="truncate text-sm font-semibold text-slate-900">{job.title}</h3>
									<p className="mt-1 truncate text-xs text-slate-500">{job.company.name}</p>
								</div>

								<button
									type="button"
									onClick={() => handleRemove(job.id)}
									disabled={removingJobId === job.id}
									className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
									aria-label="Remove saved job"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</article>
					))}
				</div>
			)}
		</section>
	);
};
