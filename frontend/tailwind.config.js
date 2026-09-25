/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Crucial: This allows us to toggle dark mode via a React context
  theme: {
    extend: {
      colors: {
        // Udharo specific status colors that map to your backend states
        status: {
          pending: "#f97316",
          active: "#3b82f6",
          return: "#a855f7",
          completed: "#22c55e",
          damage: "#ef4444",
          disputed: "#eab308",
        },
        brand: {
          DEFAULT: "#2563eb", // blue-600
          dark: "#1e3a8a", // blue-900
          light: "#dbeafe", // blue-50
        },
      },
    },
  },
  plugins: [],
};
