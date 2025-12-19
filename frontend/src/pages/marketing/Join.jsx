import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarketingPageShell from '../../components/marketing/MarketingPageShell';

export default function Join() {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Student',
      icon: GraduationCap,
      desc: 'Practice, take exams, view results, and improve fast.',
      cta: 'Create Student Account',
      onClick: () => navigate('/signup'),
    },
    {
      title: 'Teacher',
      icon: Users,
      desc: 'Grade attempts, upload evaluated PDFs, and guide students.',
      cta: 'Login as Teacher',
      onClick: () => navigate('/login'),
    },
    {
      title: 'Admin',
      icon: ShieldCheck,
      desc: 'Manage topics, questions, exams, users, and everything else.',
      cta: 'Login as Admin',
      onClick: () => navigate('/login'),
    },
  ];

  return (
    <MarketingPageShell>
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-white"
            >
              Join Now
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"> and enter the future</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 text-gray-400 text-lg max-w-xl"
            >
              Pick your role and jump in. The platform adapts automatically.
            </motion.p>

            <div className="mt-8 glass-card p-6">
              <img
                src="/marketing/hero-auth.svg"
                alt="Join illustration"
                className="w-full rounded-2xl border border-white/10"
                loading="lazy"
              />
            </div>
          </div>

          <div className="grid gap-5">
            {cards.map((c) => (
              <div key={c.title} className="premium-card">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <c.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-xl">{c.title}</div>
                    <div className="mt-2 text-gray-400">{c.desc}</div>
                    <button
                      type="button"
                      onClick={c.onClick}
                      className="mt-5 btn-premium inline-flex items-center gap-2"
                    >
                      {c.cta} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
