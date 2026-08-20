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
        // Pure-Black Vesper/Meridian Tokens
        bg: '#000000',
        surface: '#0A0A0A',
        'border-soft': 'rgba(255, 255, 255, 0.12)',
        'accent-blue': '#0052FF',
        profit: '#00FF66',

        // Theme aliases & compatibility
        appBg: '#000000',
        appSurface: '#0A0A0A',
        background: '#000000',
        borderSoft: 'rgba(255, 255, 255, 0.12)',
        border: 'rgba(255, 255, 255, 0.12)',
        accentGlow: '#0052FF',
        accentProfit: '#00FF66',
        accentBlue: '#0052FF',
        accentPurple: '#C645F9',
        profitGreen: '#00FF66',
        lossRed: '#FF3B30',
        'profit-green': '#00FF66',
        'loss-red': '#FF3B30',
        bgApp: '#000000',
        bgSurface: '#0A0A0A',
        textPrimary: '#FFFFFF',
        textMuted: '#8B95A5',
        'text-primary': '#FFFFFF',
        'text-muted': '#8B95A5',
        'surface-elevated': '#121212',
      },
      boxShadow: {
        'liquid-glow': '0 0 18px rgba(200, 210, 230, 0.15)',
        'glass-hover': '0 8px 30px rgba(0, 0, 0, 0.8)',
        'btn-solid': 'inset 0 1px 0 rgba(255, 255, 255, 0.95)',
        'btn-glow': '0 0 25px rgba(0, 82, 255, 0.35)',
        'card-base': '0 4px 20px -2px rgba(0, 0, 0, 0.8)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.9), 0 0 25px rgba(0, 82, 255, 0.15)',
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
