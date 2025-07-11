
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
				// Catppuccin Mocha colors
				catppuccin: {
					rosewater: '#f5e0dc',
					flamingo: '#f2cdcd',
					pink: '#f5c2e7',
					mauve: '#cba6f7',
					red: '#f38ba8',
					maroon: '#eba0ac',
					peach: '#fab387',
					yellow: '#f9e2af',
					green: '#a6e3a1',
					teal: '#94e2d5',
					sky: '#89dceb',
					sapphire: '#74c7ec',
					blue: '#89b4fa',
					lavender: '#b4befe',
					text: '#cdd6f4',
					subtext1: '#bac2de',
					subtext0: '#a6adc8',
					overlay2: '#9399b2',
					overlay1: '#7f849c',
					overlay0: '#6c7086',
					surface2: '#585b70',
					surface1: '#45475a',
					surface0: '#313244',
					base: '#1e1e2e',
					mantle: '#181825',
					crust: '#11111b'
				}
			},
			fontFamily: {
				'pixel': ['JetBrains Mono', 'Courier New', 'monospace'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pixel-glow': {
					'0%, 100%': {
						boxShadow: '0 0 5px #94e2d5, 0 0 10px #94e2d5, 0 0 15px #94e2d5'
					},
					'50%': {
						boxShadow: '0 0 10px #94e2d5, 0 0 20px #94e2d5, 0 0 30px #94e2d5'
					}
				},
				'cursor-blink': {
					'0%, 50%': { opacity: '1' },
					'51%, 100%': { opacity: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pixel-glow': 'pixel-glow 2s ease-in-out infinite',
				'cursor-blink': 'cursor-blink 1s infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
