const theme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/**/*.{html,js,mjs}"],
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
          darkblue: "#07081B",
          darklight: "#2A2C3F",
          light: "#F8F9FD",
          main: "#CCD6FF",
          inactivelight: "#B7BCD0",
          font: "#BCC2DB",
          inactivedark: "#767C9D",
          gray: "#AAABB1",
          placeholder: "#66697C",
          disabledbackground: "#343434",
          disabledcolor: "#535364",
          inactivedark2: "#7D8398",
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
        addaccountmodal:
          "inset 0px 0px 7px rgba(255, 255, 255, 0.05), inset 0px 1px 1px rgba(114, 114, 114, 0.15)",
      },
      dropShadow: {
        profileinitial: "0px 2px 5px rgba(112, 113, 129, 0.37)",
      },
      backgroundImage: {
        buttonaccent:
          "linear-gradient(259.09deg, rgba(204, 24, 56, var(--tw-bg-opacity)) -1.03%, rgba(215, 93, 37, var(--tw-bg-opacity)) 198.87%)",
        radio: "linear-gradient(275.43deg, #FF002D 13.81%, #FF7F44 111.89%)",
        activity: "linear-gradient(220deg, #FF002D 0.11%, #FF7F44 90.88%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
