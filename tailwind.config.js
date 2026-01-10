/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#0a0f1a',
                'bg-secondary': '#111827',
                'bg-tertiary': '#1f2937',
            },
        },
    },
    plugins: [],
}
