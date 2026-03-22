import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#455f88',
          dim: '#39537c',
          fixed: '#d6e3ff',
          'fixed-dim': '#bfd5ff',
        },
        secondary: {
          DEFAULT: '#546073',
          dim: '#495467',
          container: '#d8e3fa',
          'fixed-dim': '#cad5ec',
        },
        tertiary: {
          DEFAULT: '#5d5d78',
          dim: '#51516c',
          container: '#d9d7f8',
        },
        surface: {
          DEFAULT: '#f7fafc',
          dim: '#ccdde4',
          bright: '#f7fafc',
          container: {
            DEFAULT: '#e7eff3',
            high: '#dfeaef',
            highest: '#d7e5eb',
            low: '#eff4f7',
            lowest: '#ffffff',
          },
        },
        'on-surface': {
          DEFAULT: '#283439',
          variant: '#546166',
        },
        'on-primary': '#f6f7ff',
        'on-secondary': '#f8f8ff',
        'on-tertiary': '#fbf7ff',
        outline: {
          DEFAULT: '#707d82',
          variant: '#a7b4ba',
        },
        error: {
          DEFAULT: '#9f403d',
          container: '#fe8983',
        },
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
    },
  },
  plugins: [],
} satisfies Config
