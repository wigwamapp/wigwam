const theme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  purge: {
    enabled: process.env.NODE_ENV === "production",
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/**/*.{html,js,mjs}"],
  },
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          darkbg: "#050505",
          darkover: "#191B20",
          darktext: "#11142D",
          lightgray: "#E4E4E4",
          primary: "#355DFF",
          redone: "#FF002D",
          redtwo: "#FF7F44",
          dark: "#0D0E1D",
          darklight: "#2A2C3F",
          light: "#F8F9FD",
          main: "#CCD6FF",
        },
      },
      fontFamily: {
        sans: ["Inter", ...theme.fontFamily.sans],
      },
      animation: {
        bootfadein: "bootfadein 0.15s ease-in-out",
      },
      keyframes: {
        bootfadein: {
          from: {
            opacity: "0",
          },
          to: {
            opacity: "1",
          },
        },
      },
      boxShadow: {
        buttonaccent: "0px 5px 25px rgba(255, 0, 45, 0.25)",
        buttonsecondary: "0px 4px 15px rgba(204, 214, 255, 0.07)",
      },
      backgroundImage: {
        buttonaccent:
          "linear-gradient(259.09deg, rgba(204, 24, 56, var(--tw-bg-opacity)) -1.03%, rgba(215, 93, 37, var(--tw-bg-opacity)) 198.87%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
