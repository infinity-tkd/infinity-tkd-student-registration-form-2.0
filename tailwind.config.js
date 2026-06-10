/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'Suwannaphum', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#FFEDEA',
          100: '#FFC9C3',
          200: '#FFB6AF',
          300: '#FFA49C',
          400: '#FF9189',
          500: '#EF2F38',
          600: '#D0272F',
          700: '#B12027',
          800: '#94191F',
          900: '#5C0C0F',
        },
        secondary: '#000000', 
        surface: '#F8F9FA', 
        surfaceDark: '#0A0A0A', 
        cardDark: '#141414', 
        inputDark: '#1E1E1E'
      },
      borderRadius: { 'custom': '5px' },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'premium-dark': '0 10px 40px -10px rgba(0,0,0,0.5)'
      }
    }
  },
  plugins: [],
}
