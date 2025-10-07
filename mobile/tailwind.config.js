/** @type {import('tailwindcss').Config} */

const colors = require("./src/styles/colors");

module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: { colors },
    },
    plugins: [],
};
