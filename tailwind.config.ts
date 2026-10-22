import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#060608",
          900: "#0A0A0C", // Main background
          850: "#101014",
          800: "#14141A",
          700: "#1F1F27",
          600: "#2B2B36",
        },
        gold: {
          300: "#F5E6AB",
          400: "#E6C65C",
          500: "#D4AF37", // Champagne Gold primary
          600: "#B89626",
          700: "#917417",
          800: "#69530D",
        },
        crimson: {
          500: "#E63946",
          600: "#D62839",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Pretendard",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
