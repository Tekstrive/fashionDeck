/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        shadow: {
          DEFAULT: "#1A1A19", // Darker for better contrast
          light: "#242423",
          muted: "#575756", // Defined muted color instead of low opacity
        },
        dust: {
          DEFAULT: "#CFDBD5",
          light: "#E2E9E6",
        },
        ivory: {
          DEFAULT: "#E8EDDF",
          light: "#FBFBF9", // Cleaner off-white
        },
        tuscan: {
          DEFAULT: "#E9BA31", // Slightly darker yellow for better contrast on white
          light: "#F5CB5C",
          dark: "#D4A316",
        },
        surface: {
          50: "#FFFFFF", // Pure white for bento bricks
          100: "#FBFBF9",
          200: "#E8EDDF",
          300: "#CFDBD5",
          900: "#1A1A19",
          950: "#0A0A09",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-outfit)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        premium:
          "0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
        vibrant:
          "0 10px 15px -3px rgba(14, 165, 233, 0.2), 0 4px 6px -4px rgba(14, 165, 233, 0.1)",
      },
    },
  },
  plugins: [],
};
