module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    './public/index.html', // Keeping the public index.html for global styles
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}', // Flowbite source paths
  ],
  theme: {
    extend: {
      fontFamily: {
        'lato': ['Lato', 'sans-serif'],
      },
      colors: {
        'green-button': '#80876E',
        'green-button-hover': '#6c755e',
        'dark_orange_(web)': {
          DEFAULT: '#fb9336',
          100: '#3c1d01',
          200: '#783902',
          300: '#b45604',
          400: '#f07305',
          500: '#fb9336',
          600: '#fca85f',
          700: '#fdbe87',
          800: '#fdd4af',
          900: '#fee9d7'
        },
        'sunset': {
          DEFAULT: '#ffd699',
          100: '#523100',
          200: '#a36200',
          300: '#f59300',
          400: '#ffb647',
          500: '#ffd699',
          600: '#ffdead',
          700: '#ffe7c2',
          800: '#ffefd6',
          900: '#fff7eb'
        },
        'reseda_green': {
          DEFAULT: '#80876e',
          100: '#1a1b16',
          200: '#33362c',
          300: '#4d5142',
          400: '#666c58',
          500: '#80876e',
          600: '#9aa08a',
          700: '#b3b7a7',
          800: '#cccfc5',
          900: '#e6e7e2'
        },
        'alabaster': {
          DEFAULT: '#f2eee3',
          100: '#40371e',
          200: '#816e3b',
          300: '#b7a062',
          400: '#d5c7a3',
          500: '#f2eee3',
          600: '#f5f1e9',
          700: '#f7f5ee',
          800: '#faf8f4',
          900: '#fcfcf9'
        },
        'flame': {
          DEFAULT: '#df6139',
          100: '#301108',
          200: '#602310',
          300: '#913418',
          400: '#c1451f',
          500: '#df6139',
          600: '#e58061',
          700: '#eca089',
          800: '#f2bfb0',
          900: '#f9dfd8'
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require('flowbite/plugin'), // Adding Flowbite as a plugin
  ],
}