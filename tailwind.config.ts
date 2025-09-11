import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F9FA',
        'sidebar-bg': '#FFFFFF',
        'text-primary': '#212529',
        'text-secondary': '#6C757D',
        'accent-purple': '#7C5DFA',
        'accent-light-purple': '#E5DFFF',
        'accent-blue': '#4D8BFA',
        'accent-light-blue': '#DFEEFF',
        'accent-orange': '#FFA500',
        'accent-light-orange': '#FFF4DF',
        'status-success': '#28A745',
        'status-warning': '#FFC107',
        'status-danger': '#DC3545',
        'border-color': '#E9ECEF',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
