/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        inspiration: ["Inspiration", "cursive"],
        inika: ["Inika", "serif"],
        merriweather: ["Merriweather", "serif"],
        nunito: ["Nunito Sans", "san-serif"],
        julius: ['Julius Sans One', 'sans-serif'],
      },
      colors: {
        navy: "#1E293B", 
      },
    },
  },
  plugins: [],
}

