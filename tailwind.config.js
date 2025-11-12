/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#FFF5F9',
          100: '#FFE4F0',
          200: '#FFD1E6',
          300: '#FFB6D9',
          400: '#FF8AC4',
          500: '#FF6BB3',
          600: '#E6539D',
          700: '#CC3D87',
          800: '#B32971',
          900: '#991A5C',
        },
        purple: {
          50: '#F9F5FF',
          100: '#F2E9FF',
          200: '#E6D4FF',
          300: '#D4B4FF',
          400: '#B88AFF',
          500: '#A066FF',
          600: '#8B47E6',
          700: '#762ECC',
          800: '#6119B3',
          900: '#4C0899',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(255, 107, 179, 0.15)',
        'soft-lg': '0 10px 40px rgba(255, 107, 179, 0.2)',
        'inner-soft': 'inset 0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'heart-beat': 'heartBeat 1s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        heartBeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '10%, 30%': { transform: 'scale(1.1)' },
          '20%, 40%': { transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}

