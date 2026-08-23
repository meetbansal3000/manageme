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
        // Refined Design Tokens & Surfaces
        'bg-primary': 'var(--bg-primary)',
        'card-bg': 'var(--card-bg)',
        'border-subtle': 'var(--border-subtle)',
        'accent-primary': 'var(--accent-primary)',
        'accent-highlight': 'var(--accent-highlight)',

        // Pure-Black Vesper/Meridian Tokens & Aliases
        bg: 'var(--bg-primary, #0B0C10)',
        surface: 'var(--card-bg, #15171E)',
        'border-soft': 'var(--border-subtle, rgba(255, 255, 255, 0.08))',
        'accent-blue': '#0052FF',
        profit: '#00FF66',

        // Theme aliases & compatibility
        appBg: 'var(--bg-primary, #0B0C10)',
        appSurface: 'var(--card-bg, #15171E)',
        background: 'var(--bg-primary, #0B0C10)',
        borderSoft: 'var(--border-subtle, rgba(255, 255, 255, 0.08))',
        border: 'var(--border-subtle, rgba(255, 255, 255, 0.08))',
        accentGlow: 'var(--accent-primary, #818CF8)',
        accentProfit: '#00FF66',
        accentBlue: '#0052FF',
        accentPurple: '#C645F9',
        profitGreen: '#00FF66',
        lossRed: '#FF3B30',
        'profit-green': '#00FF66',
        'loss-red': '#FF3B30',
        bgApp: 'var(--bg-primary, #0B0C10)',
        bgSurface: 'var(--card-bg, #15171E)',
        textPrimary: 'var(--text-primary, #F9FAFB)',
        textMuted: 'var(--text-secondary, #94A3B8)',
        'text-primary': 'var(--text-primary, #F9FAFB)',
        'text-secondary': 'var(--text-secondary, #94A3B8)',
        'text-muted': 'var(--text-secondary, #94A3B8)',
        'surface-elevated': 'var(--card-bg, #15171E)',
      },
      boxShadow: {
        'liquid-glow': '0 0 18px rgba(200, 210, 230, 0.15)',
        'glass-hover': '0 8px 30px rgba(0, 0, 0, 0.8)',
        'btn-solid': 'inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        'btn-glow': '0 0 25px rgba(94, 67, 243, 0.35)',
        'card-base': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(94, 67, 243, 0.15)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
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
