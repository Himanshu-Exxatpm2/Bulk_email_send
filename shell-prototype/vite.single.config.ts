import { defineConfig, mergeConfig } from 'vite'
import base from './vite.config'

// Builds the whole prototype with every asset inlined so scripts/build-single-file.mjs
// can fold it into one HTML file that opens from disk.
export default mergeConfig(
  base,
  defineConfig({
    base: './',
    define: { 'import.meta.env.VITE_SINGLE_FILE': 'true' },
    build: {
      outDir: 'dist-single',
      emptyOutDir: true,
      assetsInlineLimit: 100_000_000,
      cssCodeSplit: false,
      chunkSizeWarningLimit: 10_000,
      rollupOptions: { output: { inlineDynamicImports: true } },
    },
  }),
)
