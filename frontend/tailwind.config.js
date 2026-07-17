/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#080c14",
          card: "#0f1624",
          cardLight: "#162035",
          border: "#1b2a47",
          accent: "#00f0ff", // Electric cyan
          blue: "#3b82f6",   // Blue accent
          amber: "#f59e0b",
          red: "#ef4444",
          green: "#10b981"
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.15)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.2)',
        'glow-blue': '0 0 15px rgba(59, 130, 246, 0.2)',
      }
    },
  },
  plugins: [],
}
