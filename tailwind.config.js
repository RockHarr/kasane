/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",
        bg: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)",
          elevated: "var(--color-bg-elevated)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          muted: "var(--color-text-muted)",
        },
        border: "var(--color-border)",
        accent: {
          growth: "var(--color-accent-growth)",
          "growth-bg": "var(--color-accent-growth-bg)",
          alert: "var(--color-accent-alert)",
          "alert-bg": "var(--color-accent-alert-bg)",
          neutral: "var(--color-accent-neutral)",
        },
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        jetbrains: ["JetBrains Mono", "monospace"],
        dm: ["DM Sans", "sans-serif"],
        heading: ["Outfit", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "glow-growth": "0 0 20px rgba(0, 255, 170, 0.3)",
        "glow-alert": "0 0 20px rgba(255, 107, 107, 0.3)",
      },
    },
  },
  plugins: [],
};
