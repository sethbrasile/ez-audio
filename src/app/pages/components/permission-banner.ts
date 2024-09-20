import { inlineCode } from '@/app/utils'
import { initAudio } from '@/index'

export default {
  setup() {
    initAudio().then(() => document.querySelector<HTMLDivElement>('#init-banner')!.classList.add('hidden'))

    const initButton = document.querySelector<HTMLButtonElement>('#init')!
    function init(): void {
      initAudio()
      initButton.removeEventListener('click', init)
    }

    initButton.addEventListener('click', init)
  },
  html: `
<div id="init-banner" class="alert warning">
  <h3>${inlineCode('AudioContext')} Not Started!</h3>
  <p>This page uses the "obtain permission" method of starting the browser's ${inlineCode('AudioContext')}</p>
  <p>You can read more about starting the ${inlineCode('AudioContext')} <a href="/ez-audio/starting-audiocontext">HERE</a>

  <div><button id="init">Initialize AudioContext</button></div>
</div>
`,

  toString() {
    return this.html
  },
}
