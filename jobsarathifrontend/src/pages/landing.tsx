import React, { useState } from 'react';
import Navbar from '../components/NavBar';
import Hero from '../components/Hero';
import JobSearchBar from '../components/JobSearchBar';
import FeaturedJobs from '../components/FeaturedJobs';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import NewsletterCTA from '../components/NewsletterCTA';
import Footer from '../components/Footer';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
}

const LandingPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const featuredJobs: Job[] = [
    { id: 1, title: "Senior Frontend Developer", company: "F1Soft International", location: "Kathmandu", salary: "NPR 1,50,000 – 2,20,000", type: "Full-time", experience: "4–7 years" },
    { id: 2, title: "Digital Marketing Specialist", company: "Daraz Nepal", location: "Lalitpur", salary: "NPR 85,000 – 1,25,000", type: "Full-time", experience: "3–5 years" },
    { id: 3, title: "Relationship Officer", company: "Nabil Bank Limited", location: "Pokhara", salary: "NPR 70,000 – 1,05,000", type: "Full-time", experience: "2–4 years" },
    { id: 4, title: "Product Manager", company: "CloudFactory", location: "Remote", salary: "NPR 1,20,000 – 1,80,000", type: "Full-time", experience: "5+ years" },
    { id: 5, title: "Data Analyst", company: "eSewa", location: "Kathmandu", salary: "NPR 65,000 – 95,000", type: "Full-time", experience: "1–3 years" },
  ];

  const filteredJobs = featuredJobs.filter((job) => {
    const matchesKeyword = !keyword || job.title.toLowerCase().includes(keyword.toLowerCase()) || job.company.toLowerCase().includes(keyword.toLowerCase());
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesKeyword && matchesLocation;
  });

  const openApply = (job: Job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      alert(`Thank you! You've been subscribed with ${newsletterEmail}`);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />
      <Hero />
      <JobSearchBar 
        keyword={keyword} 
        setKeyword={setKeyword} 
        locationFilter={locationFilter} 
        setLocationFilter={setLocationFilter} 
      />
      <FeaturedJobs jobs={filteredJobs} onApply={openApply} />
      <HowItWorks />
      <Testimonials />
      <NewsletterCTA 
        newsletterEmail={newsletterEmail} 
        setNewsletterEmail={setNewsletterEmail} 
        onSubmit={handleNewsletterSubmit} 
      />
      <Footer />

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6" onClick={() => setShowApplyModal(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-9">
              <div className="flex justify-between">
                <div>
                  <div className="uppercase text-xs tracking-widest text-indigo-600 font-medium">Quick Apply</div>
                  <h3 className="font-semibold text-2xl mt-2 leading-tight">{selectedJob.title}</h3>
                  <p className="text-slate-500 mt-1">{selectedJob.company} • {selectedJob.location}</p>
                </div>
                <button onClick={() => setShowApplyModal(false)} className="text-4xl leading-none text-slate-300 hover:text-slate-400">×</button>
              </div>
            </div>
            <div className="px-9 pb-9 space-y-7">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">FULL NAME</label>
                <input type="text" defaultValue="Amul Shrestha" className="w-full border border-slate-200 focus:border-indigo-400 rounded-3xl px-6 py-4" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">EMAIL</label>
                <input type="email" defaultValue="amul@example.com" className="w-full border border-slate-200 focus:border-indigo-400 rounded-3xl px-6 py-4" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">WHY YOU’RE A GREAT FIT (OPTIONAL)</label>
                <textarea className="w-full border border-slate-200 focus:border-indigo-400 rounded-3xl px-6 py-4 h-32 resize-y" placeholder="I have 5 years experience..."></textarea>
              </div>
            </div>
            <div className="border-t px-9 py-7 flex gap-4 bg-slate-50">
              <button onClick={() => setShowApplyModal(false)} className="flex-1 py-4 text-slate-600 font-medium border border-slate-300 rounded-3xl">Cancel</button>
              <button onClick={() => { alert(`Application for ${selectedJob.title} submitted successfully! 🎉`); setShowApplyModal(false); }} className="flex-1 py-4 bg-emerald-600 text-white font-semibold rounded-3xl hover:bg-emerald-700 transition-all">Submit Application</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }
        .animate-float { animation: float 4.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LandingPage;