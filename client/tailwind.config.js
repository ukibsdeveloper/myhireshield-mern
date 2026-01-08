/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
        },
        brand: {
          green: '#22c55e',
          red: '#ef4444',
          navy: '#0f172a',
        }
      },
      fontFamily: {
        // 'Plus Jakarta Sans' professional websites ke liye best hai
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}