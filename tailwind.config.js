/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Color verde personalizado RGB(96, 152, 57)
        green: {
          50: '#f2f8eb',   // Muy claro
          100: '#e0efce',  // Claro
          200: '#c4de9e',  // Claro medio
          300: '#a4ca68',  // Medio claro
          400: '#87b43c',  // Medio
          500: '#609839',  // Base RGB(96, 152, 57)
          600: '#4b7a2e',  // Medio oscuro
          700: '#3a5e24',  // Oscuro
          800: '#2f4a1e',  // Muy oscuro
          900: '#283e1c',  // Extra oscuro
          950: '#12210c',  // Máximo oscuro
        },
      },
    },
  },
  plugins: [],
};
