/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#07080E",         // Solid Crisp Dark Background
          bezel: "#12141F",      // Solid Dark Bezel
          card: "#0E101A",       // High-Contrast Solid Matte Card
          cardLight: "#161926",  // Clear Solid Card Fill
          border: "rgba(255, 255, 255, 0.15)", // Sharp Crisp Border
          borderRed: "#E11D48",
          accent: "#E11D48",    // Vibrant Bold Red
          blue: "#E11D48",      
          red: "#E11D48",       // Crisp Digital Red
          teal: "#00F2FE",      // Crisp Digital Teal
          critical: "#E11D48",  
          warning: "#FFB300",   
          success: "#00E5FF",   
          muted: "#94A3B8",     
          text: "#FFFFFF"       // Pure High-Contrast White Text
        }
      },
      boxShadow: {
        'none': 'none',
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
      },
      borderRadius: {
        '2xl': '14px',
        '3xl': '18px'
      }
    },
  },
  plugins: [],
}
