import DrumMachine from '../components/drum-machine'
import PermissionBanner from '../components/permission-banner'
import { codeBlock } from '../utils'
import { createSound } from '@/index'

const Content = {
  async setup() {
    PermissionBanner.setup()

    const element = document.querySelector<HTMLButtonElement>('#play')!

    // we can load the mp3 before the user clicks the button
    const noteSoon = createSound('Eb5.mp3')

    async function playSound(): Promise<void> {
      // The Promise from `createSound` resolves to a `Sound` object which has a `play` method.
      const note = await noteSoon
      // Play the sound
      note.play()
    }

    // we must wait for the user to click something before we can play
    element.addEventListener('click', playSound)

    await DrumMachine.setup()
  },
  html: `
<h1>EZ Web Audio</h1>
<h2 class="read-the-docs">
    Making the web audio API super EZ since 2024
</h2>
<p class="read-the-docs">This is a work in progress! EZ Web Audio was originally <a target="_blank" href="https://sethbrasile.github.io/ember-audio/">Ember Audio</a>
which was developed before vue and react rose to prominence.</p>
<p class="read-the-docs">This is a full rewrite  in vanilla typescript that exposes a similar-ish API to Ember Audio.</p>
<p>EZ Web Audio provides classes and composable functions to make working with the web audio API super EZ.</p>
<p>EZ Web Audio aims to simplify sampling, triggering, routing, scheduling, synthesizing, soundfonts, and working with audio in general.</p>
<p>EZ Web Audio handles cases from the super simple...</p>

<button id="play" type="button">Play</button>
${codeBlock(`
  import { createSound } from 'ez-web-audio'

async function playSound() {
  // 1. Load a sound from a URL
  const note = await createSound('Eb5.mp3')
  // 2. Play the sound
  note.play()
}

someButton.addEventListener('click', playSound)
`)}

<p>To honestly still pretty dang simple...</p>
<p>See the code for this one over <a href="/ez-web-audio/#/timing/drum-machine">here</a></p>

${PermissionBanner}
${DrumMachine}


`,
}
export default Content
