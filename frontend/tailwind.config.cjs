/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"InterVariable"', ...defaultTheme.fontFamily.sans],
      },
      maxHeight: {
        128: "32rem",
      },
      colors: {
        // midpoint of gray-100 and gray-200
        canvas: "#ECEEF1",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwind-scrollbar")],
  variants: {
    scrollbar: ["dark"],
  },
};
