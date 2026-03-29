import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Heart,
  ChevronRight,
  MapPin,
  Building2,
  ArrowUpRight,
  Bookmark,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type ApplicationStatus = 'Under Review' | 'Shortlisted' | 'Rejected' | 'Offered';

interface Application {
  id: number;
  role: string;
  company: string;
  location: string;
  status: ApplicationStatus;
  appliedDaysAgo: number;
}

interface SavedJob {
  id: number;
  role: string;
  company: string;
  type: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const APPLICATIONS: Application[] = [
  { id: 1, role: 'Frontend Developer', company: 'F1Soft International', location: 'Kathmandu', status: 'Under Review', appliedDaysAgo: 2 },
  { id: 2, role: 'React Engineer', company: 'Leapfrog Technology', location: 'Kathmandu', status: 'Shortlisted', appliedDaysAgo: 5 },
  { id: 3, role: 'UI Engineer', company: 'CloudFactory', location: 'Remote', status: 'Rejected', appliedDaysAgo: 9 },
];

const SAVED_JOBS: SavedJob[] = [
  { id: 1, role: 'UI/UX Designer', company: 'CloudFactory', type: 'Remote' },
  { id: 2, role: 'Product Designer', company: 'Fusemachines', type: 'Hybrid' },
];

// ── Status Badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  'Under Review': 'bg-blue-50 text-blue-700',
  'Shortlisted':  'bg-emerald-50 text-emerald-700',
  'Rejected':     'bg-red-50 text-red-600',
  'Offered':      'bg-amber-50 text-amber-700',
};

const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${
      status === 'Under Review' ? 'bg-blue-500' :
      status === 'Shortlisted'  ? 'bg-emerald-500' :
      status === 'Rejected'     ? 'bg-red-500' :
      'bg-amber-500'
    }`} />
    {status}
  </span>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  sub?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, sub }) => (
  <div className="group rounded-2xl bg-white border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all duration-200">
    <div className="flex items-start justify-between">
      <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">{label}</p>
      <div className="rounded-lg bg-gray-50 p-2 group-hover:bg-gray-100 transition-colors">
        <Icon size={15} className="text-gray-500" />
      </div>
    </div>
    <p className="mt-3 text-2xl font-semibold text-gray-900 tabular-nums">{value}</p>
    {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const firstName = user?.first_name || 'there';

  return (
    <DashboardLayout role="candidate">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Here's your job search snapshot.</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition-colors">
            Browse jobs
            <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Applied" value="8" icon={Briefcase} sub="Total applications" />
          <StatCard label="Interviews" value="2" icon={Clock} sub="Scheduled this month" />
          <StatCard label="Offers" value="1" icon={CheckCircle2} sub="Active offer" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Applications */}
          <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Recent Applications</h2>
                <p className="text-xs text-gray-400 mt-0.5">{APPLICATIONS.length} submitted</p>
              </div>
              <button className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                View all <ChevronRight size={12} />
              </button>
            </div>

            <div className="space-y-1">
              {APPLICATIONS.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-xl px-3 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Briefcase size={15} className="text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{app.role}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Building2 size={11} /> {app.company}
                        </span>
                        <span className="text-gray-200">·</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin size={11} /> {app.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                    <StatusBadge status={app.status} />
                    <p className="text-[10px] text-gray-400">{app.appliedDaysAgo}d ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Jobs */}
          <div className="rounded-2xl bg-white border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Saved Jobs</h2>
                <p className="text-xs text-gray-400 mt-0.5">{SAVED_JOBS.length} bookmarked</p>
              </div>
              <Bookmark size={15} className="text-gray-300" />
            </div>

            <div className="space-y-3">
              {SAVED_JOBS.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.role}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-400">{job.company}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">{job.type}</span>
                      </div>
                    </div>
                    <button className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5">
                      <Heart size={14} />
                    </button>
                  </div>
                  <button className="w-full rounded-lg border border-gray-200 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                    Apply now
                  </button>
                </div>
              ))}
            </div>

            <button className="mt-4 w-full rounded-lg py-2.5 text-xs font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
              View all saved jobs
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard;