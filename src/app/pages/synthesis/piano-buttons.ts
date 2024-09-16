import { createNotes, createOscillator, initAudio } from '@/index'
import type { Note } from '@/note'

export async function setupPiano(element: HTMLOListElement): Promise<void> {
  // create an array of all the piano notes in western musical notation
  // then slicing just so the whole keyboard doesn't show up on the screen
  // Note objects contain musical identity information like frequency
  const notes = createNotes().slice(48, 60)
  // We need to map each note to an <li>
  const keys = new Map<Note, HTMLLIElement>()

  // for each note create an <li> and map it to
  notes.forEach((note) => {
    // create an li
    const key = document.createElement('li')

    // format markup
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
