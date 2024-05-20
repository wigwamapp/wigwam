const theme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/**/*.{html,js,mjs}"],
  theme: {
    extend: {
      colors: {
        brand: {
          darkaccent: "#0D1311",
          darkbg: "#181A1F", // #13191F
          lightgray: "#E4E4E4",
          redone: "#80EF6E",
          redtwo: "#80EF6E",
          dark: "#181A1F",
          darkblue: "#0E1314",
          darklight: "#2A3C3F",
          light: "#F8FCFD",
          main: "#CCF9FF",
          inactivelight: "#BFC8CA",
          font: "#BCC3C4",
          inactivedark: "#8D9C9E",
          gray: "#AAB0B1",
          darkgray: "#22262A",
          placeholder: "#717A7B",
          disabledbackground: "#343434",
          disabledcolor: "#606668",
          inactivedark2: "#91999B",
          redobject: "#B82D41",
          redtext: "#EA556A",
          greenobject: "#4F9A5E",
        },
      },
      fontFamily: {
        sans: ["InterVariable", ...theme.fontFamily.sans],
      },
      animation: {
        bootfadein: "fadein 0.15s ease-in",
        bootfadeinslow: "fadein 0.3s ease-in",
        bootfadeinfast: "fadein 0.1s ease-in",
        dialogcontent:
          "dialogfadein 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "waving-hand": "wave 2s linear infinite",
        modalcontent: "modalfadein 0.2s ease-out",
        modalcontentOut: "modalfadeout 0.35s ease-out",
        modalcontentinnerOut: "modalinnerfadeout 0.35s ease-out",
        activitybar:
          "barclimb 0.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards",
        stripeloading:
          "stripeloading 3s cubic-bezier(0.16, 1, 0.3, 1) 0.2s infinite",
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
        barclimb: {
          from: {
            transform: "translate(-50%, 150%)",
          },
          to: {
            transform: "translate(-50%, 0)",
          },
        },
        modalfadein: {
          from: {
            opacity: "0",
            transform: "scale(1.04)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        modalfadeout: {
          "40%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0",
          },
        },
        modalinnerfadeout: {
          "0%": {
            transform: "scale(1)",
            opacity: "1",
          },
          "60%": {
            transform: "scale(.9)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(.9)",
            opacity: "0",
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
        stripeloading: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(300%)" },
        },
      },
      boxShadow: {
        buttonaccent: "0px 5px 25px rgba(128, 239, 110, 0.15)",
        buttondanger: "0px 5px 25px rgba(254, 0, 0, 0.05)",
        buttonsecondary: "0px 4px 15px rgba(211, 255, 204, 0.07)",
        addaccountmodal:
          "inset 0px 0px 7px rgba(255, 255, 255, 0.05), inset 0px 1px 1px rgba(114, 114, 114, 0.15)",
        receiveqrcode:
          "inset 0px 0px 7px rgba(255, 255, 255, 0.05), inset 0px 1px 1px rgba(255, 255, 255, 0.15)",
        approvestack: "0px -1px 1px #3C435F",
        "popup-bg": "0px -10px 24px 0px rgba(17, 18, 22, 0.24)",
        "popup-nav": "0px -10px 24px 0px rgba(17, 18, 22, 0.48);",
      },
      dropShadow: {
        profileinitial: "0px 2px 5px rgba(112, 113, 129, 0.37)",
      },
      backgroundImage: {
        buttonaccent:
          "linear-gradient(259.09deg, rgba(128, 239, 110, var(--tw-bg-opacity)) -1.03%, rgba(128, 239, 110, var(--tw-bg-opacity)) 198.87%)",
        radio: "linear-gradient(275.43deg, #80EF6E 13.81%, #80EF6E 111.89%)",
        activity: "linear-gradient(220deg, #80EF6E 0.11%, #80EF6E 90.88%)",
        addaccountcontinue:
          "linear-gradient(90.44deg, rgba(13, 14, 32, 0.95) 2.88%, rgba(15, 16, 34, 0.95) 21.54%, rgba(13, 14, 31, 0.95) 41.08%, rgba(17, 18, 36, 0.95) 81.76%, rgba(16, 17, 35, 0.95) 97.51%)",
      },
      screens: {
        mmd: { max: "767px" },
        mxs: { max: "420px" },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    plugin(({ addVariant, e, postcss }) => {
      addVariant("firefox", ({ container, separator }) => {
        const isFirefoxRule = postcss.atRule({
          name: "-moz-document",
          params: "url-prefix()",
        });
        isFirefoxRule.append(container.nodes);
        container.append(isFirefoxRule);
        isFirefoxRule.walkRules((rule) => {
          rule.selector = `.${e(
            `firefox${separator}${rule.selector.slice(1)}`,
          )}`;
        });
      });
    }),
  ],
};
