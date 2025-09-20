/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.{html,js,ts,jsx,tsx}",
    "./html/**/*.html",
    "./js/**/*.js",
    "./ts/**/*.ts"
  ],
  theme: {
    extend: {
      colors: {
        // Candlelight palette
        'candlelight': {
          '50': '#ffffe7',
          '100': '#fdffc1',
          '200': '#ffff86',
          '300': '#fff741',
          '400': '#ffe90d',
          '500': '#f5d200',
          '600': '#d1a100',
          '700': '#a67302',
          '800': '#895a0a',
          '900': '#74490f',
          '950': '#442604',
        },
        // Supernova palette
        'supernova': {
          '50': '#fefde8',
          '100': '#fffdc2',
          '200': '#fff887',
          '300': '#ffed43',
          '400': '#ffdc10',
          '500': '#facb03',
          '600': '#ce9700',
          '700': '#a46b04',
          '800': '#88540b',
          '900': '#734410',
          '950': '#432305',
        },
        // International Orange palette
        'international-orange': {
          '50': '#fef5ee',
          '100': '#fee8d6',
          '200': '#fbcead',
          '300': '#f8ab79',
          '400': '#f47f43',
          '500': '#f15d1f',
          '600': '#e24214',
          '700': '#bc3112',
          '800': '#952817',
          '900': '#782416',
          '950': '#410f09',
        },
        // Chilean Fire palette
        'chilean-fire': {
          '50': '#fff9ed',
          '100': '#fff2d4',
          '200': '#ffe2a9',
          '300': '#ffcc72',
          '400': '#feab39',
          '500': '#fc8f13',
          '600': '#f6790b',
          '700': '#c55809',
          '800': '#9c4510',
          '900': '#7e3a10',
          '950': '#441c06',
        },
        // Pong theme colors
        'pong': {
          'bg-primary': '#222121',
          'bg-secondary': '#1a1919',
          'bg-tertiary': '#575656',
          'text-primary': '#ffffff',
          'text-secondary': '#e0e0e0',
          'text-reverse': '#222121',
          'text-accent': '#ffe90d',
          'text-muted': '#808080',
          'line': '#e0e0e0',
        }
      }
    },
  },
  plugins: [],
}
