/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Solana brand colors
        'solana-purple': '#9945FF',
        'solana-green': '#14F195',
        'solana-blue': '#00C2FF',
      },
    },
  },
  darkMode: 'media',
  plugins: [],
} 