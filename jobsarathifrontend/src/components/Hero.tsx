// ======================
//  components/Hero.tsx
// ======================
import heroImg from "../assets/hero.png";
const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-slate-950 to-indigo-950 text-white pt-24 pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-5 py-2 rounded-full text-sm font-medium">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
            1,284 jobs added this week
          </div>

          <h1 className="text-6xl lg:text-7xl font-bold tracking-tighter leading-none">
            Your dream job<br />is one click away
          </h1>

          <p className="text-xl text-indigo-100 max-w-lg">
            Nepal&apos;s most trusted job portal. Connect with top companies. Build the career you deserve.
          </p>

          <div className="flex flex-wrap gap-4">
            <button onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg rounded-3xl transition-all active:scale-[0.97] flex items-center gap-3">Search Jobs Now <span aria-hidden="true">→</span></button>
            <button onClick={() => alert('Post job flow')} className="px-10 py-4 border border-white/60 hover:bg-white/10 font-semibold text-lg rounded-3xl transition-all">Hire Talent</button>
          </div>

          <div className="flex items-center gap-10 text-sm pt-4">
            <div><div className="text-3xl font-semibold">18,450+</div><div className="text-indigo-200">Active jobs</div></div>
            <div><div className="text-3xl font-semibold">620+</div><div className="text-indigo-200">Companies</div></div>
            <div className="flex items-center gap-1"><span className="text-3xl font-semibold">4.98</span><span className="text-amber-400 text-2xl">★</span><div className="text-indigo-200 text-sm leading-none ml-1">from 4,872 reviews</div></div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-12 bg-gradient-to-br from-indigo-400/20 to-transparent rounded-[4rem] -rotate-6" />
          <img src={heroImg} alt="Happy Nepali professional celebrating new job offer" className="relative rounded-3xl shadow-2xl border border-white/30 animate-float" />
          <div className="absolute -top-6 -right-6 bg-white text-slate-900 px-6 py-4 rounded-3xl shadow-xl flex items-center gap-4">
            <div className="text-4xl">🎉</div>
            <div><div className="font-semibold">Hired in 14 days</div><div className="text-xs text-slate-500">Average time on Job Sarathi</div></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;