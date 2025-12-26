import React, { useEffect, useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const THEME_KEY = 'mentara_theme';

const readTheme = () => {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

const writeTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
};

const applyThemeToDom = (theme) => {
  const root = document.documentElement;
  if (theme === 'light') root.classList.add('light');
  else root.classList.remove('light');
};

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(() => readTheme());

  useEffect(() => {
    applyThemeToDom(theme);
    writeTheme(theme);
  }, [theme]);

  const label = useMemo(() => (theme === 'light' ? 'Light' : 'Dark'), [theme]);

  return (
    <button
      type="button"
      className={`btn-secondary btn-icon text-sm ${className}`.trim()}
      onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
      aria-label={`Switch theme (currently ${label})`}
      title={`Theme: ${label}`}
    >
      {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}
