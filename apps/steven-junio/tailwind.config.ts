import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: {
          50: "#fef5f5",
          100: "#fde9e9",
          200: "#fcd4d4",
          300: "#fbbaba",
          400: "#fa9696",
          500: "#f97272", // Primary color
          600: "#f75c5c",
          700: "#f44343",
          800: "#f22c2c",
          900: "#ef0f0f",
        },
        secondary: {
          50: "#f5f5f6",
          100: "#e9e9eb",
          200: "#d4d4d8",
          300: "#babac2",
          400: "#96969e",
          500: "#72727a", // Secondary color
          600: "#5c5c63",
          700: "#43434b",
          800: "#2c2c34",
          900: "#0f0f16",
        },
        accent: {
          50: "#fefbf7",
          100: "#fdf4ea",
          200: "#fcebd4",
          300: "#fadeb6",
          400: "#f8cd92",
          500: "#f6bc6d", // Accent color
          600: "#f4ad52",
          700: "#f29a31",
          800: "#f08810",
          900: "#ee7300",
        },
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373", // Neutral color
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
      },
    },
  },
  plugins: [],
};
export default config;
