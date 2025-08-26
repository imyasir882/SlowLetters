import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          cream: '#F7F3E9',
          parchment: '#F2E8D5',
          gold: '#D4AF37',
          bronze: '#CD7F32',
          darkGold: '#B8860B',
          sepia: '#704214',
          ink: '#2C1810',
          faded: '#8B7355',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        script: ['Dancing Script', 'cursive'],
        elegant: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'envelope-drop': 'envelopeDrop 0.8s ease-out',
        'paper-fold': 'paperFold 0.6s ease-in-out',
        'stopwatch-pulse': 'stopwatchPulse 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        envelopeDrop: {
          '0%': { transform: 'translateY(-100px) rotate(-5deg)', opacity: '0' },
          '60%': { transform: 'translateY(10px) rotate(2deg)', opacity: '0.8' },
          '100%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
        },
        paperFold: {
          '0%': { transform: 'rotateY(-90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        stopwatchPulse: {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.7)' },
          '70%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)' },
        },
      },
      backgroundImage: {
        'vintage-paper': "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJwYXBlciIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIj4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0Y3RjNFOSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9IiNGMkU4RDUiIG9wYWNpdHk9IjAuMyIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXBlcikiLz4KPC9zdmc+')",
      },
    },
  },
  plugins: [],
}
export default config
