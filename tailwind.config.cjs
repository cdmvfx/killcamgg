/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        cutive: ['"Cutive Mono"', "monospace"],
        jost: ['"Jost"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
