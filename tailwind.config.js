/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        black: '#080810',
        white: '#F7F7FB',
        violet: '#F7F7FB',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
