/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f9ea',
          100: '#e2f2cd',
          200: '#c8e6a3',
          300: '#a8d873',
          400: '#93c94e',
          500: '#7FB33B',
          600: '#4E8C2A',
          700: '#3d6f21',
          800: '#2f571a',
          900: '#244413'
        },
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        'surface-3': 'rgb(var(--surface-3) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--ink-muted) / <alpha-value>)',
        'ink-faint': 'rgb(var(--ink-faint) / <alpha-value>)',
        'border-default': 'rgb(var(--border-default) / <alpha-value>)'
      }
    }
  },
  plugins: []
};
