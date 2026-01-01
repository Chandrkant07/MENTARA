import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CURRICULUM_CARDS = [
  {
    key: 'ib',
    title: 'IB (International Baccalaureate)',
    subtitle: 'DP • MYP • Concept-based learning',
    desc:
      'Exam-style practice with structured answers, uploads, and teacher evaluation—aligned to how IB students learn and revise.',
    tags: ['DP', 'MYP', 'Structured', 'Teacher grading'],
    img: '/marketing/curriculums/ib.svg',
  },
  {
    key: 'icse',
    title: 'ICSE (CISCE)',
    subtitle: 'Classes 9–10 • Deep concepts',
    desc:
      'Strong fundamentals with topic-wise practice, timed mocks, and a clean question bank to boost exam confidence.',
    tags: ['Class 9', 'Class 10', 'Mocks', 'Topic packs'],
    img: '/marketing/curriculums/icse.svg',
  },
  {
    key: 'cbse',
    title: 'CBSE',
    subtitle: 'Classes 9–12 • Board-ready practice',
    desc:
      'Smart revision with chapter-wise sets, timed tests, and clear analytics—built for consistent improvement.',
    tags: ['Class 10', 'Class 12', 'Analytics', 'Practice'],
    img: '/marketing/curriculums/cbse.svg',
  },
  {
    key: 'cambridge',
    title: 'Cambridge (CAIE)',
    subtitle: 'IGCSE • AS/A Level-style practice',
    desc:
      'Premium exam workflows with structured responses and teacher marking—ideal for Cambridge-style assessment patterns.',
    tags: ['IGCSE', 'AS Level', 'A Level', 'Exam workflow'],
    img: '/marketing/curriculums/cambridge.svg',
  },
];

export default function CurriculumAdsSection({
  title = 'Curriculums & exam tracks we deliver',
  subtitle = 'Choose a track and showcase a premium, modern learning experience—practice, mocks, teacher evaluation, and analytics.',
  ctaLabel = 'Explore Courses',
  ctaHref = '/courses',
  showCta = true,
}) {
  const navigate = useNavigate();

  return (
    <section className="px-6 py-14" id="curriculums">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
          <p className="mt-3 text-gray-400 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CURRICULUM_CARDS.map((c) => (
            <motion.div
              key={c.key}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="premium-card overflow-hidden flex flex-col"
            >
              <div className="relative h-36 rounded-2xl overflow-hidden border border-white/10 bg-black/30">
                <img src={c.img} alt={c.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0F] via-transparent to-transparent opacity-80" />
              </div>

              <div className="mt-5 flex-1">
                <div className="text-white font-bold text-lg">{c.title}</div>
                <div className="mt-1 text-xs text-gray-300">{c.subtitle}</div>
                <div className="mt-3 text-gray-400 text-sm">{c.desc}</div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {c.tags.map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {showCta && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => navigate(`${ctaHref}#${c.key}`)}
                    className="w-full px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 inline-flex items-center justify-center gap-2"
                  >
                    {ctaLabel} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
