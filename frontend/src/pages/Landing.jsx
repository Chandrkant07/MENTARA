import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Award, Clock, BarChart3, Users } from 'lucide-react';
import CurriculumAdsSection from '../components/marketing/CurriculumAdsSection';
import ProductUniquenessSection from '../components/marketing/ProductUniquenessSection';

const Landing = () => {
  const features = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Timed Tests',
      description: 'Real exam conditions with auto-save and smart timer',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Advanced Analytics',
      description: 'Track your progress with detailed performance insights',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Adaptive Learning',
      description: 'AI-powered recommendations based on your strengths',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Gamification',
      description: 'Earn badges, climb leaderboards, maintain streaks',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Teacher Evaluation',
      description: 'Get personalized feedback from expert teachers',
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Premium Experience',
      description: 'Apple-inspired design with buttery-smooth interactions',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Students' },
    { value: '500+', label: 'Practice Tests' },
    { value: '95%', label: 'Success Rate' },
    { value: '4.9★', label: 'User Rating' },
  ];

  return (
    <div className="min-h-screen bg-mentara-dark overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-mentara-elevated/20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-mentara-cyan to-mentara-teal rounded-mentara-sm flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-mentara-dark" />
            </div>
            <span className="text-2xl font-bold text-gradient">Mentara</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <Link to="/login" className="text-mentara-text hover:text-mentara-cyan transition-colors">
              Login
            </Link>
            <Link to="/signup" className="btn-mentara btn-primary">
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-mentara-cyan/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-mentara-cyan/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-mentara-teal/10 rounded-full blur-3xl" />

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-mentara-elevated/50 rounded-full mb-6 border border-mentara-cyan/20">
              <Sparkles className="w-4 h-4 text-mentara-cyan" />
              <span className="text-sm text-mentara-cyan">Premium Test-Prep Platform</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              Master Physics <br />
              <span className="text-gradient">with Mentara</span>
            </h1>

            <p className="text-xl md:text-2xl text-mentara-muted max-w-3xl mx-auto mb-12 leading-relaxed">
              A workflow-first test-prep platform with timed exams, structured uploads,
              teacher evaluation, and analytics—built for real exam preparation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/signup" className="btn-mentara btn-primary text-lg px-8 py-4">
                Start Free Trial
              </Link>
              <Link to="/login" className="btn-mentara btn-ghost text-lg px-8 py-4">
                Login
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-mentara-muted">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <CurriculumAdsSection
        title="Curriculums & exam tracks"
        subtitle="IB, ICSE, CBSE, and Cambridge-style practice—organized as real curriculum trees with exam-grade workflows."
        ctaLabel="Explore Courses"
        ctaHref="/courses"
      />

      <ProductUniquenessSection />

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to <span className="text-gradient">Excel</span>
            </h2>
            <p className="text-xl text-mentara-muted max-w-2xl mx-auto">
              Premium features designed to help you ace your IB Physics exams
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="card-mentara group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-mentara-cyan/20 to-mentara-teal/20 rounded-mentara-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-mentara-cyan">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-mentara-muted leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-mentara-lg p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-mentara-cyan/10 to-mentara-teal/10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to <span className="text-gradient">Excel</span>?
              </h2>
              <p className="text-xl text-mentara-muted mb-8 max-w-2xl mx-auto">
                Join thousands of students who are mastering IB Physics with Mentara
              </p>
              <Link to="/signup" className="btn-mentara btn-primary text-lg px-8 py-4 inline-block">
                Start Your Journey
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-mentara-elevated/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-mentara-cyan to-mentara-teal rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-mentara-dark" />
              </div>
              <span className="text-xl font-bold text-gradient">Mentara</span>
            </div>
            <p className="text-mentara-muted">
              © 2025 Mentara. Premium test-prep platform for IB Physics.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
