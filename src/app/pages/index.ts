import { setupPlayButton } from '@app/play-button.ts'
import { codeBlock } from '../utils'

const codeExample = `
import { audio, loadSound } from 'ez-audio'
await audio.init()
const note = await loadSound('Eb5.mp3')
note.play()
`

const Index = {
  setup() {
    setupPlayButton(document.querySelector<HTMLButtonElement>('#play')!)
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

<button id="play" type="button">Play</button>

${codeBlock(codeExample)}
`,
}
export default Index
