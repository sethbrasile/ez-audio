export function escapeHTML(html: string): string {
  return new Option(html).innerHTML
}

export function codeBlock(code: string): string {
  return `<div class="card"><pre><code class="language-javascript">${code.trim()}</code></pre></div>`
}

export function htmlBlock(code: string): string {
  return `<div class="card"><pre><code class="language-html">${escapeHTML(code.trim())}</code></pre></div>`
}

export function getSamplesPaths(instrument: string): string[] {
  return [1, 2, 3].map(num => `/ez-audio/drum-samples/${instrument}${num}.wav`)
}
