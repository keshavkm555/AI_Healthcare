/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#087f8c', // Brand primary
          800: '#06646e', // Brand dark hover
          900: '#134e4a',
          950: '#042f2e',
        },
        surface: '#f5f8fb',
        ink: '#1e2b3a',
        health: {
          bg: '#f5f8fb',
          dark: '#0f2530',
          text: '#1e2b3a',
          muted: '#617080',
          card: '#ffffff'
        }
      },
      boxShadow: {
        // Used across existing pages (Tailwind v4 names) - defined here so they work in v3
        '2xs': '0 1px 1px rgba(16, 24, 40, 0.04)',
        xs: '0 1px 2px rgba(16, 24, 40, 0.05)',
        soft: '0 4px 16px -4px rgba(16, 24, 40, 0.08)',
        glow: '0 10px 30px -8px rgba(8, 127, 140, 0.45)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
