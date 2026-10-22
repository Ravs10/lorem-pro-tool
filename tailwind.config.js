/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { 
    extend: {
      colors: {
        // Velora Brand
        brand: "tomato",
        dark: "gold",
        dark2: "#15151F",
        light: "#FFE5D0",
        // Palette Tool Export - yaha se tu tool se jo bhi copy karega, yaha paste karna
        palette: {
          1: "#FF7A1A",
          2: "#0A0A14",
          3: "#FFFFFF",
          4: "#FFE5D0",
          5: "#15151F",
        }
      }
    } 
  },
  plugins: [],
}
