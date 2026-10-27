export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lavender: '#CDB4FF', lilac: '#E9D5FF', dream: '#B197FC',
        deep: '#7155A5', light: '#F8F3FF', cream: '#FFFBFF', ink: '#4B3768'
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['Nunito', 'Quicksand', 'sans-serif']
      }
    }
  },
  plugins: []
}
