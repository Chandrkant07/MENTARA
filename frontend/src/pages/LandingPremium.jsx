import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sparkles, Zap, Trophy, Target, TrendingUp, Users, BookOpen, 
  ArrowRight, Check, Star, Award, Rocket, Brain, Clock, ChevronRight
} from 'lucide-react';
import '../styles/premium-theme.css';

const LandingPremium = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Adaptive test engine that learns from your performance',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Trophy,
      title: 'Gamified Experience',
      description: 'Earn badges, climb leaderboards, and track progress',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: 'Targeted Practice',
      description: 'Focus on weak areas with smart topic-wise analytics',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Clock,
      title: 'Timed Tests',
      description: 'Real exam simulation with auto-timers and instant results',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Active Students', icon: Users },
    { value: '50K+', label: 'Questions', icon: BookOpen },
    { value: '95%', label: 'Success Rate', icon: TrendingUp },
    { value: '500+', label: 'Mock Tests', icon: Award }
  ];

  const benefits = [
    'Comprehensive question bank across all subjects',
    'Real-time performance analytics and insights',
    'Teacher-led evaluation for structured responses',
    'Daily/Weekly leaderboards to track your rank',
    'Instant results with detailed solutions',
    'Mobile-friendly interface for learning on-the-go'
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0F] overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Mentara</h1>
                <p className="text-xs text-gray-400">Test Prep Platform</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (user?.role === 'ADMIN') navigate('/admin/dashboard');
                    else if (user?.role === 'TEACHER') navigate('/teacher/dashboard');
                    else navigate('/dashboard');
                  }}
                  className="btn-premium"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 inline ml-2" />
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="px-6 py-2 text-white hover:text-purple-400 transition-colors font-semibold"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/signup')}
                    className="btn-premium"
                  >
                    Get Started
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-20">
        <div className="absolute inset-0 animated-gradient opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A0B0F_70%)]" />
        
        <motion.div
          style={{ opacity, scale }}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8"
          >
            <Rocket className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">The Future of Test Preparation</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Ace Your Exams with
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Smart Practice
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto"
          >
            Premium test-prep platform with AI-powered analytics, gamified learning, 
            and comprehensive question banks. Designed for serious students.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl text-lg shadow-lg"
            >
              Start Learning Free
              <Sparkles className="w-5 h-5 inline ml-2" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-lg border border-white/10 transition-all"
            >
              Watch Demo
              <ChevronRight className="w-5 h-5 inline ml-2" />
            </motion.button>
          </motion.div>

          {/* Floating Cards */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="glass-card p-6 text-center"
              >
                <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-2 bg-purple-400 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="text-purple-400">Mentara</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Advanced features designed to accelerate your learning and maximize your scores
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="premium-card group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-purple-500/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Everything You Need to <span className="text-purple-400">Excel</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Comprehensive features that adapt to your learning style and help you achieve your goals faster.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-white font-medium">{benefit}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card p-8">
                <div className="space-y-6">
                  {[
                    { label: 'Question Accuracy', value: 85, color: 'from-purple-500 to-pink-500' },
                    { label: 'Time Management', value: 92, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Concept Mastery', value: 78, color: 'from-green-500 to-emerald-500' }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-white font-semibold">{item.label}</span>
                        <span className="text-purple-400 font-bold">{item.value}%</span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.value}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + idx * 0.2, duration: 1 }}
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center premium-card bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
        >
          <Zap className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of students who are already achieving their goals with Mentara
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')}
            className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl text-lg shadow-lg"
          >
            Start Your Journey Today
            <ArrowRight className="w-5 h-5 inline ml-2" />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2025 Mentara. Built with ❤️ for students who dream big.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPremium;
