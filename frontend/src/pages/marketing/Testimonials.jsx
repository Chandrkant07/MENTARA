import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import MarketingPageShell from '../../components/marketing/MarketingPageShell';

export default function Testimonials() {
  const quotes = [
    {
      name: 'Student',
      role: 'IB DP Year 2',
      text: 'The UI feels premium. Taking tests is smooth, and the review makes mistakes obvious.',
    },
    {
      name: 'Teacher',
      role: 'Evaluator',
      text: 'Grading is clean. Uploading evaluated PDFs and leaving remarks is fast and organized.',
    },
    {
      name: 'Admin',
      role: 'Coordinator',
      text: 'Creating topics, questions, and exams is straightforward — no confusion, no clutter.',
    },
    {
      name: 'Student',
      role: 'Top Performer',
      text: 'Leaderboards + analytics keep me motivated. It feels like a professional app.',
    },
    {
      name: 'Teacher',
      role: 'Mentor',
      text: 'Students actually read feedback because it’s presented so cleanly.',
    },
    {
      name: 'Admin',
      role: 'Operations',
      text: 'It’s easy to manage the system and keep everything consistent.',
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
              Testimonials
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"> that build trust</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 text-gray-400 text-lg max-w-xl"
            >
              Social proof that looks premium. These are sample testimonials you can customize.
            </motion.p>
            <div className="mt-8 flex items-center gap-2 text-gray-300">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" />
              ))}
              <span className="text-sm text-gray-400">Rated 5/5 by early users</span>
            </div>
          </div>
          <div className="glass-card p-6">
            <img
              src="/marketing/hero-testimonials.svg"
              alt="Testimonials illustration"
              className="w-full rounded-2xl border border-white/10"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((q, idx) => (
            <div key={idx} className="premium-card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white font-bold">{q.name}</div>
                  <div className="text-sm text-gray-400">{q.role}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Quote className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-4 text-gray-300">“{q.text}”</div>
            </div>
          ))}
        </div>
      </section>
    </MarketingPageShell>
  );
}
