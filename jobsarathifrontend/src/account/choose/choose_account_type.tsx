

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, Users, ArrowRight, CheckCircle } from 'lucide-react';
import Navbar from '../../components/NavBar';

interface AccountOption {
  id: 'candidate' | 'company';
  label: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
}

const ChooseAccountType: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'company' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const authMode = searchParams.get('mode') === 'login' ? 'login' : 'register';

  const accountOptions: AccountOption[] = [
    {
      id: 'candidate',
      label: 'Job Seeker',
      description: 'Find and apply for jobs that match your skills',
      icon: <Users className="w-12 h-12" />,
      benefits: [
        'Browse job listings',
        'Apply to positions',
        'Track applications',
        'Upload resume'
      ]
    },
    {
      id: 'company',
      label: 'Employer',
      description: 'Post jobs and manage your hiring process',
      icon: <Briefcase className="w-12 h-12" />,
      benefits: [
        'Post job listings',
        'Review applications',
        'Manage candidates',
        'Team collaboration'
      ]
    }
  ];

  const handleSelectRole = async (role: 'candidate' | 'company') => {
    setSelectedRole(role);
    setIsLoading(true);

    try {
      // Store selected role in localStorage for context
      localStorage.setItem('selectedAccountRole', role);
      
      // Redirect to selected role's login/register page
      navigate(`/account/${role}/${authMode}`);
    } catch (error) {
      console.error('Error selecting account type:', error);
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <Navbar />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Account Type
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Select the option that best describes you to get started
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {accountOptions.map((option) => (
              <div
                key={option.id}
                className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedRole === option.id ? 'scale-105' : ''
                }`}
                onClick={() => !isLoading && handleSelectRole(option.id)}
              >
                <div
                  className={`bg-white/80 backdrop-blur-lg rounded-2xl p-8 border-2 transition-all duration-300 ${
                    selectedRole === option.id
                      ? 'border-indigo-500 shadow-2xl'
                      : 'border-white/20 hover:border-indigo-300 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {/* Selected Badge */}
                  {selectedRole === option.id && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle className="w-6 h-6 text-indigo-500" />
                    </div>
                  )}

                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-full transition-all duration-300 ${
                      selectedRole === option.id
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {option.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                    {option.label}
                  </h2>
                  <p className="text-gray-600 text-center mb-6">
                    {option.description}
                  </p>

                  {/* Benefits List */}
                  <ul className="space-y-3 mb-8">
                    {option.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <button
                    className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                      selectedRole === option.id
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    } ${isLoading && selectedRole === option.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoading && selectedRole === option.id}
                  >
                    {isLoading && selectedRole === option.id ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Loading...
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Login Link */}
          <div className="text-center mt-12">
            <p className="text-gray-600">
              {authMode === 'login' ? 'Need an account? ' : 'Already have an account? '}
              <button
                onClick={() => navigate(`/account/choose?mode=${authMode === 'login' ? 'register' : 'login'}`)}
                className="text-indigo-600 hover:text-indigo-700 font-semibold underline"
              >
                {authMode === 'login' ? 'Register here' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseAccountType;