/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2933',
        steel: '#52616b',
        mint: '#2f9e82',
        saffron: '#d97706',
        signal: '#2563eb'
      }
    }
  },
  plugins: []
};

