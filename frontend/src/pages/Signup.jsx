import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, AlertCircle, Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    grade: '11',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password_confirm: formData.password_confirm,
      first_name: formData.first_name,
      last_name: formData.last_name,
      grade: formData.grade,
    });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-mentara-dark flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-mentara-cyan/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-mentara-teal/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-mentara-cyan to-mentara-teal rounded-mentara-sm flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-mentara-dark" />
            </div>
            <span className="text-3xl font-bold text-gradient">Mentara</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-mentara-muted">Start your IB Physics mastery journey</p>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {(error || authError) && (
              <div className="flex items-center space-x-2 p-4 bg-mentara-error/10 border border-mentara-error/30 rounded-mentara-sm text-mentara-error">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error || authError}</span>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mentara-muted w-5 h-5" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="input-mentara pl-11"
                  placeholder="johndoe"
                />
              </div>
              <p className="text-xs text-mentara-muted mt-1">
                Choose a unique username for login
              </p>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="input-mentara"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="input-mentara"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mentara-muted w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-mentara pl-11"
                  placeholder="student@example.com"
                />
              </div>
            </div>

            {/* Grade Selection */}
            <div>
              <label htmlFor="grade" className="block text-sm font-medium mb-2">
                Grade/Year
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mentara-muted w-5 h-5" />
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="input-mentara pl-11 appearance-none"
                >
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11 (IB DP Year 1)</option>
                  <option value="12">Grade 12 (IB DP Year 2)</option>
                </select>
              </div>
            </div>

            {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mentara-muted w-5 h-5" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-mentara pl-11"
                  placeholder="Min. 8 characters"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mentara-muted w-5 h-5" />
                <input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                  className="input-mentara pl-11"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-mentara-muted">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-mentara-cyan hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-mentara-cyan hover:underline">
                Privacy Policy
              </Link>
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-mentara btn-primary text-lg py-4 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>
        </motion.div>

        {/* Login Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-6 text-mentara-muted"
        >
          Already have an account?{' '}
          <Link to="/login" className="text-mentara-cyan hover:text-mentara-teal transition-colors font-medium">
            Log In
          </Link>
        </motion.p>
      </div>
    </div>
  );
};

export default Signup;
