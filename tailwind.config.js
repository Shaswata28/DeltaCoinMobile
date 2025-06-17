/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4D9FFF',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        success: '#22C55E',
      },
    },
  },
  plugins: [],
} 