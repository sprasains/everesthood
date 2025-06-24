import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8b5cf6", // purple
        secondary: "#ec4899", // pink
        accent: "#38bdf8", // blue
        // Gen-Z specific gradients
        'gradient-start': '#FF5CCC',
        'gradient-middle': '#DC52BF', 
        'gradient-end': '#743296',
        // Soft dark backgrounds
        'dark-soft': '#242424',
        'dark-medium': '#1b1b1b',
        'dark-deep': '#111827'
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      },
      animation: {
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    }
  },
  plugins: []
};

export default config;