import process from 'node:process'
import '@dotenvx/dotenvx'

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  entryPoints: ['./src/index.ts'],
  out: 'docs',
  hostedBaseUrl: process.env.VITE_DOCS_URL,
  useHostedBaseUrlForAbsoluteLinks: true,
}

export default config
