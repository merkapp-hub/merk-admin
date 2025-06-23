/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'custom-red': "#FE3E00",
        'custom-blue': "#14374D",
        'custom-lightGray': "#F9FAFB",
        'custom-yellow': "#E59013",
        'custom-black': "#202224",
        'custom-green': "#00B69B",
        'custom-lightRed': "#F93C65",
        "custom-offWhiteColor": '#FAFBFD',
        "custom-offWhite": '#D5D5D5',
        'custom-darkGray': "#62676C",
        'custom-lightRedColor': "#FF5733",
        'custom-darkGrayColor': "#4A4B5C",
        'custom-newGray': "#9C9CA3",
        'custom-newGrayColor': "#C5C5C5",
        "custom-lightsGrayColor": "#B9B9B9",
        "custom-lightGrayInputName": "#606060",
        "custom-lightGrayInputBg": "#F5F6FA",
        'custom-newGrayColors': "#C4C4C4",
        'custom-darkGrayColors': "#757575",
        'custom-offWhiteColors': "#E7E7E7",
        'custom-newBlack': "#434343",
        'custom-lightBlue': "#4880FF",
        'custom-lightRed': "#FF4848",
        'custom-darkpurple': "#26004d",
        'custom-darkRed': "#e60073",
        'custom-darkGreen':"#07A404"
      }
    },
  },
  plugins: [],
};
