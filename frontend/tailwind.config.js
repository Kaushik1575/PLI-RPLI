/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        postal: {
          50: '#fef2f2',
          100: '#ffe1e1',
          200: '#ffc8c8',
          500: '#d9232d', // Postal Red (India Post iconic red)
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#5c1414',
          gold: '#f59e0b',
          navy: '#0f172a',
          indigo: '#1e1b4b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
