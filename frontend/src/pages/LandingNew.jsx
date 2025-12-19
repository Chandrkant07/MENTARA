import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Target, Award, TrendingUp, Users, Zap, 
  CheckCircle, Star, ArrowRight, Menu, X, 
  BarChart3, Clock, Shield 
} from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Smart Test Engine',
      description: 'AI-powered adaptive tests that adjust to your learning pace',
      color: 'primary',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Advanced Analytics',
      description: 'Track progress with detailed insights and performance metrics',
      color: 'secondary',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Timed Practice',
      description: 'Realistic exam environment with per-question timers',
      color: 'primary',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Gamification',
      description: 'Earn badges, maintain streaks, and compete on leaderboards',
      color: 'secondary',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Teacher Support',
      description: 'Get personalized feedback from expert teachers',
      color: 'primary',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security',
      color: 'secondary',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Practice Questions' },
    { number: '95%', label: 'Success Rate' },
    { number: '50,000+', label: 'Active Students' },
    { number: '4.9/5', label: 'User Rating' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'IB Student',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      content: 'Mentara helped me improve my scores by 30%. The analytics feature is a game-changer!',
    },
    {
      name: 'Michael Chen',
      role: 'A-Level Student',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      content: 'Best test prep platform I\'ve used. The UI is so smooth and intuitive!',
    },
    {
      name: 'Emma Wilson',
      role: 'Teacher',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      content: 'As a teacher, I love how easy it is to create tests and track student progress.',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-base text-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-large' : 'bg-transparent'
        }`}
      >
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-xl flex items-center justify-center group-hover:shadow-glow transition-all">
                <BookOpen className="w-6 h-6 text-dark-base" />
              </div>
              <span className="text-2xl font-bold">Mentara</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How It Works</a>
              <a href="#testimonials" className="nav-link">Testimonials</a>
              <Link to="/login" className="btn-ghost">Log In</Link>
              <Link to="/signup" className="btn-primary">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-dark-hover rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 flex flex-col gap-3"
            >
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How It Works</a>
              <a href="#testimonials" className="nav-link">Testimonials</a>
              <Link to="/login" className="btn-outline w-full">Log In</Link>
              <Link to="/signup" className="btn-primary w-full">
                Get Started
              </Link>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-200/10 border border-primary-200/20 rounded-full mb-8 animate-pulse-soft">
              <Zap className="w-4 h-4 text-primary-200" />
              <span className="text-sm font-semibold text-primary-200">
                India's #1 Test Prep Platform
              </span>
            </div>

            <h1 className="heading-1 mb-6 bg-gradient-to-r from-white via-primary-200 to-secondary-200 bg-clip-text text-transparent">
              Master Your Exams with
              <br />
              Smart Test Preparation
            </h1>

            <p className="text-xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of students who are acing their exams with our AI-powered
              platform. Practice smarter, not harder.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary text-lg px-8 py-4">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="btn-outline text-lg px-8 py-4">
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="card-elevated text-center"
                >
                  <div className="text-3xl font-bold text-primary-200 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-dark-surface">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="heading-2 mb-4"
            >
              Why Choose Mentara?
            </motion.h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Everything you need to ace your exams in one powerful platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-hover group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-200/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <div className={`text-${feature.color}-200`}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="heading-2 mb-4"
            >
              Get Started in 3 Simple Steps
            </motion.h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {[
              { number: '01', title: 'Sign Up', description: 'Create your free account in seconds' },
              { number: '02', title: 'Choose Your Path', description: 'Select from thousands of curated practice tests' },
              { number: '03', title: 'Start Learning', description: 'Practice, analyze, and improve your scores' },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex gap-6 mb-8 last:mb-0"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-200 to-secondary-200 flex items-center justify-center text-2xl font-bold text-dark-base">
                  {step.number}
                </div>
                <div className="flex-1 card-elevated">
                  <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-dark-surface">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="heading-2 mb-4"
            >
              Loved by Students & Teachers
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-hover"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-muted leading-relaxed">{testimonial.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card-elevated text-center max-w-3xl mx-auto bg-gradient-to-br from-primary-200/10 to-secondary-200/10 border-primary-200/20"
          >
            <h2 className="heading-3 mb-4">Ready to Ace Your Exams?</h2>
            <p className="text-xl text-muted mb-8">
              Join thousands of students who are already improving their scores
            </p>
            <Link to="/signup" className="btn-primary text-lg px-8 py-4">
              Start Your Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-dark-border">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-dark-base" />
                </div>
                <span className="text-xl font-bold">Mentara</span>
              </div>
              <p className="text-muted">
                India's #1 test preparation platform for students
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="flex flex-col gap-2">
                <a href="#features" className="text-muted hover:text-white">Features</a>
                <a href="#" className="text-muted hover:text-white">Pricing</a>
                <a href="#" className="text-muted hover:text-white">FAQ</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-muted hover:text-white">About</a>
                <a href="#" className="text-muted hover:text-white">Blog</a>
                <a href="#" className="text-muted hover:text-white">Careers</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-muted hover:text-white">Privacy</a>
                <a href="#" className="text-muted hover:text-white">Terms</a>
                <a href="#" className="text-muted hover:text-white">Cookie Policy</a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-dark-border text-center text-muted">
            <p>&copy; 2025 Mentara. All rights reserved. Built with ❤️ by DJ Brothers</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
