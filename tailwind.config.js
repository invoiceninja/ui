module.exports = {
  purge: {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    safelist: ["bg-green-800"],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
