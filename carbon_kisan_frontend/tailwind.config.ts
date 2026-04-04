import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Green palette - from prototype
        green: {
          50: "#edfaf0",
          100: "#d4f5db",
          200: "#aeeabc",
          300: "#7dd88f",
          400: "#52c46a",
          500: "#3a9e52",
          600: "#2d7a3c",
          700: "#256332",
          800: "#1a4d24",
          900: "#0d2b12",
        },
        // Amber palette
        amber: {
          50: "#fff8f0",
          100: "#faeeda",
          300: "#fac775",
          500: "#ef9f27",
          700: "#854f0b",
          900: "#412402",
        },
        // Earth palette
        earth: {
          50: "#f9f5f0",
          100: "#f2e5d4",
          300: "#c8a27a",
          500: "#9a6030",
          700: "#5c3510",
          900: "#2c1a08",
        },
        // Sky palette
        sky: {
          50: "#f0f8fd",
          100: "#d6edf8",
          300: "#7bbde0",
          500: "#3a8fca",
        },
        // Gray palette
        gray: {
          50: "#f9f9f9",
          100: "#f0f0f0",
          200: "#d4d4d4",
          400: "#888",
          600: "#555",
          700: "#3f3f3f",
          800: "#2c2c2c",
          900: "#1a1a1a",
        },
        // Red palette
        red: {
          50: "#fef2f2",
          100: "#fce8e8",
          500: "#e24b4a",
        },
      },
      fontFamily: {
        sans: ["'Sora'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        base: "12px",
      },
      spacing: {
        "sidebar-w": "240px",
        "header-h": "64px",
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        spin: "spin 1s linear infinite",
        bounce: "bounce 1s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
