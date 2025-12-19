import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import MarketingPageShell from '../../components/marketing/MarketingPageShell';

export default function About() {
  const pillars = [
    { icon: Sparkles, title: 'Premium by design', desc: 'Glassmorphism, clean spacing, and modern typography.' },
    { icon: ShieldCheck, title: 'Reliable workflows', desc: 'Stable admin, teacher, and student journeys that work.' },
    { icon: TrendingUp, title: 'Insight-first', desc: 'Results and progress that feel instant and meaningful.' },
    { icon: BookOpen, title: 'Education-ready', desc: 'Purpose built for structured and MCQ learning.' },
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
              About <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Mentara</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 text-gray-400 text-lg max-w-xl"
            >
              Mentara is built to feel like a premium product: clean screens, clear flows,
              and strong role-based experiences — so students stay focused, teachers stay productive,
              and admins stay in control.
            </motion.p>

            <div className="mt-8 grid gap-4">
              {pillars.map((p) => (
                <div key={p.title} className="glass-card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <p.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold">{p.title}</div>
                      <div className="mt-1 text-gray-400">{p.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="glass-card p-6">
              <img
                src="/marketing/hero-about.svg"
                alt="Mentara vision illustration"
                className="w-full rounded-2xl border border-white/10"
                loading="lazy"
              />
              <div className="mt-4 text-sm text-gray-400">
                Vision: build structured learning systems that look premium, feel simple, and deliver results.
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
