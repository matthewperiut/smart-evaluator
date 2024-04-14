/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      'light-green' : '#d4efdf',
      'green' : '#44a76e',
      'dark-green' : '#145a32',
    },

    fontFamily: {
      'poppins' : ['Poppins', 'sans-serif'],
      'sarabun' : ['Sarabun', 'sans-serif'],
      'figtree' : ['Figtree', 'sans-serif'],
    },

    fontSize : {
      'xs' : '18px',
      'sm' : '20px',
      'base' : '24px',
      'lg' : '30px',
      'xl' : '54px',
    },
    
    extend: {},
  },
  plugins: [],
}

