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
        primary: "#e53e3e", // Gull Red
        secondary: "#18181b", // Raisin Black
        tertiary: "#3f3f46", // Dark Charcoal
        "accent-1": "#f97316", // Blazing Orange
        "accent-2": "#eab308", // Cyber Yellow
        neutral: "#d6d3d1", // Gainsboro
      },
    },
  },
  plugins: [],
};
export default config;
