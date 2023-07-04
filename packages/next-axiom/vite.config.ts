import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  optimizeDeps: {
    include: ['next-axiom-core'],
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'next-axiom',
      formats: ['es', 'umd'],
      fileName: (format) => `next-axiom.${format}.js`
    },
    rollupOptions: {
      external: (id) => id.includes('node_modules')
    },
    commonjsOptions: {
      include: [/next-axiom-core/, /node_modules/],
    }
  }
})
