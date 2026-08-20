/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        border: 'var(--color-border)',
        textPrimary: 'var(--color-text-primary)',
        textMuted: 'var(--color-text-muted)',
        'text-primary': 'var(--color-text-primary)',
        'text-muted': 'var(--color-text-muted)',
        accentPrimary: 'var(--color-accent-primary)',
        'accent-primary': 'var(--color-accent-primary)',
        actionBlue: 'var(--color-action-blue)',
        'action-blue': 'var(--color-action-blue)',
        profitGreen: 'var(--color-profit-green)',
        'profit-green': 'var(--color-profit-green)',
        lossRed: 'var(--color-loss-red)',
        'loss-red': 'var(--color-loss-red)',
        accentBlue: 'var(--color-action-blue)',
        accentPurple: '#C645F9',
      },
      boxShadow: {
        'theme-soft': '0 10px 40px -10px rgba(0,0,0,0.04)',
        'theme-glow': '0 0 20px rgba(0, 255, 102, 0.1)',
        'card-base': 'var(--theme-card-shadow)',
        'card-hover': 'var(--theme-card-hover-shadow)',
      },
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.03em',
        tighter: '-0.02em',
        tight: '-0.015em',
      },
      transitionTimingFunction: {
        'saas-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
