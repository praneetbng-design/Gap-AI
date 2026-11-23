/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B132B',
          800: '#1C2541',
          700: '#3A506B',
          600: '#486382',
        },
        accent: {
          500: '#4F46E5', // indigo/violet accent
          600: '#4338CA',
          light: '#EEF2FF',
        }
      }
    },
  },
  plugins: [],
}
