import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import {
	createCompanyJob,
	deleteCompanyJob,
	fetchCompanyApplications,
	fetchCompanyDashboardStats,
	fetchCompanyJobs,
	getApiErrorMessage,
	reviewCompanyApplication,
	toggleCompanyJobStatus,
	updateCompanyJob,
	type CompanyApplication,
	type CompanyApplicationReviewPayload,
	type CompanyDashboardStats,
	type CompanyJob,
	type CompanyJobPayload,
} from '../../api/companyDashboardApi';
import {
	Briefcase,
	Building2,
	CheckCircle2,
	Loader2,
	RefreshCw,
	Users,
} from 'lucide-react';
import JobForm from './JobForm';
import JobList from './JobList';
import ApplicantsPanel from './ApplicantsPanel';
import NotificationsPanel from './NotificationsPanel';

const CompanyDashboard: React.FC = () => {
	const location = useLocation();
	const { user } = useAuth();
	const { showToast } = useToast();
	const [stats, setStats] = useState<CompanyDashboardStats | null>(null);
	const [jobs, setJobs] = useState<CompanyJob[]>([]);
	const [applications, setApplications] = useState<CompanyApplication[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [jobSubmitting, setJobSubmitting] = useState(false);
	const [editingJob, setEditingJob] = useState<CompanyJob | null>(null);
	const [jobActionJobId, setJobActionJobId] = useState<number | null>(null);
	const [jobActionType, setJobActionType] = useState<'delete' | 'toggle' | null>(null);

	const getJobApplicationCount = (job: CompanyJob) =>
		Number(job.applications_count ?? job.application_count ?? 0);

	const loadDashboardData = useCallback(async (manualRefresh = false): Promise<boolean> => {
		const [statsResult, jobsResult, applicationsResult] = await Promise.allSettled([
			fetchCompanyDashboardStats(),
			fetchCompanyJobs(),
			fetchCompanyApplications(),
		]);

		if (statsResult.status === 'fulfilled') {
			setStats(statsResult.value);
		} else {
			setStats(null);
			console.error('Company dashboard stats fetch failed:', statsResult.reason);
		}

		if (jobsResult.status === 'fulfilled') {
			const sortedJobs = [...jobsResult.value].sort((a, b) => {
				const first = new Date(a.posting_date).getTime();
				const second = new Date(b.posting_date).getTime();
				return second - first;
			});
			setJobs(sortedJobs);
		} else {
			setJobs([]);
			console.error('Company jobs fetch failed:', jobsResult.reason);
		}

		if (applicationsResult.status === 'fulfilled') {
			const sortedApplications = [...applicationsResult.value].sort((a, b) => {
				const first = new Date(a.created_at).getTime();
				const second = new Date(b.created_at).getTime();
				return second - first;
			});
			setApplications(sortedApplications);
		} else {
			setApplications([]);
			console.error('Company applications fetch failed:', applicationsResult.reason);
		}

		const criticalFailure =
			statsResult.status === 'rejected' &&
			jobsResult.status === 'rejected' &&
			applicationsResult.status === 'rejected';
		if (criticalFailure) {
			showToast('Unable to load company dashboard data. Please refresh and try again.', 'error');
		}

		if (manualRefresh && !criticalFailure) {
			showToast('Company dashboard refreshed', 'success');
		}

		setLoading(false);
		setRefreshing(false);
		return !criticalFailure;
	}, [showToast]);

	useEffect(() => {
		void loadDashboardData();
	}, [loadDashboardData]);

	useEffect(() => {
		if (!location.hash) {
			return;
		}

		const targetId = location.hash.replace('#', '');
		const targetElement = document.getElementById(targetId);
		if (!targetElement) {
			return;
		}

		const timerId = window.setTimeout(() => {
			targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 60);

		return () => window.clearTimeout(timerId);
	}, [location.hash, jobs.length, applications.length, loading]);

	const computedStats = useMemo(() => {
		const totalJobs = stats?.total_jobs ?? jobs.length;
		const openJobs =
			stats?.open_jobs ?? jobs.filter((job) => job.job_status === 'Open').length;
		const closedJobs =
			stats?.closed_jobs ?? jobs.filter((job) => job.job_status === 'Closed').length;
		const totalApplications =
			stats?.total_applications ?? applications.length;

		const applicationStats = stats?.application_stats ?? {};
		const underReview = Number(applicationStats.under_review ?? 0);
		const shortlisted = Number(applicationStats.shortlisted ?? 0);
		const selected = Number(applicationStats.selected ?? 0);
		const rejected = Number(applicationStats.rejected ?? 0);

		return {
			totalJobs,
			openJobs,
			closedJobs,
			totalApplications,
			underReview,
			shortlisted,
			selected,
			rejected,
		};
	}, [applications.length, jobs, stats]);

	const topJobsByApplications = useMemo(() => {
		return [...jobs]
			.sort((a, b) => getJobApplicationCount(b) - getJobApplicationCount(a))
			.slice(0, 5);
	}, [jobs]);

	const onRefresh = async () => {
		setRefreshing(true);
		await loadDashboardData(true);
	};

	const scrollToManageJobs = () => {
		window.setTimeout(() => {
			document.getElementById('manage-jobs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 40);
	};

	const startEditingJob = (job: CompanyJob) => {
		setEditingJob(job);
		scrollToManageJobs();
	};

	const cancelEditingJob = () => {
		setEditingJob(null);
	};

	const onSubmitJob = async (payload: CompanyJobPayload) => {
		setJobSubmitting(true);
		try {
			if (editingJob) {
				await updateCompanyJob(editingJob.id, payload);
				showToast('Job updated successfully', 'success');
			} else {
				await createCompanyJob(payload);
				showToast('Job posted successfully', 'success');
			}

			setEditingJob(null);
			await loadDashboardData();
		} catch (error) {
			showToast(getApiErrorMessage(error, 'Failed to save job'), 'error');
		} finally {
			setJobSubmitting(false);
		}
	};

	const onDeleteJob = async (jobId: number) => {
		setJobActionJobId(jobId);
		setJobActionType('delete');
		try {
			await deleteCompanyJob(jobId);
			showToast('Job deleted successfully', 'success');
			if (editingJob?.id === jobId) {
				setEditingJob(null);
			}
			await loadDashboardData();
		} catch (error) {
			showToast(getApiErrorMessage(error, 'Failed to delete job'), 'error');
		} finally {
			setJobActionJobId(null);
			setJobActionType(null);
		}
	};

	const onToggleJobStatus = async (jobId: number) => {
		setJobActionJobId(jobId);
		setJobActionType('toggle');
		try {
			await toggleCompanyJobStatus(jobId);
			showToast('Job status updated', 'success');
			await loadDashboardData();
		} catch (error) {
			showToast(getApiErrorMessage(error, 'Failed to update job status'), 'error');
		} finally {
			setJobActionJobId(null);
			setJobActionType(null);
		}
	};

	const onReviewApplication = async (
		applicationId: number,
		payload: CompanyApplicationReviewPayload,
	) => {
		try {
			await reviewCompanyApplication(applicationId, payload);
			showToast('Applicant status/notes updated', 'success');
			await loadDashboardData();
		} catch (error) {
			showToast(getApiErrorMessage(error, 'Failed to update applicant review'), 'error');
		}
	};

	const formatDate = (dateValue: string): string => {
		const date = new Date(dateValue);
		if (Number.isNaN(date.getTime())) {
			return '-';
		}
		return date.toLocaleDateString();
	};

	if (loading) {
		return (
			<DashboardLayout role="company">
				<div className="flex min-h-[60vh] items-center justify-center">
					<div className="text-center">
						<Loader2 size={44} className="mx-auto mb-3 animate-spin text-indigo-500" />
						<p className="text-sm text-slate-500">Loading company dashboard...</p>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout role="company">
			<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold text-slate-900">
							Welcome back, {user?.company_name || 'Company'}
						</h1>
						<p className="mt-1 text-sm text-slate-500">
							Monitor jobs, applicants, and hiring progress from one place.
						</p>
					</div>
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={onRefresh}
							disabled={refreshing}
							className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
						>
							<RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
							Refresh
						</button>
						<Link
							to="/company/profile"
							className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
						>
							Company Profile
						</Link>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<p className="text-xs uppercase tracking-wide text-slate-400">Total Jobs</p>
							<Briefcase size={16} className="text-indigo-500" />
						</div>
						<p className="mt-2 text-2xl font-semibold text-slate-900">{computedStats.totalJobs}</p>
					</div>

					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<p className="text-xs uppercase tracking-wide text-slate-400">Open Jobs</p>
							<CheckCircle2 size={16} className="text-emerald-500" />
						</div>
						<p className="mt-2 text-2xl font-semibold text-slate-900">{computedStats.openJobs}</p>
					</div>

					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<p className="text-xs uppercase tracking-wide text-slate-400">Closed Jobs</p>
							<Building2 size={16} className="text-amber-500" />
						</div>
						<p className="mt-2 text-2xl font-semibold text-slate-900">{computedStats.closedJobs}</p>
					</div>

					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<p className="text-xs uppercase tracking-wide text-slate-400">Total Applications</p>
							<Users size={16} className="text-blue-500" />
						</div>
						<p className="mt-2 text-2xl font-semibold text-slate-900">{computedStats.totalApplications}</p>
					</div>
				</div>

				<div id="notifications" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<NotificationsPanel jobs={jobs} applications={applications} />

					<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-900">Top Jobs by Applications</h2>
						{topJobsByApplications.length === 0 ? (
							<p className="mt-4 text-sm text-slate-500">No applications data yet.</p>
						) : (
							<div className="mt-4 space-y-3">
								{topJobsByApplications.map((job) => (
									<div key={job.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
										<div className="min-w-0">
											<p className="truncate text-sm font-medium text-slate-900">{job.job_title}</p>
											<p className="text-xs text-slate-500">
												{job.job_type} • {job.location_city}
											</p>
											<p className="text-[11px] text-slate-400">Posted: {formatDate(job.posting_date)}</p>
										</div>
										<p className="text-sm font-semibold text-indigo-600">{getJobApplicationCount(job)}</p>
									</div>
								))}
							</div>
						)}
					</section>
				</div>

				<div id="manage-jobs" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-lg font-semibold text-slate-900">Job Management</h2>
						<span className="text-xs text-slate-500">Create, edit, delete, and toggle status</span>
					</div>

					<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
						<div id="job-form-section">
							<JobForm
								mode={editingJob ? 'edit' : 'create'}
								initialJob={editingJob}
								submitting={jobSubmitting}
								onSubmit={onSubmitJob}
								onCancel={editingJob ? cancelEditingJob : undefined}
							/>
						</div>

						<div>
							<h3 className="mb-3 text-sm font-semibold text-slate-700">Posted Jobs</h3>
							<JobList
								jobs={jobs}
								loading={false}
								actionJobId={jobActionJobId}
								actionType={jobActionType}
								onEdit={startEditingJob}
								onDelete={onDeleteJob}
								onToggleStatus={onToggleJobStatus}
							/>
						</div>
					</div>
				</div>

				<div id="applicants">
					<ApplicantsPanel applications={applications} jobs={jobs} onReview={onReviewApplication} />
				</div>
			</div>
		</DashboardLayout>
	);
};

export default CompanyDashboard;