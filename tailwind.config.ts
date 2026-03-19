import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        canvas: "#f4f7f4",
        pine: "#0f3d2e",
        lime: "#b7ff5e",
        mist: "#d9e7df",
        mint: "#eaf7ec"
      },
      boxShadow: {
        panel: "0 24px 60px rgba(16, 24, 40, 0.10)"
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(16, 24, 40, 0.08) 1px, transparent 0)"
      }
    }
  },
  plugins: []
};

export default config;
