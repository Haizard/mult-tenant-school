/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Glassmorphism Background Colors
        background: '#F5F7FA',
        
        // Glass Card Colors
        'glass-white': 'rgba(255, 255, 255, 0.25)',
        'glass-white-strong': 'rgba(255, 255, 255, 0.4)',
        'glass-border': 'rgba(255, 255, 255, 0.18)',
        
        // Text Colors
        'text-primary': '#1A1A1A',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        
        // Vibrant Accent Colors
        'accent-purple': '#7C3AED',
        'accent-purple-light': '#A855F7',
        'accent-purple-dark': '#5B21B6',
        
        'accent-green': '#10B981',
        'accent-green-light': '#34D399',
        
        'accent-blue': '#3B82F6',
        'accent-blue-light': '#60A5FA',
        
        // Status Colors
        'status-success': '#10B981',
        'status-warning': '#F59E0B',
        'status-danger': '#EF4444',
        'status-info': '#3B82F6',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'purple-gradient': 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
        'green-gradient': 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        'blue-gradient': 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.18)',
        'glass-light': '0 4px 16px 0 rgba(255, 255, 255, 0.18)',
        'purple-glow': '0 0 20px rgba(124, 58, 237, 0.3)',
        'green-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'blue-glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'orange-glow': '0 0 20px rgba(245, 158, 11, 0.3)',
        'red-glow': '0 0 20px rgba(239, 68, 68, 0.3)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(124, 58, 237, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}

