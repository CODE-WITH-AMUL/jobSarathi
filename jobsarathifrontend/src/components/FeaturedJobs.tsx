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

            <div className="space-y-3 mb-6">
  <div className="flex items-center text-gray-600">
    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <span className="text-sm text-gray-600">{job.location}</span>
  </div>
  
  <div className="flex items-center text-gray-600">
    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span className="text-sm text-gray-600">{job.salary}</span>
  </div>
  
  <div className="flex items-center text-gray-600">
    <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span className="text-sm text-gray-600">{job.experience}</span>
  </div>
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