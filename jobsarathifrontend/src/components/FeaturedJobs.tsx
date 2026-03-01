// ======================
//  components/FeaturedJobs.tsx
// ======================
import React from 'react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
}

interface FeaturedJobsProps {
  jobs: Job[];
  onApply: (job: Job) => void;
}

const FeaturedJobs: React.FC<FeaturedJobsProps> = ({ jobs, onApply }) => {
  return (
    <section id="jobs" className="max-w-7xl mx-auto px-6 pt-28 pb-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="uppercase text-emerald-600 text-sm font-medium tracking-[2px]">LIVE OPPORTUNITIES</div>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900">Featured Jobs</h2>
        </div>
        <a href="#" className="hidden md:block text-indigo-600 hover:underline text-sm font-medium">View all 18,450 jobs →</a>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {jobs.map((job, index) => (
          <div key={job.id} onClick={() => onApply(job)} className="group bg-white border border-slate-100 hover:border-indigo-200 rounded-3xl p-8 cursor-pointer transition-all hover:-translate-y-3 hover:shadow-2xl" style={{ animationDelay: `${index * 80}ms` }}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-2xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</div>
                <div className="text-slate-600 mt-1">{job.company}</div>
              </div>
              <div className="text-right"><div className="text-xs font-medium px-4 py-2 bg-emerald-100 text-emerald-700 rounded-2xl">{job.type}</div></div>
            </div>

            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-center gap-3 text-slate-500">📍 <span>{job.location}</span></div>
              <div className="flex items-center gap-3 text-slate-500">💰 <span>{job.salary}</span></div>
              <div className="flex items-center gap-3 text-slate-500">⏱ <span>{job.experience}</span></div>
            </div>

            <div className="mt-10 flex gap-4">
              <button onClick={(e) => { e.stopPropagation(); onApply(job); }} className="flex-1 py-4 bg-indigo-600 text-white font-medium rounded-3xl hover:bg-indigo-700 transition-all active:scale-[0.985]">Quick Apply</button>
              <button onClick={(e) => e.stopPropagation()} className="flex-1 py-4 border border-slate-300 hover:bg-slate-50 font-medium rounded-3xl transition-all">Save</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedJobs;