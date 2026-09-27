/* Build: npx -y tailwindcss@3 -c tailwind.config.js -i src/input.css -o assets/css/styles.css --minify */
module.exports = {
  content: ['./index.html'],
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        // Demonstração "Sálvia & Areia": verde-sálvia, areia e verde profundo
        ivory: { DEFAULT: '#F8F6F1', 2: '#EEEBE3' },
        rose: {
          50: '#EFF3EE', 100: '#DEE7DF', 200: '#C9D8CC', 300: '#A9C2B0',
          400: '#86A792', 500: '#688A75', 600: '#4B6B58',
        },
        cocoa: { 950: '#121C19', 900: '#1B2A25', 800: '#283B34', 700: '#375046' },
        gold: { 300: '#E9DDC6', 400: '#D8C49E', 500: '#C2A574', 600: '#9A7F55' },
      },
      fontFamily: {
        serif: ['"Gloock"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { widest2: '0.22em' },
    },
  },
};
