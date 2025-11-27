/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
	theme: {
		extend: {
			colors: {
				foreground: "rgb(var(--foreground) / <alpha-value>)",
				background: "rgb(var(--background) / <alpha-value>)",
				primary: {
					DEFAULT: "rgb(var(--primary) / <alpha-value>)",
					foreground:
						"rgb(var(--primary-foreground) / <alpha-value>)",
				},
				destructive: {
					DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
					foreground:
						"rgb(var(--destructive-foreground) / <alpha-value>)",
				},
				secondary: {
					DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
					foreground:
						"rgb(var(--secondary-foreground) / <alpha-value>)",
				},
				accent: {
					DEFAULT: "rgb(var(--accent) / <alpha-value>)",
					foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
				},
				muted: {
					DEFAULT: "rgb(var(--muted) / <alpha-value>)",
					foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
				},
				input: "rgb(var(--input) / <alpha-value>)",
				ring: "rgb(var(--ring) / <alpha-value>)",
			},
			keyframes: {
				slideInRight: {
					"0%": {
						opacity: "0",
						transform: "translateX(100%)",
					},
					"100%": {
						opacity: "1",
						transform: "translateX(0)",
					},
				},
			},
			animation: {
				slideInRight: "slideInRight 0.3s ease",
			},
		},
	},
	plugins: [],
};
