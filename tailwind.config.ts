import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "hud-bg": "#000a14",
        "hud-cyan": "#00d4ff",
        "hud-blue": "#0088cc",
        "hud-orange": "#ff6600",
        "hud-text": "#e0f4ff",
        "hud-muted": "#4a7a9b",
        "hud-dark": "#001525",
        "hud-panel": "rgba(0, 20, 40, 0.85)",
      },
      fontFamily: {
        mono: ['"Space Mono"', "monospace"],
      },
      boxShadow: {
        "cyan-glow": "0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.15)",
        "cyan-glow-sm": "0 0 8px rgba(0, 212, 255, 0.5)",
        "orange-glow": "0 0 15px rgba(255, 102, 0, 0.5)",
      },
      animation: {
        "rotate-slow": "rotate-slow 20s linear infinite",
        "rotate-slow-reverse": "rotate-slow-reverse 15s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "blink": "blink 1s step-end infinite",
        "scan-line": "scan-line 3s linear infinite",
      },
      keyframes: {
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "rotate-slow-reverse": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
