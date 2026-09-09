const path = require('path')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
      colors: {
        surface: {
          base: '#fafafa',
          card: '#ffffff',
          sidebar: '#ffffff',
          overlay: '#f4f4f5',
        },
        border: {
          DEFAULT: '#e4e4e7',
          strong: '#d4d4d8',
        },
        text: {
          primary: '#18181b',
          secondary: '#71717a',
          muted: '#a1a1aa',
        },
        accent: {
          DEFAULT: '#18181b',
          hover: '#27272a',
          ring: '#d4d4d8',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        sidebar: '1px 0 0 0 #e4e4e7',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
