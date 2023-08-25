module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
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
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin'), // Adding Flowbite as a plugin
  ],
}
