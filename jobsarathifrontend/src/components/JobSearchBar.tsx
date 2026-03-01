// ======================
//  components/JobSearchBar.tsx
// ======================
interface JobSearchBarProps {
    keyword: string;
    setKeyword: (value: string) => void;
    locationFilter: string;
    setLocationFilter: (value: string) => void;
  }
  
  const JobSearchBar: React.FC<JobSearchBarProps> = ({ keyword, setKeyword, locationFilter, setLocationFilter }) => {
    return (
      <section className="-mt-12 relative z-10 max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
          <div className="grid md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-5">
              <label className="block text-xs font-medium text-slate-500 mb-2 tracking-widest">WHAT ROLE ARE YOU LOOKING FOR?</label>
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Software Engineer, Marketing, Finance..." className="w-full px-6 py-5 bg-slate-50 border border-slate-200 focus:border-indigo-300 rounded-3xl text-base focus:outline-none" />
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-slate-500 mb-2 tracking-widest">LOCATION</label>
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 focus:border-indigo-300 rounded-3xl text-base focus:outline-none">
                <option value="">Any location in Nepal</option>
                <option value="Kathmandu">Kathmandu</option>
                <option value="Lalitpur">Lalitpur</option>
                <option value="Pokhara">Pokhara</option>
                <option value="Remote">Remote / Hybrid</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <button onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg rounded-3xl transition-all active:scale-95 flex items-center justify-center gap-3">Search Jobs <span aria-hidden="true">→</span></button>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default JobSearchBar;