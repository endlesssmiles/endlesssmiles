
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				love: {
					50: '#FFF5F7',
					100: '#FFDEE2',
					200: '#FDC8D0',
					300: '#FBA4B2',
					400: '#F98095',
					500: '#F75D77',
					600: '#D44C63',
					700: '#B03A50',
					800: '#8D293C',
					900: '#6A1728',
				},
				gold: {
					50: '#FFFDFD',
					100: '#FFF2F4', // Creamy soft rose-tinted ivory
					200: '#FFE1E6', // Warm pink-ivory
					300: '#FFCCD4', // Soft rose gold highlight
					400: '#FFAAB7', // Glowing rose gold text
					500: '#FCA5B3', // Shimmering peach-rose gold button
					600: '#E58B99',
					700: '#C16F7B',
					800: '#9D535E',
					900: '#7A3943',
				},
				purple: {
					50: '#FBF2F6',
					100: '#F2C4DB',
					200: '#E48FBA',
					300: '#D05C90',
					400: '#B43971',
					500: '#912757',
					600: '#6D1B40', // Berry rose border
					700: '#4A122B', // Wine border
					800: '#2E0A1A', // Dark plum card
					900: '#16040A', // Deep velvety burgundy
					950: '#0F0206', // Black-cherry depth
				},
				blush: {
					50: '#FEF6F0',
					100: '#FDE1D3',
					200: '#FBCBB6',
					300: '#F9B599',
					400: '#F79F7C',
					500: '#F5895F',
					600: '#D37451',
					700: '#B15F44',
					800: '#8F4B36',
					900: '#6D3628',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'float-delayed': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-15px)' }
				},
				'heartbeat': {
					'0%': { transform: 'scale(1)' },
					'25%': { transform: 'scale(1.15)' },
					'50%': { transform: 'scale(1)' },
					'75%': { transform: 'scale(1.15)' },
					'100%': { transform: 'scale(1)' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'confetti': {
					'0%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
					'100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' }
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.6' }
				},
				'typewriter': {
					'0%': { width: '0' },
					'100%': { width: '100%' }
				},
				'ken-burns': {
					'0%': { transform: 'scale(1)' },
					'100%': { transform: 'scale(1.05)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(5px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'float-delayed': 'float-delayed 8s ease-in-out infinite',
				'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
				'fade-in': 'fade-in 0.8s ease-out forwards',
				'scale-in': 'scale-in 0.5s ease-out forwards',
				'confetti': 'confetti 5s ease-in-out forwards',
				'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
				'typewriter': 'typewriter 3.5s steps(40, end) forwards',
				'ken-burns': 'ken-burns 4s ease-out forwards',
				'slide-up': 'slide-up 0.5s ease-out forwards',
				'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both'
			},
			fontFamily: {
				'serif': ['Playfair Display', 'serif'],
				'sans': ['Montserrat', 'sans-serif'],
				'handwritten': ['Dancing Script', 'cursive']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
