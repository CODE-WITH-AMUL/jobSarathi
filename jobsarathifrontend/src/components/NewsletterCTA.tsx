// ======================
// components/NewsletterCTA.tsx
// ======================
import React from 'react';

interface NewsletterCTAProps {
  newsletterEmail: string;
  setNewsletterEmail: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const NewsletterCTA: React.FC<NewsletterCTAProps> = ({ 
  newsletterEmail, 
  setNewsletterEmail, 
  onSubmit 
}) => {
  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-indigo-50 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-emerald-50 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          
          {/* Minimal Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
            STAY UPDATED
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
            Never miss an{' '}
            <span className="font-medium bg-gradient-to-r from-indigo-600 to-emerald-600 text-transparent bg-clip-text">
              opportunity
            </span>
          </h2>
          
          {/* Subheading */}
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Join thousands of professionals who receive weekly job alerts and career insights.
          </p>

          {/* Form */}
          <form onSubmit={onSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 p-1">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all placeholder:text-gray-400"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>

            {/* Form Footer */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-5 text-xs text-gray-400">
              <span>✓ No spam</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>✓ Unsubscribe anytime</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>✓ Privacy first</span>
            </div>
          </form>

          {/* Social Proof - Minimal */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-600"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">50k+</span> readers
              </span>
            </div>
            
            <div className="h-4 w-px bg-gray-200"></div>
            
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-sm text-gray-400 ml-1">4.9</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
    </section>
  );
};

export default NewsletterCTA;