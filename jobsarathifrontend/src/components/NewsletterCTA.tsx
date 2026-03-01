// ======================
//  components/NewsletterCTA.tsx
// ======================
interface NewsletterCTAProps {
  newsletterEmail: string;
  setNewsletterEmail: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const NewsletterCTA: React.FC<NewsletterCTAProps> = ({ newsletterEmail, setNewsletterEmail, onSubmit }) => {
  return (
    <section className="bg-indigo-600 py-20 text-white">
      <div className="max-w-2xl mx-auto text-center px-6">
        <h2 className="text-4xl font-semibold tracking-tight">Never miss a great opportunity</h2>
        <p className="mt-4 text-indigo-100 text-lg">Weekly job alerts and career tips straight to your inbox.</p>

        <form onSubmit={onSubmit} className="mt-10 max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <input type="email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="your@email.com" className="flex-1 bg-white text-slate-900 px-7 py-5 rounded-3xl focus:outline-none text-base placeholder:text-slate-400" required />
            <button type="submit" className="px-10 py-5 bg-white hover:bg-slate-100 text-indigo-700 font-semibold rounded-3xl transition-all active:scale-95 whitespace-nowrap">Subscribe Free</button>
          </div>
          <p className="text-xs text-indigo-200 mt-4">Zero spam. Unsubscribe anytime.</p>
        </form>
      </div>
    </section>
  );
};

export default NewsletterCTA;