const theme = require("tailwindcss/defaultTheme");

const PROD =
  process.env.NODE_ENV === "production" &&
  process.env.SNOWPACK_PUBLIC_DEBUG !== "true";

module.exports = {
  purge: {
    enabled: PROD,
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/**/*.{html,js,mjs}"],
  },
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: "#74328E",
        },
      },
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
