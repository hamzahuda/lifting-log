/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                background: "rgb(247, 247, 247)",
                primary: "#ffffff",
                secondary: "#e9e9e9",
                accent: "#437ace",
                "t-primary": "#000000",
                "t-secondary": "#5a5a5a",
                "t-tertiary": "#5a5a5a",
            },
        },
    },
    plugins: [],
};
