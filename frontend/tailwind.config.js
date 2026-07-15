/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          200: '#b8e0ff',
          300: '#85caff',
          400: '#4bacff',
          500: '#0f8bff',
          600: '#0470eb',
          700: '#0c5fe0',
          800: '#1149b3',
          900: '#12408c'
        }
      }
    }
  },
  plugins: []
};
