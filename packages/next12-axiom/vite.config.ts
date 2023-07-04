import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  optimizeDeps: {
    include: ['next-axiom-core'],
  },
  build: {
    lib: {
        entry: 'src/index.ts',
        name: 'next12-axiom',
        formats: ['es', 'umd'],
        fileName: (format) => `next12-axiom.${format}.js`
    },
    commonjsOptions: {
      include: [/next-axiom-core/, /node_modules/],
    }
  }
})
