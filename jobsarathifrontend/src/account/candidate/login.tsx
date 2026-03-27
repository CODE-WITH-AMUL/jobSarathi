
// components/Login.tsx
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import type { LoginProps } from '../types/auth.types';
import { loginUser } from '../../api/api';

const Login: React.FC<LoginProps> = ({ onLogin = () => {}, onToggleForm = () => {} }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    // Clear API error when user types
    if (apiError) setApiError('');
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const data = await loginUser(formData);
      console.log('Login successful:', data);
      
      // Save tokens to localStorage
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      
      // Call onLogin callback
      onLogin(formData);
    } catch (error: any) {
      console.error('Login Error:', error);
      setApiError(
        error.response?.data?.message || 
        'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[400px] mx-auto">
        {/* Logo and Brand - Responsive */}



        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-8 border border-white/20">
          {/* API Error Message */}
          {apiError && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm sm:text-base text-red-600 text-center">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 text-sm sm:text-base border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 animate-pulse">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`block w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-3 text-sm sm:text-base border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 animate-pulse">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-xs sm:text-sm text-gray-700 cursor-pointer hover:text-indigo-600 transition-colors duration-200">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                disabled={isLoading}
                className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 hover:underline focus:outline-none disabled:opacity-50"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login - Responsive Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                disabled={isLoading}
                className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                disabled={isLoading}
                className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10A10 10 0 0010 0z" />
                </svg>
                GitHub
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 hover:underline focus:outline-none"
            >
              Sign up now
            </Link>
          </p>
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;