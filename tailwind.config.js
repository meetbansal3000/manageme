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
        bgApp: 'var(--bg-app)',
        bgSurface: 'var(--bg-surface)',
        borderSoft: 'var(--border-soft)',
        textPrimary: 'var(--text-primary)',
        textMuted: 'var(--text-muted)',
        accentGlow: 'var(--accent-glow)',
        accentProfit: 'var(--accent-profit)',
        accentLoss: 'var(--accent-loss)',

        // Backwards compatibility tokens
        background: 'var(--bg-app)',
        surface: 'var(--bg-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        border: 'var(--border-soft)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        accentPrimary: 'var(--accent-glow)',
        'accent-primary': 'var(--accent-glow)',
        actionBlue: 'var(--accent-glow)',
        'action-blue': 'var(--accent-glow)',
        profitGreen: 'var(--accent-profit)',
        'profit-green': 'var(--accent-profit)',
        lossRed: 'var(--accent-loss)',
        'loss-red': 'var(--accent-loss)',
        accentBlue: 'var(--accent-glow)',
        accentPurple: '#C645F9',
      },
      boxShadow: {
        'liquid-glow': '0 0 15px rgba(94, 108, 231, 0.2)',
        'glass-hover': '0 8px 30px rgba(0, 0, 0, 0.4)',
        'btn-glow': '0 0 25px rgba(94, 108, 231, 0.35)',
        'card-base': 'var(--theme-card-shadow)',
        'card-hover': 'var(--theme-card-hover-shadow)',
      },
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        editorial: ['Instrument Serif', 'Georgia', 'serif'],
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
