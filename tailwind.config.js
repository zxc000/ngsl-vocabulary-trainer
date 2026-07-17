/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        muted: "#667085",
        paper: "#f8fafc",
        line: "#d9e2ec",
        accent: "#0f766e",
        coral: "#c2410c",
        violet: "#6d28d9"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(24, 33, 47, 0.10)"
      }
    }
  },
  plugins: []
};
