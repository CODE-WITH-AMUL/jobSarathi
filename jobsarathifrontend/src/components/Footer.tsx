// ======================
// components/Footer.tsx
// ======================
const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-y-16">
          <div className="md:col-span-5">
            <div className="flex items-center gap-x-3 text-white mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-bold">JS</div>
              <span className="font-semibold text-3xl tracking-tighter">Job Sarathi</span>
            </div>
            <p className="max-w-sm">Guiding Nepal’s talent since 2024. Trusted by thousands of job seekers and leading employers.</p>
            
            <div className="flex gap-6 mt-12">
              {['𝕏', 'LinkedIn', 'Facebook', 'Instagram'].map((s, i) => (
                <div key={i} className="w-10 h-10 border border-slate-700 hover:bg-slate-900 flex items-center justify-center rounded-2xl cursor-pointer transition-colors">{s}</div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="font-medium text-white mb-6">Platform</div>
            <div className="space-y-3 text-sm">
              <div>Browse Jobs</div>
              <div>Companies</div>
              <div>Salary Guide</div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="font-medium text-white mb-6">Company</div>
            <div className="space-y-3 text-sm">
              <div>About Us</div>
              <div>Careers at JS</div>
              <div>Blog</div>
              <div>Contact</div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="font-medium text-white mb-6">Get in touch</div>
            <div className="space-y-2 text-sm">
              <div>hello@jobsarathi.com</div>
              <div>+977 980 123 4567</div>
              <div className="pt-6">Thapathali, Kathmandu, Nepal</div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-20 pt-8 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
          <div>© 2026 Job Sarathi Pvt. Ltd. All rights reserved.</div>
          <div className="flex gap-6">
            <div>Privacy</div>
            <div>Terms</div>
            <div>Accessibility</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;