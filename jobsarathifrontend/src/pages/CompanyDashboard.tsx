import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  FilePlus2,
  ListChecks,
  LogOut,
  Bell,
  Settings,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ChevronRight,
  DollarSign,
  Menu,
  X,
  Plus,
  CreditCard,
  AlertTriangle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Activity,
} from 'lucide-react';
import JobForm from '../components/company/JobForm';
import JobList from '../components/company/JobList';
import ProfileForm from '../components/company/ProfileForm';
import {
  createCompanyJob,
  deleteCompanyJob,
  fetchCompanyDashboardStats,
  fetchCompanyJobs,
  fetchCompanyProfile,
  getApiErrorMessage,
  toggleCompanyJobStatus,
  updateCompanyJob,
  updateCompanyProfile,
  type CompanyDashboardStats,
  type CompanyJob,
  type CompanyJobPayload,
  type CompanyProfile,
  type CompanyProfilePayload,
} from '../api/companyDashboardApi';
import { useAuth } from '../contexts/AuthContext';

type DashboardSection = 'overview' | 'profile' | 'post-job' | 'my-jobs';

interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
  title?: string;
}

const NAV_ITEMS: Array<{
  key: DashboardSection;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'profile', label: 'Company Profile', icon: Building2 },
  { key: 'post-job', label: 'Post a Job', icon: FilePlus2 },
  { key: 'my-jobs', label: 'Job Listings', icon: ListChecks },
];

const TOAST_ICONS: Record<ToastMessage['type'], React.ReactNode> = {
  success: <CheckCircle2 size={16} />,
  error: <XCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
};

const TOAST_STYLES: Record<ToastMessage['type'], string> = {
  success: 'bg-white border-l-4 border-emerald-500 text-gray-900',
  error: 'bg-white border-l-4 border-red-500 text-gray-900',
  warning: 'bg-white border-l-4 border-amber-500 text-gray-900',
  info: 'bg-white border-l-4 border-blue-500 text-gray-900',
};

const TOAST_ICON_STYLES: Record<ToastMessage['type'], string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

// ── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  growth?: number;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, growth, subtext }) => (
  <div className="group rounded-2xl bg-white border border-gray-100 p-6 hover:border-gray-200 hover:shadow-md transition-all duration-200">
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 tabular-nums">{value}</p>
        {subtext && (
          <p className="text-xs text-gray-400">{subtext}</p>
        )}
      </div>
      <div className="rounded-xl bg-gray-50 p-2.5 group-hover:bg-gray-100 transition-colors">
        <Icon size={18} className="text-gray-500" />
      </div>
    </div>
    {growth !== undefined && (
      <div className="mt-4 flex items-center gap-1.5">
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(growth)}%
        </span>
        <span className="text-xs text-gray-400">vs last month</span>
      </div>
    )}
  </div>
);

// ── Job Row ───────────────────────────────────────────────────────────────────

const JobRow: React.FC<{ job: CompanyJob; onView: () => void }> = ({ job, onView }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 -mx-2 px-2 rounded-lg transition-colors">
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <Briefcase size={15} className="text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{job.job_title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{job.location || 'Remote'} · {job.applications_count ?? job.application_count ?? 0} applicants</p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        job.job_status === 'Open'
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-gray-100 text-gray-500'
      }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${job.job_status === 'Open' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
        {job.job_status}
      </span>
      <button
        onClick={onView}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <Eye size={14} />
      </button>
    </div>
  </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────

const Toast: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({ toast, onDismiss }) => (
  <div className={`flex items-start gap-3 w-80 rounded-xl shadow-lg p-4 ${TOAST_STYLES[toast.type]}`}
    style={{ animation: 'slideUp 0.2s ease-out' }}
  >
    <span className={`mt-0.5 shrink-0 ${TOAST_ICON_STYLES[toast.type]}`}>
      {TOAST_ICONS[toast.type]}
    </span>
    <div className="flex-1 min-w-0">
      {toast.title && <p className="text-sm font-semibold text-gray-900">{toast.title}</p>}
      <p className={`text-sm ${toast.title ? 'text-gray-500 mt-0.5' : 'text-gray-700'}`}>{toast.text}</p>
    </div>
    <button
      onClick={onDismiss}
      className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
    >
      <X size={14} />
    </button>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<CompanyJob[]>([]);
  const [stats, setStats] = useState<CompanyDashboardStats | null>(null);

  const [profileLoading, setProfileLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [jobSubmitting, setJobSubmitting] = useState(false);
  const [actionJobId, setActionJobId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'toggle' | null>(null);

  const [editingJob, setEditingJob] = useState<CompanyJob | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const showToast = (text: string, type: ToastMessage['type'], title?: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, type, title }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      setProfile(await fetchCompanyProfile());
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Failed to load company profile.'), 'error', 'Error');
    } finally {
      setProfileLoading(false);
    }
  };

  const loadJobs = async () => {
    setJobsLoading(true);
    try {
      setJobs(await fetchCompanyJobs());
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Failed to load job listings.'), 'error', 'Error');
    } finally {
      setJobsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStats(await fetchCompanyDashboardStats());
    } catch { /* optional */ }
  };

  useEffect(() => {
    void loadProfile();
    void loadJobs();
    void loadStats();
  }, []);

  const analytics = useMemo(() => {
    if (stats) {
      return {
        totalJobs: stats.total_jobs,
        activeJobs: stats.open_jobs,
        closedJobs: stats.closed_jobs,
        totalApplications: stats.total_applications,
        appRate: stats.total_jobs > 0 ? Math.round((stats.total_applications / stats.total_jobs) * 10) / 10 : 0,
      };
    }
    const activeJobs = jobs.filter((j) => j.job_status === 'Open').length;
    const totalApplications = jobs.reduce((s, j) => s + (j.applications_count ?? j.application_count ?? 0), 0);
    return {
      totalJobs: jobs.length,
      activeJobs,
      closedJobs: jobs.length - activeJobs,
      totalApplications,
      appRate: jobs.length > 0 ? Math.round((totalApplications / jobs.length) * 10) / 10 : 0,
    };
  }, [jobs, stats]);

  const handleProfileSubmit = async (payload: CompanyProfilePayload) => {
    setProfileSaving(true);
    try {
      setProfile(await updateCompanyProfile(payload));
      showToast('Profile updated successfully.', 'success', 'Saved');
      await loadStats();
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Failed to update profile.'), 'error', 'Error');
      throw error;
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCreateJob = async (payload: CompanyJobPayload) => {
    setJobSubmitting(true);
    try {
      const created = await createCompanyJob(payload);
      setJobs((prev) => [created, ...prev]);
      showToast('Job posted successfully.', 'success', 'Published');
      await loadStats();
      setActiveSection('my-jobs');
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Failed to post job.'), 'error', 'Error');
      throw error;
    } finally {
      setJobSubmitting(false);
    }
  };

  const handleUpdateJob = async (payload: CompanyJobPayload) => {
    if (!editingJob) return;
    setJobSubmitting(true);
    try {
      const updated = await updateCompanyJob(editingJob.id, payload);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      setEditingJob(null);
      showToast('Job updated successfully.', 'success', 'Saved');
      await loadStats();
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Failed to update job.'), 'error', 'Error');
      throw error;
    } finally {
      setJobSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!globalThis.confirm('Delete this job permanently? This cannot be undone.')) return;
    setActionJobId(jobId);
    setActionType('delete');
    try {
      await deleteCompanyJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      if (editingJob?.id === jobId) setEditingJob(null);
      showToast('Job deleted.', 'success', 'Deleted');
      await loadStats();
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Failed to delete job.'), 'error', 'Error');
    } finally {
      setActionJobId(null);
      setActionType(null);
    }
  };

  const handleToggleStatus = async (jobId: number) => {
    setActionJobId(jobId);
    setActionType('toggle');
    try {
      const updated = await toggleCompanyJobStatus(jobId);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      showToast(`Job ${updated.job_status === 'Open' ? 'activated' : 'closed'}.`, 'success', 'Status Updated');
      await loadStats();
    } catch (error: unknown) {
      showToast(getApiErrorMessage(error, 'Failed to update job status.'), 'error', 'Error');
    } finally {
      setActionJobId(null);
      setActionType(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigate_section = (section: DashboardSection) => {
    setActiveSection(section);
    setEditingJob(null);
    setShowMobileMenu(false);
  };

  const companyName = profile?.name ?? user?.company_name ?? 'Company';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Mobile overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      <div className="flex h-screen overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 flex flex-col w-60 bg-white border-r border-gray-100
          transform transition-transform duration-250 ease-in-out
          lg:relative lg:translate-x-0
          ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
            <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <BriefcaseBusiness size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{companyName}</p>
              <p className="text-xs text-gray-400">Employer Dashboard</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
              const active = activeSection === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate_section(key)}
                  className={`
                    flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150
                    ${active
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                  `}
                >
                  <Icon size={16} className={active ? 'text-white' : 'text-gray-400'} />
                  {label}
                  {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
                </button>
              );
            })}
          </nav>

          {/* User area */}
          <div className="border-t border-gray-100 p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="flex items-center justify-between bg-white border-b border-gray-100 px-6 py-4 shrink-0">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
                onClick={() => setShowMobileMenu(true)}
              >
                <Menu size={18} />
              </button>
              <div>
                <h1 className="text-base font-semibold text-gray-900">
                  {NAV_ITEMS.find((n) => n.key === activeSection)?.label ?? 'Dashboard'}
                </h1>
                <p className="text-xs text-gray-400 hidden sm:block">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate_section('post-job')}
                className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                <Plus size={14} />
                Post a job
              </button>
              <button className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <Bell size={16} />
              </button>
              <button className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <Settings size={16} />
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

              {/* ── Overview ── */}
              {activeSection === 'overview' && (
                <>
                  {/* Stats */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      title="Total Jobs"
                      value={String(analytics.totalJobs)}
                      icon={Briefcase}
                      subtext="All posted positions"
                    />
                    <StatCard
                      title="Active Jobs"
                      value={String(analytics.activeJobs)}
                      icon={Activity}
                      growth={analytics.totalJobs > 0 ? Math.round((analytics.activeJobs / analytics.totalJobs) * 100) : 0}
                      subtext="Currently open"
                    />
                    <StatCard
                      title="Applications"
                      value={String(analytics.totalApplications)}
                      icon={Users}
                      subtext="Total received"
                    />
                    <StatCard
                      title="Avg per Job"
                      value={String(analytics.appRate)}
                      icon={BarChart3}
                      subtext="Applications per listing"
                    />
                  </div>

                  {/* Recent jobs */}
                  <div className="rounded-2xl bg-white border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900">Recent Job Postings</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Your latest listings</p>
                      </div>
                      <button
                        onClick={() => navigate_section('my-jobs')}
                        className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
                      >
                        View all <ChevronRight size={12} />
                      </button>
                    </div>
                    {jobsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-14 rounded-lg bg-gray-50 animate-pulse" />
                        ))}
                      </div>
                    ) : jobs.length === 0 ? (
                      <div className="text-center py-10">
                        <Briefcase size={28} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-sm text-gray-400">No jobs posted yet.</p>
                        <button
                          onClick={() => navigate_section('post-job')}
                          className="mt-3 text-xs font-medium text-gray-900 underline underline-offset-2"
                        >
                          Post your first job →
                        </button>
                      </div>
                    ) : (
                      <div>
                        {jobs.slice(0, 5).map((job) => (
                          <JobRow
                            key={job.id}
                            job={job}
                            onView={() => navigate_section('my-jobs')}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick actions */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      onClick={() => navigate_section('post-job')}
                      className="group flex items-center justify-between rounded-2xl bg-gray-900 p-6 text-left hover:bg-gray-800 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">Post a new job</p>
                        <p className="text-xs text-gray-400 mt-1">Reach thousands of candidates</p>
                      </div>
                      <FilePlus2 size={20} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                    </button>
                    <button
                      onClick={() => navigate_section('profile')}
                      className="group flex items-center justify-between rounded-2xl bg-white border border-gray-100 p-6 text-left hover:border-gray-200 hover:shadow-md transition-all"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Update company profile</p>
                        <p className="text-xs text-gray-400 mt-1">Keep your information current</p>
                      </div>
                      <Building2 size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </button>
                  </div>
                </>
              )}

              {/* ── Profile ── */}
              {activeSection === 'profile' && (
                <div className="rounded-2xl bg-white border border-gray-100 p-6">
                  <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-900">Company Profile</h2>
                    <p className="text-xs text-gray-400 mt-1">Your public employer information</p>
                  </div>
                  <ProfileForm
                    profile={profile}
                    loading={profileLoading}
                    saving={profileSaving}
                    onSubmit={handleProfileSubmit}
                  />
                </div>
              )}

              {/* ── Post Job ── */}
              {activeSection === 'post-job' && (
                <div className="rounded-2xl bg-white border border-gray-100 p-6">
                  <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-900">Post a New Job</h2>
                    <p className="text-xs text-gray-400 mt-1">Fill in the details to publish your listing</p>
                  </div>
                  <JobForm
                    mode="create"
                    submitting={jobSubmitting}
                    onSubmit={handleCreateJob}
                  />
                </div>
              )}

              {/* ── My Jobs ── */}
              {activeSection === 'my-jobs' && (
                <div className="space-y-6">
                  {editingJob && (
                    <div className="rounded-2xl bg-white border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h2 className="text-sm font-semibold text-gray-900">Edit Job</h2>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{editingJob.job_title}</p>
                        </div>
                        <button
                          onClick={() => setEditingJob(null)}
                          className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                      <JobForm
                        mode="edit"
                        initialJob={editingJob}
                        submitting={jobSubmitting}
                        onSubmit={handleUpdateJob}
                        onCancel={() => setEditingJob(null)}
                      />
                    </div>
                  )}

                  <div className="rounded-2xl bg-white border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900">Job Listings</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {analytics.totalJobs} total · {analytics.activeJobs} open
                        </p>
                      </div>
                      <button
                        onClick={() => navigate_section('post-job')}
                        className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
                      >
                        <Plus size={13} />
                        New job
                      </button>
                    </div>
                    <JobList
                      jobs={jobs}
                      loading={jobsLoading}
                      actionJobId={actionJobId}
                      actionType={actionType}
                      onEdit={(job) => {
                        setEditingJob(job);
                        showToast(`Editing "${job.job_title}"`, 'info');
                      }}
                      onDelete={handleDeleteJob}
                      onToggleStatus={handleToggleStatus}
                    />
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>

      {/* ── Toasts ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          />
        ))}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CompanyDashboard;