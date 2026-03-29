// components/Register.tsx
import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { RegisterProps } from '../types/auth.types';
import { registerUser } from '../../api/api';
import Navbar from '@/components/NavBar';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const errorData = error as Record<string, unknown>;

  if (typeof errorData.detail === 'string') {
    return errorData.detail;
  }

  if (typeof errorData.message === 'string') {
    return errorData.message;
  }

  for (const value of Object.values(errorData)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
      return value[0];
    }
    if (typeof value === 'string') {
      return value;
    }
  }

  return fallback;
};

const Register: React.FC<RegisterProps> = ({ onRegister = () => {} }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
    if (apiError) setApiError('');
    if (name === 'password') checkPasswordStrength(value);
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[$@#&!]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    return ['bg-gray-200','bg-red-500','bg-orange-500','bg-yellow-500','bg-blue-500','bg-green-500'][passwordStrength];
  };

  const getStrengthText = () => {
    return ['Enter','Weak','Fair','Good','Strong','Very Strong'][passwordStrength];
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'At least 3 chars';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) newErrors.username = 'Only letters, numbers, _';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Min 8 chars';
    else if (!/[a-z]/.test(formData.password)) newErrors.password = 'Add lowercase';
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Add uppercase';
    else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Add number';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.agreeTerms) newErrors.agreeTerms = 'Agree to terms';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length) return setErrors(newErrors);
    setIsLoading(true);
    setApiError('');
    try {
      const user = await registerUser(formData);
      console.log('Registration success:', user);
      onRegister(formData);
      navigate('/account/candidate/login');
    } catch (err: unknown) {
      setApiError(getErrorMessage(err, 'Registration failed'));
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <Navbar />

      <div className="flex justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 sm:p-8">

          {apiError && (
            <p className="mb-4 p-2 bg-[#fff6f0] text-[#b45a2e] rounded">{apiError}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <InputField
              id="username" label="Username" name="username"
              type="text" icon={<User className="h-4 w-4 text-[#cbbfa9]" />}
              value={formData.username} onChange={handleChange} error={errors.username} disabled={isLoading}
              placeholder="johndoe_" />

            {/* Email */}
            <InputField
              id="email" label="Email" name="email" type="email"
              icon={<Mail className="h-4 w-4 text-[#cbbfa9]" />}
              value={formData.email} onChange={handleChange} error={errors.email} disabled={isLoading}
              placeholder="hello@example.com" />

            {/* Password */}
            <InputField
              id="password" label="Password" name="password" type={showPassword ? 'text' : 'password'}
              icon={<Lock className="h-4 w-4 text-[#cbbfa9]" />}
              value={formData.password} onChange={handleChange} error={errors.password} disabled={isLoading}
              showToggle={true} show={showPassword} onToggle={() => setShowPassword(!showPassword)}
              placeholder="••••••••" />

            {formData.password && (
              <div className="mt-1 text-[11px] flex justify-between text-[#5e4e3c]">
                <span>Strength: {getStrengthText()}</span>
                <div className="h-1 w-24 bg-[#ece4db] rounded">
                  <div className={`h-full ${getStrengthColor()}`} style={{ width: `${(passwordStrength/5)*100}%` }}></div>
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <InputField
              id="confirmPassword" label="Confirm Password" name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              icon={<CheckCircle className="h-4 w-4 text-[#cbbfa9]" />}
              value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword}
              disabled={isLoading} showToggle={true} show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              placeholder="••••••••" />

            {/* Terms */}
            <div className="flex items-center gap-2 text-xs text-[#7f6e5d]">
              <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} disabled={isLoading} />
              <span>I agree to <a href="#" className="text-[#9b8468] underline">terms</a> and <a href="#" className="text-[#9b8468] underline">privacy</a></span>
            </div>
            {errors.agreeTerms && <p className="text-xs text-[#e07c4c]">{errors.agreeTerms}</p>}

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-[#8b765c] text-white rounded-full text-sm hover:bg-[#6c5b48] transition">
              {isLoading ? 'Creating...' : 'Create Account →'}
            </button>

            <p className="text-center text-xs text-[#8b7a69]">
              Already have an account? <Link to="/account/candidate/login" className="text-[#9b8468] underline">Sign in →</Link>
            </p>

          </form>

          <div className="mt-4 text-center text-xs">
            <Link to="/" className="text-[#b8aa99] hover:text-[#8b7a69] inline-flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

// Reusable input component
interface InputFieldProps {
  id: string;
  label: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  showToggle?: boolean;
  show?: boolean;
  onToggle?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, name, type, icon, value, onChange, error, disabled, placeholder, showToggle, show, onToggle }) => (
  <div>
    <label htmlFor={id} className="block text-xs text-[#8b7a69] mb-1">{label}</label>
    <div className="relative">
      <div className="absolute left-2 top-2.5">{icon}</div>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`pl-8 pr-10 py-2.5 w-full text-sm border-b ${error ? 'border-[#e07c4c]' : 'border-[#e6dfd5]'} focus:outline-none focus:border-[#b7a07e]`}
      />
      {showToggle && onToggle && (
        <button type="button" onClick={onToggle} className="absolute right-2 top-2.5">
          {show ? <EyeOff className="h-4 w-4 text-[#cbbfa9]" /> : <Eye className="h-4 w-4 text-[#cbbfa9]" />}
        </button>
      )}
    </div>
    {error && <p className="text-xs text-[#e07c4c] mt-1">{error}</p>}
  </div>
);

export default Register;