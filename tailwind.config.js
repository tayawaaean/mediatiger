/** @type {import('tailwindcss').Config} */
import * as tailwindAnimate from "tailwindcss-animate";
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "card-bg": "#1C1C3B",
        "border-hover": "rgba(99, 102, 241, 0.3)",
        "accent-light": "rgba(99, 102, 241, 0.1)",
        "accent-border-hover": "rgba(99, 102, 241, 0.3)",
        "accent-icon": "rgb(129, 140, 248)",
        secondary: "rgb(148 163 184)",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        glow: {
          "0%, 100%": {
            filter: "drop-shadow(0 0 12px rgba(253, 224, 71, 0.45))",
          },
          "50%": { filter: "drop-shadow(0 0 20px rgba(253, 224, 71, 0.7))" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        glow: "glow 2.5s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
      },
      dropShadow: {
        "glow-teal": "0 0 10px rgba(13, 148, 136, 0.7)",
        "glow-amber": "0 0 10px rgba(245, 158, 11, 0.7)",
        "glow-fuchsia": "0 0 10px rgba(192, 38, 211, 0.7)",
        "glow-emerald": "0 0 10px rgba(5, 150, 105, 0.7)",
        "glow-sky": "0 0 10px rgba(14, 165, 233, 0.7)",
        "glow-rose": "0 0 10px rgba(244, 63, 94, 0.7)",
        "glow-subtle": "0 0 8px rgba(253, 224, 71, 0.25)", // Soft yellow glow
      },
      screens: {
        xs: "475px",
        // ... other breakpoints
      },
    },
  },
  plugins: [tailwindAnimate],
};
