import { codeBlock, htmlBlock, inlineCode } from '../../utils'
import nav from './nav'
import { createNotes, createOscillator, initAudio, preventEventDefaults, useInteractionMethods } from '@/index'

const Content = {
  async setup() {
    nav.setup()

    const keyboard = document.getElementById('keyboard')!

    // we don't want dragging around on the keyboard to move the page around
    preventEventDefaults(keyboard)

    // create an array of all the piano notes in western musical notation
    // then slicing just so the whole keyboard doesn't show up on the screen
    // Note objects contain musical identity information like frequency
    const notes = createNotes().slice(48, 60)

    notes.forEach(async (note) => {
      // for each note create an <li>
      const key = document.createElement('li')

      // format markup
      key.classList.add('key')
      key.textContent = note.identifier
      if (note.accidental) {
        key.classList.add('black')
      }

      // Add it to the DOM
      keyboard.appendChild(key)

      // We can't create the oscillator until the user interacts with the page, so wait for that
      await initAudio()

      // Create the oscillator for this key and set its frequency from the corresponding note
      const osc = await createOscillator({
        frequency: note.frequency,
        type: 'square',
        // oscillators are pretty loud so turn it down
        gain: 0.2,
      })

      useInteractionMethods(key, osc)
    })
  },
  html: `

${nav}

<h1>Play a Synthesizer</h1>

<div id="piano">
  <ol id="keyboard"></ol>
</div>

<div class="docs">
  <p>Let's create a keyboard/synthesizer!</p>
  <p>Start with an ${inlineCode('<ol>')}</p>

${htmlBlock(`
<div id="piano">
  <ol id="keyboard"></ol>
</div>
`)}

<p>Then create some ${inlineCode('Note')} objects which correspond to musical notes.
We will store the note objects in a ${inlineCode('Map')} that ties note objects and
${inlineCode('<li>')}'s (keys) together.</p>

<p>We can't head straight into creating oscillators since the Web Audio API requires a user interaction
to occur before we're allowed to interact with it.</p>

<p>${inlineCode('Note')} objects have no functionality except for musical identity. They do not interact
with the Web Audio API's ${inlineCode('AudioContext')}, so we're safe to create them before a user interaction
occurs.</p>

${codeBlock(`
import { createNotes, createOscillator, initAudio, useInteractionMethods } from 'ez-web-audio'

// createNotes creates an array of all the notes in western musical notation as Note objects
// (then slicing so the keyboard isn't huge)
// Note objects contain musical identity information like frequency
const notes = createNotes().slice(48, 60)
`)}

<We>Now we can create a "key" (an ${inlineCode('<li>')} element) for each note and add them to the keyboard.</p>

${codeBlock(`
notes.forEach(async (note) => {
  // for each note create an <li>
  const key = document.createElement('li')

  // format markup
  key.classList.add('key')
  key.textContent = note.identifier
  if (note.accidental) {
    key.classList.add('black')
  }

  // we don't want dragging around on the keyboard to move the page around
  key.addEventListener('touchmove', (touch) => {
    touch.preventDefault()
  })

  // Add it to the DOM
  piano.appendChild(key)

  // We can't create the oscillator until the user interacts with the page, so wait for that
  await initAudio()

  // Create the oscillator for this key and set its frequency from the corresponding note
  const osc = await createOscillator({
    frequency: note.frequency,
    type: 'square',
    // oscillators are pretty loud so turn it down
    gain: 0.2,
  })

  // userInteractionMethods is a helper method that sets up all the touch/mouse events
  // corresponding to play/stop for us.
  useInteractionMethods(key, osc)
})
`)}

<Let>In the ${inlineCode('setup')} method, because it's triggered by a user interaction,
we're allowed to interact with the Web Audio API.</p>

<p>After we initialize the ${inlineCode('AudioContext')} via ${inlineCode('initAudio')},
we can create an ${inlineCode('Oscillator')} instance for each key
and map the key's touch/mouse events to the oscillator's play/stop methods.</p>

<p>We will also immediately start playing the specific oscillator that was initially pressed so that the first key
press creates a sound.</p>

${codeBlock(`
import { initAudio, createOscillator } from 'ez-web-audio'

async function setup(e: MouseEvent | TouchEvent): Promise<void> {
  // First key is pressed...
  // AudioContext setup
  await initAudio()

  // Now that audio context is initialized, we can create an oscillator for each key
  keys.forEach((key, note) => {
    // Create the oscillator for this key and set its frequency from the corresponding note
    const osc = createOscillator({
      frequency: note.frequency,
      type: 'square',
      // oscillators are pretty loud so turn it down
      gain: 0.2,
    })

    key.addEventListener('touchstart', () => osc.play())
    key.addEventListener('touchend', () => osc.stop())
    key.addEventListener('mousedown', () => osc.play())
    key.addEventListener('mouseup', () => osc.stop())

    // We are done setting up now, so remove the setup event listeners
    key.removeEventListener('mousedown', setup)
    key.removeEventListener('touchstart', setup)

    // If this iteration (remember we're currently in a loop, per key)
    // corresponds to the key that was pressed
    if (e.target === key) {
      // then start playing this oscillator
      osc.play()
    }
  })
}
`)}

</div>

<hr />

<div class="docs">
  <p>Here is the full code for this example:</p>

${htmlBlock(`
<div id="piano">
  <ol id="keys"></ol>
</div>
`)}

${codeBlock(`
import { createNotes, createOscillator, initAudio } from 'ez-web-audio'
import type { Note } from 'ez-web-audio'

setupPiano(document.querySelector<HTMLOListElement>('#keys')!)

async function setupPiano(element: HTMLOListElement): Promise<void> {
  // create an array of all the piano notes in western musical notation
  // then slicing just so the whole keyboard doesn't show up on the screen
  // Note objects contain musical identity information like frequency
  const notes = createNotes().slice(48, 60)
  // We need to map each note to an <li>
  const keys = new Map<Note, HTMLLIElement>()

  // for each note
  notes.forEach((note) => {
    // create an li
    const key = document.createElement('li')

    // format markup on that li
    key.classList.add('key')
    key.textContent = note.identifier
    if (note.accidental) {
      key.classList.add('black')
    }

    // Add it to the DOM
    element.appendChild(key)

    // put the key/note pair into the keys Map
    keys.set(note, key)

    // add the setup listener so that each key can trigger audio context init
    key.addEventListener('mousedown', setup)
    key.addEventListener('touchstart', setup)
  })

  async function setup(e: MouseEvent | TouchEvent): Promise<void> {
    // First key is pressed...
    // AudioContext setup
    await initAudio()

    // Now that audio context is initialized, we can create an oscillator for each key
    keys.forEach((key, note) => {
      // Create the oscillator for this key and set its frequency from the corresponding note
      const osc = createOscillator({
        frequency: note.frequency,
        type: 'square',
        // oscillators are pretty loud so turn it down
        gain: 0.2,
      })

      key.addEventListener('touchstart', () => osc.play())
      key.addEventListener('touchend', () => osc.stop())
      key.addEventListener('mousedown', () => osc.play())
      key.addEventListener('mouseup', () => osc.stop())

      key.removeEventListener('mousedown', setup)
      key.removeEventListener('touchstart', setup)

      // If this iteration corresponds to the actual key that was pressed
      if (e.target === key) {
        // then start playing the
        osc.play()
      }
    })
  }
}

`)}

</div>
`,
}

export default Content
