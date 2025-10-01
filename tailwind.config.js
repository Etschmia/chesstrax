/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray-primary': '#262421',
        'gray-secondary': '#302E2B',
        'gray-tertiary': '#403D39',
        'text-primary': '#EAEAEA',
        'text-secondary': '#A3A3A3',
        'accent': '#A3BFFA',
        'accent-dark': '#7F9CF5',
      }
    }
  },
  plugins: [],
}