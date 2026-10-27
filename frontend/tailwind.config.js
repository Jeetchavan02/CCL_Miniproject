/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        neoBg: "#F0F4FF",
        neoBlue: "#2563EB",
        neoCyan: "#00C2FF",
        neoGreen: "#00FF85",
        neoYellow: "#FFD60A",
      },
    },
  },
  plugins: [],
};
