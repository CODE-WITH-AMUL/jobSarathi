// ======================
// components/HowItWorks.tsx
// ======================

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Create Profile",
      description: "Takes under 4 minutes. Our AI helps highlight your strengths and experience.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "from-blue-500 to-indigo-600"
    },
    {
      number: "02",
      title: "Get Smart Matches",
      description: "Receive tailored job recommendations daily based on your skills and preferences.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "from-emerald-500 to-teal-600"
    },
    {
      number: "03",
      title: "Apply & Interview",
      description: "One-click apply. Direct chat with recruiters and schedule interviews instantly.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <section id="how-it-works" className="bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
            SIMPLE PROCESS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Get hired in{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 text-transparent bg-clip-text">
              three simple steps
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            We've streamlined the job search process to help you land your dream role faster
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">

          {/* Connecting Line (hidden on mobile) */}
          <div className="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-emerald-200 to-purple-200 transform -translate-y-1/2"></div>

          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Step Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent relative z-10">

                {/* Icon with Gradient */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>

                {/* Step Number */}
                <div className="absolute top-8 right-8 text-6xl font-black text-gray-100 group-hover:text-gray-200 transition-colors">
                  {step.number}
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="mt-8 flex items-center gap-2">
                  <div className="w-12 h-1 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-full"></div>
                  <span className="text-sm text-gray-400">Step {index + 1}/3</span>
                </div>
              </div>


            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-24">
          <div className="inline-flex items-center gap-8 bg-white px-8 py-4 rounded-full shadow-md">
            <span className="text-gray-600">Ready to start your journey?</span>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors font-medium"
            >
              Get Started Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;