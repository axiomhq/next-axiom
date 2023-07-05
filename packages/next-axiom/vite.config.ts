import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import preserveDirectives from "rollup-plugin-preserve-directives";
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // to preserve the 'use client' directive in the generated code
    // this only works when build.rollupOptions.output.preserveModules is true
    preserveDirectives(),
  ],
  define: {
    'NEXT_AXIOM_VERSION': process.env.npm_package_version,
  },
  optimizeDeps: {
    include: ['next-axiom-core'],
  },
  esbuild: {
    minifyIdentifiers: false,
    keepNames: true,
  },
  build: {
    target: 'esnext',
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        // copy the shared package to core instead of internal/next-axiom-core/src
        const entry = entryName.replace('internal/next-axiom-core/src/', 'core/')
        return `${format}/${entry}.js`
      }
    },
    rollupOptions: {
      external: id => {
        return !(path.isAbsolute(id) || id.startsWith(".") || id === 'next-axiom-core')
      },
      output: {
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'src',
        sourcemap: true,
      }
    },
  }
})
