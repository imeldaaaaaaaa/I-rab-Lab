import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#163c39",
        cream: "#f8f5ed",
        mint: "#dcebe3",
      },
    },
  },
  plugins: [],
};
export default config;
