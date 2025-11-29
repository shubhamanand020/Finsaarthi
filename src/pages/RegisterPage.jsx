import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Eye, EyeOff, BookOpen, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const { login } = useAuth();
  const { addUser, data } = useLocalStorage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (data.users.some(user => user.email === formData.email)) {
      setError('An account with this email already exists.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const newUser = addUser({
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        role: 'student',
      });

      login({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      });

      navigate('/dashboard');

    } catch (err) {
      setError('An error occurred while creating your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">

        {/* ICON */}
        <div>
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>

          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Join FinSaarthi Today
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account and start applying for scholarships
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* FULL NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your full name"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your email"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>

              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Create a password"
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>

              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Confirm your password"
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 text-white rounded-lg font-medium bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {/* LOGIN LINK */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-orange-600 font-medium hover:text-orange-500"
                >
                  Sign in here
                </Link>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};