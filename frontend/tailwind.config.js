/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#010101",
        surface: "#0b0e17",
        "surface-bright": "#1a1d26",
        "surface-container": "#11141d",
        "surface-container-high": "#1b1e28",
        "surface-container-highest": "#242732",
        "surface-container-low": "#080b13",
        "surface-container-lowest": "#05080f",
        primary: "#00d09c",
        "primary-container": "#00ad82",
        secondary: "#bcc2ff",
        "on-surface": "#e0e2ef",
        "on-surface-variant": "#bacac1",
        error: "#ffb4ab"
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
