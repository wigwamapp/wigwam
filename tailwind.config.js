const theme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/**/*.{html,js,mjs}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...theme.fontFamily.sans],
      },
    },
  },
  variants: {
    extend: {
      display: ["dark"],
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
