import {
  BriefcaseIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Verified Job Listings',
    description:
      'Access carefully reviewed job opportunities from trusted companies across multiple industries and experience levels.',
    icon: BriefcaseIcon,
  },
  {
    name: 'Direct Employer Connection',
    description:
      'Build your professional profile and connect directly with recruiters and hiring managers in real time.',
    icon: UserGroupIcon,
  },
  {
    name: 'Smart Job Search',
    description:
      'Use advanced filters and intelligent recommendations to discover roles tailored to your skills and career goals.',
    icon: MagnifyingGlassIcon,
  },
  {
    name: 'Secure & Reliable Platform',
    description:
      'Your data is protected with modern security standards, ensuring a safe and trustworthy job searching experience.',
    icon: ShieldCheckIcon,
  },
]

export default function FeatureSection() {
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold text-blue-500">
            Why Choose Job Sarathi
          </h2>

          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Everything You Need to Advance Your Career
          </p>

          <p className="mt-6 text-lg text-gray-300">
            Job Sarathi provides a modern platform for job seekers and employers, 
            making hiring and career growth simple, efficient, and reliable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-lg font-semibold text-white">
                  <div className="absolute top-0 left-0 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
                    <feature.icon
                      aria-hidden="true"
                      className="h-6 w-6 text-white"
                    />
                  </div>
                  {feature.name}
                </dt>

                <dd className="mt-2 text-base text-gray-400 leading-relaxed">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
