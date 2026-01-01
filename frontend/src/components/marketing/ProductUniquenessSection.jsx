import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FolderTree,
  GraduationCap,
  ShieldCheck,
  Upload,
  Users,
} from 'lucide-react';

const POINTS = [
  {
    icon: FolderTree,
    title: 'Curriculum-first structure',
    desc: 'Organize content as a real hierarchy (Curriculum → Topics → Subtopics) so students never get lost.',
  },
  {
    icon: ClipboardList,
    title: 'Exam-style workflows',
    desc: 'Timed tests, autosave/resume safety, and a clean submit flow that feels like the real thing.',
  },
  {
    icon: Upload,
    title: 'Structured answers + uploads',
    desc: 'For written/structured questions, students upload answers at the end—perfect for school-style evaluation.',
  },
  {
    icon: Users,
    title: 'Teacher evaluation built-in',
    desc: 'Marks, remarks, and evaluated PDFs—organized per attempt so feedback is easy to deliver and review.',
  },
  {
    icon: BarChart3,
    title: 'Actionable analytics',
    desc: 'Topic-wise performance and progress signals that support improvement—not just vanity charts.',
  },
  {
    icon: ShieldCheck,
    title: 'Integrity & history preserved',
    desc: 'Designed so learning history remains reliable even as content evolves over time.',
  },
];

export default function ProductUniquenessSection({
  title = 'What makes Mentara different',
  subtitle = 'Not just “a UI”. Mentara is built around real exam preparation workflows for students, teachers, and admins.',
}) {
  return (
    <section className="px-6 py-14" id="uniqueness">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
          <p className="mt-3 text-gray-400 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POINTS.map((p) => (
            <motion.div
              key={p.title}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="premium-card"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <p.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">{p.title}</div>
                  <div className="mt-1 text-gray-400">{p.desc}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-white font-bold text-lg">Built for institutes and serious students</div>
              <div className="mt-2 text-gray-400">
                Mentara combines student practice, teacher evaluation, and admin control into one connected system.
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {[['Student', GraduationCap], ['Teacher', Users], ['Admin', ShieldCheck], ['Reliable flows', CheckCircle2]].map(
                  ([label, Icon]) => (
                    <span
                      key={label}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 inline-flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="premium-card md:max-w-sm">
              <div className="text-white font-semibold">Curriculums supported</div>
              <div className="mt-2 text-gray-400">
                IB, ICSE, CBSE, and Cambridge-style exam practice—with curriculum-aware topic structures.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
