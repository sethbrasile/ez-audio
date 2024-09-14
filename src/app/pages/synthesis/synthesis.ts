import { codeBlock, htmlBlock, inlineCode } from '../../utils'
import nav from './nav'
import { setupPiano } from './piano-buttons'

const Content = {
  setup() {
    const keys = document.querySelector<HTMLOListElement>('#keys')
    setupPiano(keys!)
  },
  html: `

${nav}

<h1>Play a Synthesizer</h1>

<div id="piano">
  <ol id="keys"></ol>
</div>

<div>
  <p>
    This is a great example of the use of EZ-Audio's ${inlineCode('MusicallyAware')} mixin.
  </pre>

  <p>
    In order to create oscillators that have a "musical identity" (as in, each
    oscillator represents a "note" that can be played), we will add the
    <code>MusicalIdentity</code> mixin to the <code>Oscillator</code> class:
  </p>
</div>


${codeBlock(`
import type { OscillatorOpts } from 'ez-audio'
import { MusicallyAware, Oscillator, initAudio } from 'ez-audio'

// Mix together MusicallyAware mixin and Oscillator class and extend to create new class
class MusicallyAwareOscillator extends MusicallyAware(Oscillator) {}

// in response to user interaction
await initAudio()

const osc = new MusicallyAwareOscillator(getAudioContext(), { frequency: 415.3 })
console.log(osc.frequency) // logs 'Ab4'
`)}

<div>
  <p>By passing it a frequency (as long as it corresponds to a western musical note), all of it's other properties are calculated for us.</p>
  <p>The inverse is also true:</p>
</div>

${codeBlock(`
const osc = new MusicallyAwareOscillator(getAudioContext(), { identifier: 'Ab4' });
console.log(osc.frequency); // logs '415.3'
`)}

<div>
  <p>So now that we understand how our new class works, let's create a synthesizer and a keyboard:</p>
</div>

${codeBlock(`
// Init audio context in response to user interaction
await initAudio()

// create a slice of all the piano notes in western musical notation.
// then slicing just so the whole keyboard doesn't show up on the screen
const notes = createNotes().slice(48, 60)

// Create a MusicallyAwareOscillator instance for each note in slicedNotes
// we're only using these note objects to populate our keyboard,
// a list of frequencies from frequencyMap or any other source would work just as well
const oscillators = notes.map(note => new MusicallyAwareOscillator(getAudioContext(), {
  frequency: note.frequency,
  type: 'square',

  // oscillators are pretty loud so turn it down
  gain: 0.2,
}))
`)}

<div>
  <p>Now we can simply call ${inlineCode('play()')} and ${inlineCode('stop()')} on these oscillators to play them.</p>
  <p>Let's create a keyboard from these oscillators and map each button press/release to the appropriate method:</p>
</div>

${htmlBlock(`
<div id="piano">
  <ol id="keys"></ol>
</div>
`)}

${codeBlock(`
const keys = document.querySelector<HTMLOListElement>('#keys')

// for each oscillator we created
oscillators.forEach((osc) => {
  // create a list item
  const key = document.createElement('li')
  key.classList.add('key')
  key.textContent = osc.identifier

  // mark if it's an accidental (a black key)
  if (osc.accidental) {
    key.classList.add('black')
  }

  // attach some play/stop event listeners
  key.addEventListener('touchstart', () => osc.play())
  key.addEventListener('touchend', () => osc.stop())
  key.addEventListener('mousedown', () => osc.play())
  key.addEventListener('mouseup', () => osc.stop())

  // attach the key to the keyboard
  element.appendChild(key)
})
`)}
`,
}

export default Content
