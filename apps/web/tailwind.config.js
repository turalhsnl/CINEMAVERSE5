/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#080810",
        "void-100": "#12121f",
        "void-200": "#1a1a2e",
        ember: "#FF6B2C",
        "ember-light": "#FF8F5C",
        "ember-dark": "#E5521A",
        gold: "#F0A500",
        silver: "#8892A4",
        "silver-light": "#B8C0CC",
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};
