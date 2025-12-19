import React from 'react';
import { motion } from 'framer-motion';
import { Code2, PenTool, Rocket } from 'lucide-react';
import MarketingPageShell from '../../components/marketing/MarketingPageShell';

export default function Team() {
  const members = [
    {
      name: 'DJ Brothers',
      role: 'Founders & Builders',
      icon: Rocket,
      bio: 'Product vision, delivery, and quality — end to end.',
    },
    {
      name: 'Engineering',
      role: 'Platform & Automation',
      icon: Code2,
      bio: 'Backend + frontend flows that stay reliable and fast.',
    },
    {
      name: 'Content',
      role: 'Curriculum & Evaluation',
      icon: PenTool,
      bio: 'High-quality questions, grading standards, and guidance.',
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
              Our Team
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"> — built to ship</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 text-gray-400 text-lg max-w-xl"
            >
              A small, focused team with one goal: a premium education product that clients instantly trust.
            </motion.p>
          </div>
          <div className="glass-card p-6">
            <img
              src="/marketing/hero-team.svg"
              alt="Team illustration"
              className="w-full rounded-2xl border border-white/10"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {members.map((m) => (
              <div key={m.name} className="premium-card">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <m.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{m.name}</div>
                    <div className="text-sm text-gray-400">{m.role}</div>
                  </div>
                </div>
                <div className="mt-4 text-gray-400">{m.bio}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
