
import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/**/*.ts', 'src/**/*.tsx'],
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
    bundle: false,
    // keepNames: true,
    esbuildPlugins: [],
    esbuildOptions(options, context) {
        console.log({ options })
        // options.define.foo = '"bar"'
        options.define.version = '"bar"'
    },
})