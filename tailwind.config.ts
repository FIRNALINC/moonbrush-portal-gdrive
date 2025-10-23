import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "rgb(var(--brand-bg) / <alpha-value>)",
          card: "rgb(var(--brand-card) / <alpha-value>)",
          primary: "rgb(var(--brand-primary) / <alpha-value>)",
          secondary: "rgb(var(--brand-secondary) / <alpha-value>)",
          accent: "rgb(var(--brand-accent) / <alpha-value>)",
          muted: "rgb(var(--brand-muted) / <alpha-value>)",
          ring: "rgb(var(--brand-ring) / <alpha-value>)",
          text: "rgb(var(--brand-text) / <alpha-value>)",
          subtle: "rgb(var(--brand-subtle) / <alpha-value>)"
        }
      },
      boxShadow: { card: "0 6px 30px rgba(0,0,0,0.08)" },
      borderRadius: { xl: "14px" }
    }
  },
  plugins: []
}
export default config
