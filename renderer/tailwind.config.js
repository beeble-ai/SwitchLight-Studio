/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");
module.exports = {
  variants: {
    extend: {
      display: ["group-hover"],
    },
  },
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fill: (theme) => ({
      yellow: theme("colors.yellow.500"),
    }),
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // use below colors e.g. className="bg-beeblePrimary" or "text-beeblePrimary"
        beeblePrimary: "#fdd60c",
        beeblePrimaryHover: "#D5B412",
        beebleSecondary: "#3dc1d3",
        beebleSecondaryHover: "#246E78",
        gray01: "#171717",
        gray02: "#27272a",
        gray03: "#363636",
        gray04: "#393939",
        gray05: "#515151",
      },
      margin: {
        13: {
          top: "13px",
          right: "13px",
          bottom: "13px",
          left: "13px",
        },
      },
      textShadow: {
        sm: "0 1px 2px var(--tw-shadow-color)",
        DEFAULT: "0 2px 4px var(--tw-shadow-color)",
        lg: "0 8px 16px var(--tw-shadow-color)",
      },
    },
    fontSize: {
      xs: "0.4rem",
      sm: "0.75rem",
      tiny: "0.875rem",
      base: "1rem",
      "text-lg": "1.125rem",
      "text-xl": "1.25rem",
      "text-2xl": "1.5rem",
      "text-3xl": "1.875rem",
      "text-4xl": "2.25rem",
      "text-5xl": "3rem",
      "text-6xl": "4rem",
    },
  },
  plugins: [
    require("flowbite/plugin"),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") }
      );
    }),
  ],
  extend: {
    screens: {
      portrait: { raw: "(orientation: portrait)" },
      landscape: { raw: "(orientation: landscape)" },
      "2xl": "1536px",
    },
  },
};
