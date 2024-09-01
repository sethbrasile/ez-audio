/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import prismjs from 'vite-plugin-prismjs'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    prismjs({
      languages: ['javascript', 'html'],
      plugins: ['line-numbers'],
      theme: 'tomorrow',
      css: true,
    }),
  ],
  publicDir: './src/app/public',
  test: {
    environment: 'happy-dom',
  },
})
