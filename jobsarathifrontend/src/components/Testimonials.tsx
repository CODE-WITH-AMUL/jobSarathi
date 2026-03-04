// ======================
//  components/Testimonials.tsx
// ======================
import avatar2Pac from "../assets/2pac.png";
import avatarTyler from "../assets/person1.png";
import avatarKaneya from "../assets/keney.png";

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: "2Pac",
      role: "American rapper and actor",
      company: "Death Row",
      quote:
        "Job Sarathi made my job search effortless. Landed my role at Pathao within 12 days!",
      avatar: avatar2Pac,
      rating: 5,
    },
    {
      id: 2,
      name: "Tyler",
      role: "Marketing Head",
      company: "SastoDeal",
      quote:
        "The best platform for professionals in Nepal. Transparent, fast, and trustworthy.",
      avatar: avatarTyler,
      rating: 5,
    },
    {
      id: 3,
      name: "Kaneya West",
      role: "American rapper",
      company: "Rapper",
      quote:
        "Found my dream leadership role. The salary transparency is a game changer.",
      avatar: avatarKaneya,
      rating: 4,
    },
  ];

  return (
    <section id="stories" className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-14">
        <h2 className="text-4xl font-semibold tracking-tight">Real stories from real Nepalis</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <div key={t.id} className="bg-white p-10 rounded-3xl border border-slate-100 h-full flex flex-col" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex gap-1 text-amber-400 mb-8">{Array.from({ length: t.rating }).map((_, i) => <span key={i}>★</span>)}</div>
            <p className="flex-1 text-lg leading-relaxed text-slate-700">“{t.quote}”</p>
            <div className="mt-12 flex items-center gap-4">
              <img src={t.avatar} alt={`${t.name} profile photo`} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white shadow" />
              <div>
                <div className="font-semibold text-slate-900">{t.name}</div>
                <div className="text-sm text-slate-500">{t.role} • {t.company}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;