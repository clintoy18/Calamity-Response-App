/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],      // General UI
        heading: ['Roboto', 'system-ui', 'sans-serif'],  // Section titles
        display: ['Rajdhani', 'sans-serif'],             // Symbolic / emergency titles
        mono: ['Roboto Mono', 'ui-monospace', 'monospace'], // Numbers / tracker
        alt: ['Archivo', 'system-ui', 'sans-serif'],     // Optional CTA / buttons
      },
      colors: {
        // Brand Identity
        brand: {
          DEFAULT: '#DC2626',
          light: '#FCA5A5',
          dark: '#991B1B',
        },
        
        // Relief & Action
        action: {
          DEFAULT: '#2563EB',
          light: '#93C5FD',
          dark: '#1E3A8A',
        },
        
        // Map & UI Neutrals
        map: {
          DEFAULT: '#F3F4F6',
          marker: '#EF4444',
        },
        
        // Aid Status Indicators
        emergency: '#DC2626',
        relief: '#2563EB',
        
        // UI Backgrounds
        background: '#FAFAFA',
        surface: '#FFFFFF',
        
        // Text
        text: {
          DEFAULT: '#1F2937',
          muted: '#6B7280',
          light: '#9CA3AF',
        },
        
        // Borders
        border: {
          DEFAULT: '#E5E7EB',
          strong: '#D1D5DB',
        },
        
        // Accents
        accent: {
          teal: '#0D9488',
          purple: '#7C3AED',
        },
        
        // Status colors for better semantic meaning
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#92400E',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          dark: '#1E40AF',
        },
      },
      fontSize: {
        xs: ['0.625rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],      // 10px
        sm: ['0.75rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],    // 12px
        base: ['0.875rem', { lineHeight: '1.5rem' }],                           // 14px
        lg: ['1rem', { lineHeight: '1.75rem' }],                                // 16px
        xl: ['1.125rem', { lineHeight: '2rem' }],                               // 18px
        '2xl': ['1.25rem', { lineHeight: '2.4rem', letterSpacing: '-0.01em' }], // 20px
        '3xl': ['1.5rem', { lineHeight: '2.8rem', letterSpacing: '-0.02em' }],  // 24px
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.16)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}