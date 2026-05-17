import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#f7f8fb",
        ink: "#14171f",
        muted: "#687084",
        line: "#dde3ec"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(20, 23, 31, 0.05)"
      }
    }
  },
  plugins: []
};

export default config;
