import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'tg-bg': 'var(--tg-theme-bg-color)',
        'tg-secondary-bg': 'var(--tg-theme-secondary-bg-color)',
        'tg-text': 'var(--tg-theme-text-color)',
        'tg-hint': 'var(--tg-theme-hint-color)',
        'tg-button': 'var(--tg-theme-button-color)',
        'tg-button-text': 'var(--tg-theme-button-text-color)',
        'tg-link': 'var(--tg-theme-link-color)',
        'tg-destructive': 'var(--tg-theme-destructive-text-color)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      minHeight: {
        'touch': '44px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.06)',
      },
    },
  },
} satisfies Config
