/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import prismjs from 'vite-plugin-prismjs'
import dtsPlugin from 'vite-plugin-dts'

export default defineConfig({
  base: '/ez-audio/',
  plugins: [
    tsconfigPaths(),
    prismjs({
      languages: ['typescript', 'html'],
      plugins: ['line-numbers'],
      theme: 'tomorrow',
      css: true,
    }),
    dtsPlugin(),
  ],
  publicDir: './src/app/public',
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
