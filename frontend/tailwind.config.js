/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#8A4FFF",
        "primary-light": "#E6E8FF",
        "primary-dark": "#5B21B6",
        saffron: "#FF9933",
        "purple-divine": "#8A4FFF",
        "teal-aurora": "#14B8A6",
        "gold-divine": "#FFD700",
        accent: "#4A5568"
      },
      borderRadius: {
        '5xl': '3rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}