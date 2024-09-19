import { createNotes, createOscillator } from '@/index'
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
  })

  keys.forEach(async (key, note) => {
    // Create the oscillator for this key and set its frequency from the corresponding note
    const osc = await createOscillator({
      frequency: note.frequency,
      type: 'square',
      // oscillators are pretty loud so turn it down
      gain: 0.2,
    })

    key.addEventListener('touchstart', () => osc.play())
    key.addEventListener('touchend', () => osc.stop())
    key.addEventListener('mousedown', () => osc.play())
    key.addEventListener('mouseup', () => osc.stop())
  })
}
