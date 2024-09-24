import DrumMachine from '../components/drum-machine'
import LoadingSpinner from '../components/loading-spinner'
import PermissionBanner from '../components/permission-banner'
import { codeBlock } from '../utils'
import { createSound } from '@/index'

const url = 'Eb5.mp3'

const Content = {
  async setup() {
    LoadingSpinner.show()
    PermissionBanner.setup()

    const element = document.querySelector<HTMLButtonElement>('#play')!

    createSound(url)

    async function play(): Promise<void> {
      const note = await createSound(url)
      note.play()
    }

    element.addEventListener('click', play)

    await DrumMachine.setup()
    LoadingSpinner.hide()
  },
  html: `
<h1>EZ Audio</h1>
<h2 class="read-the-docs">
    Making the web audio API super EZ since 2024
</h2>
<p class="read-the-docs">This is a work in progress! EZ Audio was originally <a target="_blank" href="https://sethbrasile.github.io/ember-audio/">Ember Audio</a>
which was developed before vue and react rose to prominence.</p>
<p class="read-the-docs">This is a full rewrite  in vanilla typescript that exposes a similar-ish API to Ember Audio.</p>
<p>EZ Audio provides classes and composable functions to make working with the web audio API super EZ.</p>
<p>EZ Audio aims to simplify sampling, triggering, routing, scheduling, synthesizing, soundfonts, and working with audio in general.</p>
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

${LoadingSpinner}
${PermissionBanner}
${DrumMachine}

`,
}
export default Content
