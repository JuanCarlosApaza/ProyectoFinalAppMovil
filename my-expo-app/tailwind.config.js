
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./fuentes.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      fontFamily: {
        exo: ['"Exo 2"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
