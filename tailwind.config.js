/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "m3-bg": "#f6f7fb",
        "m3-surface": "#FFFFFF",
        "m3-surfaceVariant": "#F1F3F7",
        "m3-outline": "#E0E4EA",
        "m3-muted": "#6B7280",
        "m3-primary": "#3B82F6",
        "m3-onprimary": "#ffffff",
        "m3-accent": "#6366F1",
        "m3-ok": "#10B981"
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.06)"
      }
    }
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"], // μόνο light
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
}

