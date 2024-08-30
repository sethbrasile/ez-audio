import { setupPlayButton } from '@app/play-button.ts'
import { codeBlock } from '../utils'

const codeExample = `
import { AudioService } from 'ez-audio'
const audioService = await AudioService.init()
const note = await audioService.load('Eb5.mp3').asSound()
note.play()
`

const Index = {
  setup() {
    setupPlayButton(document.querySelector<HTMLButtonElement>('#play')!)
  },
  html: `
<h1>EZ Audio</h1>
<h2 class="read-the-docs">
    Making the web audio API super EZ since 2016
</h2>
<p class="read-the-docs">(This is a work in progress! EZ Audio was originally "Ember Audio" and it was developed before vue and react rose to prominence. 
This is a full rewrite  in vanilla typescript that exposes a similar API to "Ember Audio".)</p>
<p>EZ Audio provides an audio services and various classes and composable functions to make working with the web audio API super EZ.</p>
<p>EZ Audio aims to simplify sampling, triggering, routing, scheduling, synthesizing, soundfonts, and working with audio in general.</p>

<button id="play" type="button">Play</button>

${codeBlock(codeExample)}
`,
}
export default Index
