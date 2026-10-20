/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        edel: {
          maroon: '#8E1B3A',
          deep: '#590D22',
          gold: '#D4AF37',
          champagne: '#FDF7EB',
          dark: '#1D1115'
        }
      },
      fontFamily: {
        royal: ['Cinzel', 'serif'],
        bengali: ['Hind Siliguri', 'Plus Jakarta Sans', 'sans-serif']
      }
    },
  },
  plugins: [],
}
