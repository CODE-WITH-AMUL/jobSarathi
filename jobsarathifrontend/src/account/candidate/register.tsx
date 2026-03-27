// components/Register.tsx
import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import type { RegisterProps } from '../types/auth.types';
import { registerUser } from '../../api/api';

const Register: React.FC<RegisterProps> = ({ onRegister = () => {}, onToggleForm = () => {} }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // Clear API error when user types
    if (apiError) setApiError('');

    // Check password strength
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
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
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

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement
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
      const user = await registerUser(formData);
      console.log('Registration successful:', user);
      onRegister(formData);
    } catch (error: any) {
      console.error('Register Error:', error);
      setApiError(
        error.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex items-center justify-center p-4 sm:p-6 font-['Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',sans-serif]">
      <div className="w-full max-w-[480px] mx-auto">
        {/* Logo and Brand - Hand-drawn aesthetic */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-[#f0ede8] rounded-3xl shadow-sm border border-[#e2ddd5] mb-5 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
            <UserPlus className="w-10 h-10 sm:w-12 sm:h-12 text-[#4a3b2c] stroke-[1.5]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#2c241a]">join the circle</h2>
          <p className="text-sm sm:text-base text-[#7f6e5d] mt-2 max-w-[280px] mx-auto">create your space, your way</p>
        </div>

        {/* Register Card - Warm, textured look */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#efe8e0] p-6 sm:p-8 transition-all duration-200">
          {/* API Error Message */}
          {apiError && (
            <div className="mb-6 p-3 bg-[#fff6f0] border-l-4 border-[#e07c4c] rounded-md">
              <p className="text-sm text-[#b45a2e]">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-xs font-medium uppercase tracking-wide text-[#8b7a69] mb-2">
                username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[#cbbfa9] group-focus-within:text-[#6c5b48] transition-colors duration-150" />
                </div>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`block w-full pl-9 pr-3 py-2.5 text-sm border-b ${
                    errors.username ? 'border-[#e07c4c]' : 'border-[#e6dfd5]'
                  } bg-transparent focus:outline-none focus:border-[#b7a07e] transition-colors duration-150 disabled:bg-[#faf8f5] disabled:cursor-not-allowed placeholder:text-[#d9d0c3]`}
                  placeholder="johndoe_"
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-xs text-[#e07c4c]">{errors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wide text-[#8b7a69] mb-2">
                email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#cbbfa9] group-focus-within:text-[#6c5b48] transition-colors duration-150" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`block w-full pl-9 pr-3 py-2.5 text-sm border-b ${
                    errors.email ? 'border-[#e07c4c]' : 'border-[#e6dfd5]'
                  } bg-transparent focus:outline-none focus:border-[#b7a07e] transition-colors duration-150 disabled:bg-[#faf8f5] disabled:cursor-not-allowed placeholder:text-[#d9d0c3]`}
                  placeholder="hello@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-[#e07c4c]">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wide text-[#8b7a69] mb-2">
                password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#cbbfa9] group-focus-within:text-[#6c5b48] transition-colors duration-150" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`block w-full pl-9 pr-9 py-2.5 text-sm border-b ${
                    errors.password ? 'border-[#e07c4c]' : 'border-[#e6dfd5]'
                  } bg-transparent focus:outline-none focus:border-[#b7a07e] transition-colors duration-150 disabled:bg-[#faf8f5] disabled:cursor-not-allowed placeholder:text-[#d9d0c3]`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[#cbbfa9] hover:text-[#6c5b48] transition-colors duration-150" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#cbbfa9] hover:text-[#6c5b48] transition-colors duration-150" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-[#a2917c]">strength</span>
                    <span className="text-[11px] font-medium text-[#5e4e3c]">
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-[#ece4db] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStrengthColor()} transition-all duration-300 ease-out`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-5 gap-1 mt-2">
                    <span className="text-[9px] text-[#b8aa99] text-center">8+ chars</span>
                    <span className="text-[9px] text-[#b8aa99] text-center">a-z</span>
                    <span className="text-[9px] text-[#b8aa99] text-center">A-Z</span>
                    <span className="text-[9px] text-[#b8aa99] text-center">0-9</span>
                    <span className="text-[9px] text-[#b8aa99] text-center">!@#$&</span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1.5 text-xs text-[#e07c4c]">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium uppercase tracking-wide text-[#8b7a69] mb-2">
                confirm password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CheckCircle className="h-4 w-4 text-[#cbbfa9] group-focus-within:text-[#6c5b48] transition-colors duration-150" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`block w-full pl-9 pr-9 py-2.5 text-sm border-b ${
                    errors.confirmPassword ? 'border-[#e07c4c]' : 'border-[#e6dfd5]'
                  } bg-transparent focus:outline-none focus:border-[#b7a07e] transition-colors duration-150 disabled:bg-[#faf8f5] disabled:cursor-not-allowed placeholder:text-[#d9d0c3]`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-[#cbbfa9] hover:text-[#6c5b48] transition-colors duration-150" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#cbbfa9] hover:text-[#6c5b48] transition-colors duration-150" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-[#e07c4c]">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start pt-1">
              <div className="flex items-center h-5">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-3.5 w-3.5 rounded border-[#d6cdc0] text-[#9b8468] focus:ring-0 focus:ring-offset-0 focus:ring-[#cbb79c] cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
              <div className="ml-2">
                <label htmlFor="agreeTerms" className="text-xs text-[#7f6e5d] cursor-pointer hover:text-[#5e4e3c] transition-colors duration-150">
                  i agree to the{' '}
                  <a href="#" className="text-[#9b8468] hover:text-[#6c5b48] border-b border-dotted border-[#d6cdc0]">
                    terms of service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-[#9b8468] hover:text-[#6c5b48] border-b border-dotted border-[#d6cdc0]">
                    privacy policy
                  </a>
                </label>
                {errors.agreeTerms && (
                  <p className="mt-1 text-xs text-[#e07c4c]">{errors.agreeTerms}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 px-4 text-sm font-medium tracking-wide text-white bg-[#8b765c] hover:bg-[#6c5b48] focus:outline-none focus:ring-1 focus:ring-[#b7a07e] focus:ring-offset-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  creating...
                </span>
              ) : (
                'create account →'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e6dfd5]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-[#b8aa99]">or join with</span>
              </div>
            </div>

            {/* Social Sign Up - Simple row */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-3 py-2.5 border border-[#e6dfd5] rounded-full text-xs font-medium text-[#5e4e3c] bg-white hover:bg-[#faf8f5] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
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
                className="flex items-center justify-center gap-2 px-3 py-2.5 border border-[#e6dfd5] rounded-full text-xs font-medium text-[#5e4e3c] bg-white hover:bg-[#faf8f5] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10A10 10 0 0010 0z" />
                </svg>
                GitHub
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-xs text-[#8b7a69]">
            already have an account?{' '}
            <Link
              to="/login"
              className="text-[#9b8468] hover:text-[#6c5b48] border-b border-dotted border-[#d6cdc0] transition-colors duration-150"
            >
              sign in →
            </Link>
          </p>
        </div>

        {/* Back to Home Link */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#b8aa99] hover:text-[#8b7a69] transition-colors duration-150"
          >
            <ArrowLeft size={14} />
            back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;