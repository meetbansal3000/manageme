/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0A051A',
        surface: 'rgba(255, 255, 255, 0.03)',
        accentBlue: '#5E6CE7',
        accentPurple: '#C645F9',
        profitGreen: '#00FF66',
        lossRed: '#FF3B30',

        // Semantic & compatibility tokens
        bgApp: '#0A051A',
        bgSurface: 'rgba(255, 255, 255, 0.03)',
        borderSoft: 'rgba(255, 255, 255, 0.08)',
        textPrimary: '#FFFFFF',
        textMuted: '#8B95A5',
        accentGlow: '#5E6CE7',
        accentProfit: '#00FF66',
        accentLoss: '#FF3B30',
        'surface-elevated': 'rgba(255, 255, 255, 0.06)',
        border: 'rgba(255, 255, 255, 0.08)',
        'text-primary': '#FFFFFF',
        'text-muted': '#8B95A5',
        accentPrimary: '#5E6CE7',
        'accent-primary': '#5E6CE7',
        actionBlue: '#5E6CE7',
        'action-blue': '#5E6CE7',
        'profit-green': '#00FF66',
        'loss-red': '#FF3B30',
      },
      boxShadow: {
        'liquid-glow': '0 0 15px rgba(94, 108, 231, 0.2)',
        'glass-hover': '0 8px 30px rgba(0, 0, 0, 0.4)',
        'btn-glow': '0 0 25px rgba(94, 108, 231, 0.35)',
        'card-base': '0 4px 20px -2px rgba(0, 0, 0, 0.6)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(94, 108, 231, 0.15)',
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
