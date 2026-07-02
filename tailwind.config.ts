import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bank: {
          primary: '#6B1E78',
          dark: '#2D1234',
          soft: '#F6F1F8',
        },
        wasaq: {
          primary: '#0F766E',
          dark: '#134E4A',
          soft: '#E6FFFA',
          safe: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
        },
        app: {
          bg: '#F8F7FA',
          card: '#FFFFFF',
          text: '#1E1B24',
          muted: '#7A7280',
        },
      },
      fontFamily: {
        sans: ['var(--font-arabic)', 'Noto Sans Arabic', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}

export default config
