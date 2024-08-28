export function escapeHTML(html: string) {
  return new Option(html).innerHTML
}
