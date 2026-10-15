/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   '#0284C7',   // Calm Blue
          hover:     '#0369A1',   // Darker Blue
          dark:      '#075985',   // Deep Blue
          secondary: '#0D9488',   // Soft Teal
          teal:      '#0F766E',   // Dark Teal
          accent:    '#BAE6FD',   // Light Sky
          accentDark:'#7DD3FC',   // Medium Sky
          success:   '#10B981',   // Emerald
          warning:   '#F59E0B',   // Amber
          error:     '#EF4444',   // Red
          surface:   '#F0F9FF',   // Snow White Blue
          card:      '#FFFFFF',   // White
          card2:     '#E0F2FE',   // Tinted card
        },
        ui: {
          text1:   '#0C4A6E',   // Dark Navy
          text2:   '#0369A1',   // Medium Blue
          muted:   '#7BA7C2',   // Muted Blue-Gray
          border:  '#BAE6FD',   // Sky border
          border2: '#E0F2FE',   // Lighter border
          // Dark mode
          dark900: '#020D1A',
          dark800: '#071625',
          dark700: '#0C2237',
          dark600: '#183348',
          dark400: '#4A7A9B',
          dark200: '#A8CCDE',
          dark50:  '#E0F2FE',
        }
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tight:   '-0.02em',
        tighter: '-0.03em',
        wide:    '0.06em',
        wider:   '0.1em',
      },
      borderRadius: {
        '2xl':  '16px',
        '3xl':  '20px',
        '4xl':  '24px',
        '5xl':  '32px',
      },
      boxShadow: {
        'clean':      '0 1px 4px rgba(2,132,199,0.06), 0 4px 20px rgba(2,132,199,0.06)',
        'clean-md':   '0 4px 24px rgba(2,132,199,0.1)',
        'clean-lg':   '0 8px 48px rgba(2,132,199,0.12)',
        'teal':       '0 4px 20px rgba(13,148,136,0.2)',
        'blue':       '0 4px 20px rgba(2,132,199,0.25)',
        'inner-soft': 'inset 0 1px 3px rgba(2,132,199,0.06)',
        'glow-blue':  '0 0 0 3px rgba(2,132,199,0.15)',
        'glow-teal':  '0 0 0 3px rgba(13,148,136,0.15)',
      },
      backgroundImage: {
        'sky-mesh': `
          radial-gradient(at 0% 0%,   rgba(186,230,253,0.4) 0, transparent 50%),
          radial-gradient(at 100% 0%, rgba(13,148,136,0.06) 0, transparent 50%),
          radial-gradient(at 50% 100%,rgba(2,132,199,0.04)  0, transparent 50%)
        `,
        'hero-gradient': 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #CCFBF1 100%)',
        'blue-gradient': 'linear-gradient(135deg, #0284C7 0%, #0D9488 100%)',
        'card-gradient': 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)',
      },
      animation: {
        'pulse-ring':  'pulseRing 2s infinite ease-in-out',
        'float':       'float 6s ease-in-out infinite',
        'shimmer':     'shimmer 1.8s infinite',
      },
      keyframes: {
        pulseRing: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(2,132,199,0.3)' },
          '50%':     { boxShadow: '0 0 0 8px rgba(2,132,199,0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-6px)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition:  '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
