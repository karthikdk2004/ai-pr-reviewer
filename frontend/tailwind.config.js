/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#09090b',
        'bg-surface': '#111113',
        'bg-elevated': '#191a1f',
        'bg-hover': '#1f2028',
        'border-default': '#232329',
        'border-hover': '#2e2e38',
        'text-primary': '#f0f0f2',
        'text-secondary': '#a0a0ab',
        'text-tertiary': '#63636e',
        'accent': '#6366f1',
        'accent-soft': 'rgba(99, 102, 241, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
      },
    },
  },
  plugins: [],
}
