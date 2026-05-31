import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — defined as RGB channels in globals.css so Tailwind
        // alpha modifiers (e.g. bg-accent/10) work.
        paper: "rgb(var(--paper) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          faint: "rgb(var(--ink-faint) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          strong: "rgb(var(--line-strong) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          ink: "rgb(var(--accent-ink) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
        },
        teal: {
          DEFAULT: "rgb(var(--teal) / <alpha-value>)",
          soft: "rgb(var(--teal-soft) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        // Swiss-precise: tight, consistent corners.
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        xl: "14px",
      },
      letterSpacing: {
        eyebrow: "0.18em",
      },
      maxWidth: {
        page: "44rem",
      },
    },
  },
  plugins: [],
};

export default config;
