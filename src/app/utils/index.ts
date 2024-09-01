export function escapeHTML(html: string) {
  return new Option(html).innerHTML
}

export function codeBlock(code: string) {
  return `<div class="card"><pre><code class="language-javascript">${code.trim()}</code></pre></div>`
}

export function htmlBlock(code: string) {
  return `<div class="card"><pre><code class="language-html">${escapeHTML(code.trim())}</code></pre></div>`
}
