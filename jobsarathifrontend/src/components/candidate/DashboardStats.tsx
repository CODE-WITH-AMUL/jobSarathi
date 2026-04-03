// components/candidate/DashboardStats.tsx
import React from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Star, 
  TrendingUp
} from 'lucide-react';
import type { DashboardStats as DashboardStatsData } from '../../types/candidate';

interface StatsProps {
  stats: DashboardStatsData;
}

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  trend?: number;
  color?: string;
}> = ({ label, value, icon: Icon, trend, color = 'gray' }) => (
  <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-5 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-gray-900 tabular-nums">{value}</p>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={12} className={trend >= 0 ? 'text-green-500' : 'text-red-500'} />
            <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-xs text-gray-400">vs last month</span>
          </div>
        )}
      </div>
      <div className={`rounded-xl bg-${color}-50 p-2.5 group-hover:scale-110 transition-transform duration-200`}>
        <Icon size={18} className={`text-${color}-500`} />
      </div>
    </div>
  </div>
);

export const DashboardStats: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        label="Total Applications" 
        value={stats.total_applications} 
        icon={Briefcase}
        color="blue"
        trend={12}
      />
      <StatCard 
        label="Active Applications" 
        value={stats.active_applications} 
        icon={CheckCircle2}
        color="emerald"
        trend={8}
      />
      <StatCard 
        label="Shortlisted" 
        value={stats.shortlisted_count} 
        icon={Star}
        color="amber"
      />
      <StatCard 
        label="Rejected" 
        value={stats.rejected_count} 
        icon={XCircle}
        color="red"
      />
    </div>
  );
};