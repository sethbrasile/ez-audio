/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import dtsPlugin from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dtsPlugin(),
  ],
  test: {
    environment: 'happy-dom',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ez-audio',
      fileName: 'index',
    },
  },
})
