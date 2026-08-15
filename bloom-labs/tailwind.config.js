/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#34DAC2",
          50: "#E8FBF8",
          100: "#C5F5EE",
          200: "#8AEDDE",
          300: "#5AE5D0",
          400: "#34DAC2",
          500: "#2AB8A3",
          600: "#219684",
          700: "#187464",
          800: "#0F5245",
          900: "#063026",
        },
        charcoal: {
          DEFAULT: "#25262F",
          50: "#E8E8EA",
          100: "#C5C6CA",
          200: "#8F909A",
          300: "#5F6070",
          400: "#3A3B47",
          500: "#25262F",
          600: "#1E1F27",
          700: "#17181E",
          800: "#101116",
          900: "#09090D",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Cal Sans", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
