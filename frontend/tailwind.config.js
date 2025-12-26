/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic tokens (backed by CSS variables) so we can switch light/dark
        // without rewriting component classNames.
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        elevated: 'rgb(var(--c-elevated) / <alpha-value>)',
        text: 'rgb(var(--c-text) / <alpha-value>)',
        'text-secondary': 'rgb(var(--c-text-secondary) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',

        // Dark theme colors - Apple-inspired
        dark: {
          base: '#0B0B0D',
          surface: '#111216',
          elevated: '#1A1B20',
          border: '#2A2B30',
          hover: '#25262B',
        },
        // Primary accent - Icy blue
        primary: {
          DEFAULT: '#7CE7FF',
          50: '#E0F7FF',
          100: '#B8EEFF',
          200: '#7CE7FF',
          300: '#4FE0FF',
          400: '#00D4FF',
          500: '#00B8E6',
          600: '#0099CC',
          700: '#007BA3',
          800: '#00607A',
          900: '#004552',
        },
        // Secondary accent - Mint green
        secondary: {
          DEFAULT: '#A6FFCB',
          50: '#E5FFF4',
          100: '#B8FFE3',
          200: '#A6FFCB',
          300: '#7CFFB0',
          400: '#4FFF94',
          500: '#00E676',
          600: '#00CC68',
          700: '#00B359',
          800: '#009949',
          900: '#007A39',
        },
        // Positive
        success: '#4ADE80',
        // Negative
        danger: '#FB7185',
        // Warning
        warning: '#FBBF24',
        // Muted text
        muted: '#BFC3C8',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'large': '0 8px 32px rgba(0, 0, 0, 0.16)',
        'glow': '0 0 20px rgba(124, 231, 255, 0.3)',
        'glow-secondary': '0 0 20px rgba(166, 255, 203, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}

