import React, { useMemo } from 'react';
import type { CompanyApplication, CompanyJob } from '../../api/companyDashboardApi';

interface NotificationsPanelProps {
  jobs: CompanyJob[];
  applications: CompanyApplication[];
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ jobs, applications }) => {
  const notifications = useMemo(() => {
    const now = new Date();
    const in24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const recentApplications = applications
      .filter((application) => new Date(application.created_at) >= in24h)
      .slice(0, 8)
      .map((application) => ({
        id: `app-${application.id}`,
        type: 'application',
        title: `New application for ${application.job_title}`,
        message: `${application.candidate_name} applied${application.location ? ` from ${application.location}` : ''}`,
        time: application.created_at,
      }));

    const expiringJobs = jobs
      .filter((job) => {
        if (!job.expiration_date || job.job_status !== 'Open') {
          return false;
        }
        const expiry = new Date(job.expiration_date);
        return expiry >= now && expiry <= in3Days;
      })
      .slice(0, 8)
      .map((job) => ({
        id: `exp-${job.id}`,
        type: 'expiry',
        title: `Job expiring soon: ${job.job_title}`,
        message: `Expires on ${new Date(job.expiration_date as string).toLocaleDateString()}`,
        time: job.expiration_date as string,
      }));

    return [...recentApplications, ...expiringJobs]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);
  }, [applications, jobs]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
        <span className="text-xs text-slate-500">{notifications.length} alerts</span>
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-slate-500">No new notifications right now.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs text-slate-600">{item.message}</p>
              <p className="mt-1 text-[11px] text-slate-400">{new Date(item.time).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default NotificationsPanel;
