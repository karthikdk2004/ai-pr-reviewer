/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0c0c10',
        'bg-surface': '#141418',
        'bg-elevated': '#1c1c22',
        'bg-hover': '#22222a',
        'border': '#27272f',
        'border-hover': '#363640',
        'text-primary': '#ededef',
        'text-secondary': '#8b8b93',
        'text-tertiary': '#5c5c66',
        'accent': '#717cf5',
        'accent-hover': '#818bf7',
        'accent-muted': 'rgba(113, 124, 245, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
