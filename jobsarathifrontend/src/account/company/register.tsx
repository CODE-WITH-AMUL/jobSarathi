// components/CompanyRegister.tsx
import React, { useState } from 'react';
import { Mail, Lock, Building2, Eye, EyeOff, UserPlus, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/NavBar';
import api from '../../api/apiClient';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  company_name: string;
  agreeTerms: boolean;
}

const CompanyRegister: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    company_name: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    if (apiError) setApiError('');

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password: string): void => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthColor = (): string => {
    switch(passwordStrength) {
      case 0: return 'bg-gray-200';
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-blue-500';
      case 5: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const getStrengthText = (): string => {
    switch(passwordStrength) {
      case 0: return 'Enter password';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      case 5: return 'Very Strong';
      default: return '';
    }
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.company_name) {
      newErrors.company_name = 'Company name is required';
    } else if (formData.company_name.length < 2) {
      newErrors.company_name = 'Company name must be at least 2 characters';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Include at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Include at least one uppercase letter';
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Include at least one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await api.post('/api/auth/company/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        company_name: formData.company_name,
      });
      
      console.log('Company registration successful:', response.data);
      
      // Optionally save tokens if provided
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
      }
      
      // Redirect to company login
      navigate('/account/company/login');
    } catch (error: any) {
      console.error('Company Register Error:', error);
      setApiError(
        error.response?.data?.message || 
        error.response?.data?.detail ||
        'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <Navbar />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-[450px]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Building2 className="w-12 h-12 text-indigo-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Register Your Company
            </h1>
            <p className="text-gray-600">
              Start posting jobs and hiring talent today
            </p>
          </div>

          {/* Register Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
            {/* API Error Message */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Name */}
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Your Company Name"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.company_name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                {errors.company_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.username
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="company@example.com"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.password
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${getStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 min-w-fit">{getStrengthText()}</span>
                    </div>
                  )}
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 rounded"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to="#" className="text-indigo-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="#" className="text-indigo-600 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="text-red-500 text-xs">{errors.agreeTerms}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Company Account
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/account/company/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegister;
