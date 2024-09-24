import { inlineCode } from '@/app/utils'
import { initAudio } from '@/index'

export default {
  setup() {
    initAudio().then(() => document.querySelector<HTMLDivElement>('#init-banner')!.classList.add('hidden'))

    // TODO: the button literally doesn't even need to do anything. If the user clicks ANY button, the audiocontext is allowed to start.
    const initButton = document.querySelector<HTMLButtonElement>('#init-button')!
    function init(): void {
      initAudio()
      initButton.removeEventListener('click', init)
    }

    initButton.addEventListener('click', init)
  },
  html: `
<div id="init-banner" class="alert warning">
  <h3>${inlineCode('AudioContext')} Not Started!</h3>
  <p>This example uses the "obtain permission" method of starting the browser's ${inlineCode('AudioContext')}</p>
  <p>You can read more about starting the ${inlineCode('AudioContext')} <a href="/ez-web-audio/starting-audiocontext">HERE</a>

  <div><button id="init-button">Initialize AudioContext</button></div>
</div>
`,

  toString() {
    return this.html
  },
}
