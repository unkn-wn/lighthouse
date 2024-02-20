/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary': '#fe575f',
        'secondary': '#1e3446',
        'disabled': '#8e8e93',
      }
    },
  },
  plugins: [],
}

