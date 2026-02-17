/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: {
          primary: '#0a0e17',
          secondary: '#111827',
          elevated: '#1a2332',
        },
        // Accents (colores de estado)
        accent: {
          growth: '#00ffaa',
          'growth-bg': '#00ff88',
          alert: '#ffaa77',
          'alert-bg': '#ff6b35',
          neutral: '#5b9dff',
          'neutral-bg': '#3b82f6',
        },
        // Text
        text: {
          primary: '#f3f4f6',
          secondary: '#9ca3af',
          muted: '#6b7280',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['DM Sans', 'sans-serif'],
        // aliases legacy
        outfit: ['Outfit', 'sans-serif'],
        jetbrains: ['JetBrains Mono', 'monospace'],
        dm: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-growth': '0 0 20px rgba(0, 255, 170, 0.3)',
        'glow-alert': '0 0 20px rgba(255, 107, 53, 0.3)',
        'glow-neutral': '0 0 20px rgba(59, 130, 246, 0.3)',
      },
    },
  },
  plugins: [],
}
