/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Chat bubble background colors
    'bg-slate-100',
    'bg-emerald-500',
    'dark:bg-slate-700',
    'dark:bg-emerald-600',
    // Text colors
    'text-slate-900',
    'text-white',
    'dark:text-slate-200',
    // Border radius and padding
    'rounded-lg',
    'p-4',
    'pt-3',
    'max-w-[70%]',
    'text-sm',
    'break-words',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
