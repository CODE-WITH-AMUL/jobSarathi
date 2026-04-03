// pages/candidate/Dashboard.tsx (Enhanced)
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { candidateAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { DashboardStats } from '../../components/candidate/DashboardStats';
import { ProfileCompleteness } from '../../components/candidate/ProfileCompleteness';
import { RecommendedJobs } from '../../components/candidate/RecommendedJobs';
import { RecentApplications } from '../../components/candidate/RecentApplications';
import { SavedJobsPanel } from '../../components/candidate/SavedJobsPanel';
import type { CandidateProfile, Job, JobApplication, DashboardStats as StatsType } from '../../types/candidate';
import { 
  Loader2, 
  RefreshCw, 
  Award,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

const CandidateDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  const fetchDashboardData = async (): Promise<boolean> => {
    const [profileResult, statsResult, jobsResult, applicationsResult, savedResult] = await Promise.allSettled([
      candidateAPI.getProfile(),
      candidateAPI.getDashboardStats(),
      candidateAPI.getRecommendedJobs({ limit: 5 }),
      candidateAPI.getApplications({ limit: 5 }),
      candidateAPI.getSavedJobs({ limit: 5 }),
    ]);

    if (profileResult.status === 'fulfilled') {
      setProfile(profileResult.value);
    } else {
      console.error('Candidate profile fetch failed:', profileResult.reason);
      setProfile(null);
    }

    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value);
    } else {
      console.error('Dashboard stats fetch failed:', statsResult.reason);
      setStats(null);
    }

    const fetchedApplications =
      applicationsResult.status === 'fulfilled' ? applicationsResult.value.results || [] : [];

    if (applicationsResult.status === 'fulfilled') {
      setRecentApplications(fetchedApplications);
    } else {
      console.error('Applications fetch failed:', applicationsResult.reason);
      setRecentApplications([]);
    }

    if (jobsResult.status === 'fulfilled') {
      const appliedJobIds = new Set(fetchedApplications.map((application) => application.job.id));
      const normalizedJobs = (jobsResult.value.results || []).map((job) => ({
        ...job,
        has_applied: job.has_applied || appliedJobIds.has(job.id),
      }));
      setRecommendedJobs(normalizedJobs);
    } else {
      console.error('Recommended jobs fetch failed:', jobsResult.reason);
      setRecommendedJobs([]);
    }

    if (savedResult.status === 'fulfilled') {
      setSavedJobs(savedResult.value.results || []);
    } else {
      console.error('Saved jobs fetch failed:', savedResult.reason);
      setSavedJobs([]);
    }

    const criticalFailure =
      (profileResult.status === 'rejected' && statsResult.status === 'rejected') ||
      (jobsResult.status === 'rejected' && applicationsResult.status === 'rejected' && savedResult.status === 'rejected');

    if (criticalFailure) {
      showToast('Unable to load dashboard data. Please refresh and try again.', 'error');
    }

    setLoading(false);
    setRefreshing(false);
    return !criticalFailure;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
  }, [location.hash, recommendedJobs.length, recentApplications.length, savedJobs.length, loading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const success = await fetchDashboardData();
    if (success) {
      showToast('Dashboard updated', 'success');
    }
  };

  const handleProfileEdit = () => {
    navigate('/candidate/profile');
  };

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 size={48} className="mx-auto text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const firstName = user?.first_name || profile?.user?.first_name || 'there';
  const profileCompleteness = profile?.profile_completeness || 0;

  return (
    <DashboardLayout role="candidate">
      <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header with Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
              {profileCompleteness === 100 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs">
                  <Award size={12} />
                  Verified Profile
                </span>
              )}
            </div>
            <p className="text-gray-500">Track your job search progress and discover new opportunities</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/candidate/dashboard#recommended-jobs')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              Browse Jobs
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Profile Completeness */}
        {profileCompleteness < 100 && (
          <ProfileCompleteness completeness={profileCompleteness} onEdit={handleProfileEdit} />
        )}

        {/* Stats Grid */}
        {stats && <DashboardStats stats={stats} />}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Jobs & Applications */}
          <div className="lg:col-span-2 space-y-6">
            <div id="recommended-jobs">
              <RecommendedJobs jobs={recommendedJobs} onJobUpdate={fetchDashboardData} />
            </div>
            <div id="recent-applications">
              <RecentApplications applications={recentApplications} />
            </div>
          </div>

          {/* Right Column - Saved Jobs & Quick Actions */}
          <div className="space-y-6">
            <div id="saved-jobs">
              <SavedJobsPanel jobs={savedJobs} onJobUpdate={fetchDashboardData} />
            </div>
            
            {/* Quick Stats Cards */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <TrendingUp size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Profile Insights</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile Views</span>
                  <span className="font-semibold text-gray-900">{stats?.profile_views || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Application Success Rate</span>
                  <span className="font-semibold text-green-600">
                    {stats?.total_applications 
                      ? Math.round((stats.shortlisted_count / stats.total_applications) * 100)
                      : 0}%
                  </span>
                </div>
                <button className="w-full mt-3 py-2 text-center text-sm font-medium text-blue-600 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard;