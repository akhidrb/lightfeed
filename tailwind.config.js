/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0f7f1',
          100: '#dceddf',
          200: '#b9dbbf',
          300: '#8fc29a',
          500: '#4a9e6b',
          700: '#2a7a4a',
          900: '#1A4731',
          950: '#0f2a1d',
        },
        gold: {
          100: '#fef7e7',
          300: '#f0d49a',
          500: '#C9A96E',
          700: '#a07840',
        },
        warm: {
          50:  '#FDFAF4',
          100: '#F5F0E8',
          200: '#EDE6D6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
