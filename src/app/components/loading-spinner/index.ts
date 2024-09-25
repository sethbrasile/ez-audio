export default {
  setup() {
    return this
  },
  html: `
<div id="loading" class="spinner hidden">
  <div class="rect1"></div>
  <div class="rect2"></div>
  <div class="rect3"></div>
  <div class="rect4"></div>
  <div class="rect5"></div>
</div>
  `,
  toString() {
    return this.html
  },
  getSpinner() {
    const div = document.getElementById('loading') as HTMLDivElement
    if (!div) {
      throw new Error('loading spinner method called, but no loading spinner found')
    }
    return div
  },
  show() {
    this.getSpinner().classList.remove('hidden')
  },
  hide() {
    this.getSpinner().classList.add('hidden')
  },
}
