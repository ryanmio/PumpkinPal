module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        'lato': ['Lato', 'sans-serif'],
      },
      colors: {
        'green-button': '#80876E',
        'green-button-hover': '#6c755e',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
