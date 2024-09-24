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
    return document.getElementById('loading')! as HTMLDivElement
  },
  show() {
    this.getSpinner().classList.remove('hidden')
  },
  hide() {
    this.getSpinner().classList.add('hidden')
  },
}
