/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D0425',
        accentBlue: '#5E6CE7',
        accentPurple: '#C645F9',
        profitGreen: '#00FF66',
        lossRed: '#FF3B30',
        surface: 'rgba(20, 14, 50, 0.6)',
        textMuted: '#9A9DBE',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
