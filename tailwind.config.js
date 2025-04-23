/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'spin-slow': 'spin 20s linear infinite',
      },
      colors: {
        primary: '#eb1924',
        secondary: '#01a952',
        accent: '#edba3a',
        highlight: '#fff301',
      },
    },
  },
  plugins: [],
};
