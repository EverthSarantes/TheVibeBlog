/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Design tokens - TheVibeBlog design system
        ink: {
          900: "#0a0a0a",
          800: "#1a1a1a",
          700: "#2a2a2a",
          600: "#4a4a4a",
          500: "#6b6b6b",
          400: "#9a9a9a",
          300: "#c4c4c4",
          200: "#e5e5e5",
          100: "#f2f2f2",
          50: "#fafafa",
        },
        accent: {
          DEFAULT: "#1d4ed8",
          hover: "#1e40af",
          light: "#dbeafe",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f7f7f7",
          dark: "#0f0f0f",
          "dark-muted": "#1a1a1a",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        serif: ["Lora", "Georgia", "Cambria", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "display-sm": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      maxWidth: {
        prose: "68ch",
        article: "720px",
        container: "1280px",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)",
        card: "0 2px 8px rgba(0,0,0,0.06)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};