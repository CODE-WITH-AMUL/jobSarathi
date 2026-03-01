// ======================
//  components/HowItWorks.tsx
// ======================
const HowItWorks: React.FC = () => {
    return (
      <section id="how" className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline px-5 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">3 SIMPLE STEPS</div>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-900 mt-6">Get hired faster than ever</h2>
          </div>
  
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Create Profile", desc: "Takes under 4 minutes. Our AI helps highlight your strengths." },
              { num: "02", title: "Get Smart Matches", desc: "Receive tailored job recommendations daily." },
              { num: "03", title: "Apply & Interview", desc: "One-click apply. Direct chat with recruiters." }
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-3xl p-10 h-full border border-transparent hover:border-emerald-200 transition-all group" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="text-6xl font-black text-slate-100 group-hover:text-emerald-100 transition-colors">{step.num}</div>
                <h3 className="text-2xl font-semibold mt-8 mb-4 tracking-tight">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  export default HowItWorks;