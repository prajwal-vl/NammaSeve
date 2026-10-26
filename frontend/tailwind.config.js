/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'saffron': {
          DEFAULT: '#FF6B00',
          50: '#FFF4EB',
          100: '#FFE3CC',
          200: '#FFC799',
          500: '#FF6B00',
          600: '#E05B00',
          700: '#D9480F',
          900: '#8A2900',
        },
        'indian-green': {
          DEFAULT: '#138A36',
          50: '#F0FAF2',
          100: '#DDF4E3',
          200: '#B8E7C4',
          500: '#138A36',
          600: '#0E702A',
          700: '#075E2A',
          900: '#033316',
        },
        'warm-white': '#FFF9F1',
        'dark-text': '#20241F',
        'muted-text': '#62665F',
        'card-border': '#20241F',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
        kannada: ['"Noto Sans Kannada"', '"Tiro Kannada"', 'sans-serif'],
        body: ['Inter', '"Noto Sans Kannada"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px #20241F',
        'neo': '4px 4px 0px #20241F',
        'neo-lg': '6px 6px 0px #20241F',
        'neo-xl': '8px 8px 0px #20241F',
        'neo-orange': '4px 4px 0px #FF6B00',
        'neo-green': '4px 4px 0px #138A36',
      },
      borderRadius: {
        'neo': '8px',
      }
    },
  },
  plugins: [],
}
