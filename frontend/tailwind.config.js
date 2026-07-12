/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0A0F1F",
          800: "#111827",
          700: "#1F2937",
          600: "#374151",
          500: "#4B5563",
        },
      },
    },
  },
  plugins: [],
}