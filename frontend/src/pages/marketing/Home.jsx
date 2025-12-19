import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, Trophy, Users, CheckCircle2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MarketingPageShell from '../../components/marketing/MarketingPageShell';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const goDashboard = () => {
    if (user?.role === 'ADMIN') navigate('/admin/dashboard');
    else if (user?.role === 'TEACHER') navigate('/teacher/dashboard');
    else navigate('/dashboard');
  };

  const highlights = [
    { icon: Brain, title: 'Smart Practice', desc: 'Topic-wise learning with structured progress.' },
    { icon: BookOpen, title: 'Question Bank', desc: 'MCQ + structured questions with uploads.' },
    { icon: Trophy, title: 'Results & Rankings', desc: 'Instant performance insights and leaderboards.' },
    { icon: Users, title: 'Teacher Evaluation', desc: 'Marks, remarks, and evaluated PDFs in one place.' },
  ];

  const bullets = [
    'Clean role-based dashboards for Admin, Teacher, Student',
    'Timed exams with autosave and submit flow',
    'Teacher grading that updates scores and analytics',
    'Designed for a premium, modern “wow” experience',
  ];

  return (
    <MarketingPageShell>
      <section className="relative px-6 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full"
            >
              <span className="text-sm font-semibold text-purple-300">Future-ready learning platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-6 text-5xl md:text-6xl font-bold text-white leading-tight"
            >
              Mentara makes
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"> exams feel effortless</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-lg text-gray-400 max-w-xl"
            >
              A professional-grade experience for students, teachers, and admins —
              built to look premium and work perfectly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              {isAuthenticated ? (
                <button type="button" onClick={goDashboard} className="btn-premium inline-flex items-center justify-center gap-2">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => navigate('/join')} className="btn-premium inline-flex items-center justify-center gap-2">
                    Join Now <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10"
                  >
                    Login
                  </button>
                </>
              )}
            </motion.div>

            <div className="mt-10 grid gap-3">
              {bullets.map((b) => (
                <div key={b} className="flex items-start gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-300 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass-card p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">Product Tour</div>
                  <div className="text-sm text-gray-400 mt-1">A quick look at how Mentara works end-to-end.</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="mt-5 rounded-2xl overflow-hidden border border-white/10 bg-black/30">
                <div className="aspect-video w-full flex items-center justify-center">
                  <img
                    src="/marketing/hero-home.svg"
                    alt="Mentara hero visual"
                    className="w-full h-full object-cover opacity-95"
                    loading="lazy"
                  />
                </div>
              </div>

            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {highlights.map((h) => (
                <div key={h.title} className="premium-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <h.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold">{h.title}</div>
                      <div className="text-sm text-gray-400">{h.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Built for every role</h2>
            <p className="mt-3 text-gray-400 max-w-2xl mx-auto">A single platform, three premium experiences — each one clean, fast, and easy.</p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <div className="glass-card p-7">
              <div className="text-white font-bold text-xl">Student</div>
              <p className="mt-2 text-gray-400">Take exams, track results, and improve with confidence.</p>
              <div className="mt-6 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">Timed tests</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">Autosave</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">Instant results</span>
              </div>
            </div>
            <div className="glass-card p-7">
              <div className="text-white font-bold text-xl">Teacher</div>
              <p className="mt-2 text-gray-400">Grade responses, upload evaluated PDFs, add remarks.</p>
              <div className="mt-6 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">Marking</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">Remarks</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">Uploads</span>
              </div>
            </div>
            <div className="glass-card p-7">
              <div className="text-white font-bold text-xl">Admin</div>
              <p className="mt-2 text-gray-400">Create topics, questions, exams, manage everything cleanly.</p>
              <div className="mt-6 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">CRUD</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">Question bank</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
