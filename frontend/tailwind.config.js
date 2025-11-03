/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			heading: [
  				'Roboto',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'Rajdhani',
  				'sans-serif'
  			],
  			mono: [
  				'Roboto Mono',
  				'ui-monospace',
  				'monospace'
  			],
  			alt: [
  				'Archivo',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		colors: {
  			brand: {
  				DEFAULT: '#DC2626',
  				light: '#FCA5A5',
  				dark: '#991B1B'
  			},
  			action: {
  				DEFAULT: '#2563EB',
  				light: '#93C5FD',
  				dark: '#1E3A8A'
  			},
  			map: {
  				DEFAULT: '#F3F4F6',
  				marker: '#EF4444'
  			},
  			emergency: '#DC2626',
  			relief: '#2563EB',
  			background: 'hsl(var(--background))',
  			surface: '#FFFFFF',
  			text: {
  				DEFAULT: '#1F2937',
  				muted: '#6B7280',
  				light: '#9CA3AF'
  			},
  			border: 'hsl(var(--border))',
  			accent: {
  				teal: '#0D9488',
  				purple: '#7C3AED',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			success: {
  				DEFAULT: '#10B981',
  				light: '#D1FAE5',
  				dark: '#065F46'
  			},
  			warning: {
  				DEFAULT: '#F59E0B',
  				light: '#FEF3C7',
  				dark: '#92400E'
  			},
  			info: {
  				DEFAULT: '#3B82F6',
  				light: '#DBEAFE',
  				dark: '#1E40AF'
  			},
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontSize: {
  			xs: [
  				'0.625rem',
  				{
  					lineHeight: '1rem',
  					letterSpacing: '0.01em'
  				}
  			],
  			sm: [
  				'0.75rem',
  				{
  					lineHeight: '1.25rem',
  					letterSpacing: '0.01em'
  				}
  			],
  			base: [
  				'0.875rem',
  				{
  					lineHeight: '1.5rem'
  				}
  			],
  			lg: [
  				'1rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			xl: [
  				'1.125rem',
  				{
  					lineHeight: '2rem'
  				}
  			],
  			'2xl': [
  				'1.25rem',
  				{
  					lineHeight: '2.4rem',
  					letterSpacing: '-0.01em'
  				}
  			],
  			'3xl': [
  				'1.5rem',
  				{
  					lineHeight: '2.8rem',
  					letterSpacing: '-0.02em'
  				}
  			]
  		},
  		borderRadius: {
  			xl: '1rem',
  			'2xl': '1.5rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem'
  		},
  		boxShadow: {
  			soft: '0 2px 8px rgba(0, 0, 0, 0.08)',
  			medium: '0 4px 16px rgba(0, 0, 0, 0.12)',
  			strong: '0 8px 24px rgba(0, 0, 0, 0.16)'
  		},
  		animation: {
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'fade-in': 'fadeIn 0.3s ease-in-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			}
  		},
  		backdropBlur: {
  			xs: '2px'
  		}
  	}
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
      require("tailwindcss-animate")
],
}