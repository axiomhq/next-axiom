import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  define: {
    'NEXT_AXIOM_VERSION': process.env.npm_package_version,
  },
  optimizeDeps: {
    include: ['next-axiom-core'],
  },
  build: {
    target: 'esnext',
    lib: {
      entry: 'src/index.ts',
      name: 'next-axiom',
      formats: ['es', 'cjs'],
      fileName: (format) => `${format}/next-axiom.js`
    },
    rollupOptions: {
      external: (id) => id.includes('node_modules')
    },
    commonjsOptions: {
      include: [/next-axiom-core/, /node_modules/],
    }
  }
})
