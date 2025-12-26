import React from 'react';
import { Link } from 'react-router-dom';

export default function TeacherNav({ active = 'dashboard' }) {
  const item = (key, href, label) => {
    const isActive = active === key;
    return (
      <Link
        to={href}
        className={
          isActive
            ? 'relative px-4 py-2 rounded-xl text-sm font-semibold bg-elevated text-text ring-1 ring-white/10'
            : 'relative px-4 py-2 rounded-xl text-sm font-semibold text-text-secondary hover:text-text hover:bg-surface transition-colors ring-1 ring-transparent'
        }
        tabIndex={0}
      >
        {isActive ? <span className="absolute inset-x-3 -top-px h-px bg-gradient-to-r from-primary/60 to-accent/30" /> : null}
        {label}
      </Link>
    );
  };

  return (
    <nav className="hidden md:flex items-center gap-2 bg-surface/40 border border-elevated/50 rounded-2xl p-1 backdrop-blur">
      {item('dashboard', '/teacher/dashboard', 'Dashboard')}
      {item('exams', '/teacher/exams', 'Exams')}
    </nav>
  );
}
