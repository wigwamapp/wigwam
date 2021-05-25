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
          darkbg: "#1F2128",
          darkover: "#191B20",
          darktext: "#11142D",
          lightgray: "#E4E4E4",
          primary: "#355DFF",
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
      typography: (theme) => ({
        default: {},
        dark: {
          css: {
            color: theme("colors.gray.300"),
            blockquote: {
              color: theme("colors.gray.300"),
            },
            a: {
              color: "#A78BFA",
              "&:hover": {
                color: "#A78BFA",
              },
            },
            code: {
              backgroundColor: theme("colors.blue.700"),
              paddingLeft: "5px",
              paddingRight: "5px",
              borderRadius: "4px",
            },
            svg: {
              color: theme("colors.currentColor"),
            },
            h1: {
              color: theme("colors.gray.300"),
            },
            h2: {
              color: theme("colors.gray.300"),
            },
            h3: {
              color: theme("colors.gray.300"),
            },
            h4: {
              color: theme("colors.gray.300"),
            },
            h5: {
              color: theme("colors.gray.300"),
            },
            h6: {
              color: theme("colors.gray.300"),
            },
            strong: {
              color: theme("colors.gray.300"),
            },
            code: {
              color: theme("colors.gray.300"),
            },
            figcaption: {
              color: theme("colors.gray.500"),
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
