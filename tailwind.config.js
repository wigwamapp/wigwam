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
          dark: "#101123",
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
          redobject: "#B82D41",
          redtext: "#EA556A",
          greenobject: "#4F9A5E",
        },
      },
      fontFamily: {
        sans: ["Inter", ...theme.fontFamily.sans],
      },
      animation: {
        bootfadein: "fadein 0.15s ease-in-out",
        dialogcontent:
          "dialogfadein 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "waving-hand": "wave 2s linear infinite",
      },
      keyframes: {
        fadein: {
          from: {
            opacity: "0",
          },
          to: {
            opacity: "1",
          },
        },
        dialogfadein: {
          from: {
            opacity: "0",
            transform: "translate(-50%, -48%) scale(.96)",
          },
          to: {
            opacity: "1",
            transform: "translate(-50%, -50%) scale(1)",
          },
        },
        wave: {
          "0%": { transform: "rotate(0.0deg)" },
          "10%": { transform: "rotate(14deg)" },
          "20%": { transform: "rotate(-8deg)" },
          "30%": { transform: "rotate(14deg)" },
          "40%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(10.0deg)" },
          "60%": { transform: "rotate(0.0deg)" },
          "100%": { transform: "rotate(0.0deg)" },
        },
      },
      boxShadow: {
        buttonaccent: "0px 5px 25px rgba(255, 0, 45, 0.25)",
        buttonsecondary: "0px 4px 15px rgba(204, 214, 255, 0.07)",
        addaccountmodal:
          "inset 0px 0px 7px rgba(255, 255, 255, 0.05), inset 0px 1px 1px rgba(114, 114, 114, 0.15)",
        receiveqrcode:
          "inset 0px 0px 7px rgba(255, 255, 255, 0.05), inset 0px 1px 1px rgba(255, 255, 255, 0.15)",
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
