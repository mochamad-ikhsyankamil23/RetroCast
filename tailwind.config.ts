import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        aero: {
          cyan: "#00C9FF",
          green: "#92FE9D",
          pink: "#f8bbd0",
          yellow: "#fff9c4",
          purple: "#d1c4e9",
          text: "#1a237e",
          border: "rgba(255,255,255,0.3)",
          glass: "rgba(255, 255, 255, 0.2)",
          glassHover: "rgba(255, 255, 255, 0.3)",
        },
      },
      backgroundImage: {
        'aero-gradient': 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)',
        'aero-bg': 'linear-gradient(180deg, #e0f7fa 0%, #b2dfdb 100%)',
        'glossy-overlay': 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 51%, rgba(255,255,255,0.2) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 15px rgba(0, 201, 255, 0.5)',
        'inner-gloss': 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
