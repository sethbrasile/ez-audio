import { createNotes, getAudioContext, initAudio } from '@/index'
import { MusicallyAware } from '@/musical-identity'
import { Oscillator } from '@/oscillator'
import type { Note } from '@/note'

// Define a new class that mixes the MusicallyAware mixin with the Oscillator class
class MusicallyAwareOscillator extends MusicallyAware(Oscillator) {}
const notes = createNotes().slice(48, 60)
const keys = new Map<Note, HTMLLIElement>()

export async function setupPiano(element: HTMLOListElement): Promise<void> {
  async function setup(e: MouseEvent): Promise<void> {
    // AudioContext setup must occur in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    await initAudio()
    // create an array of all the piano notes in western musical notation
    // then slicing just so the whole keyboard doesn't show up on the screen
    // Create a MusicallyAwareOscillator instance for each note in slicedNotes
    keys.forEach((key, note) => {
      const osc = new MusicallyAwareOscillator(getAudioContext(), {
        frequency: note.frequency,
        type: 'square',
        // oscillators are pretty loud so turn it down
        gain: 0.2,
      })

      key.addEventListener('touchstart', () => osc.play())
      key.addEventListener('touchend', () => osc.stop())
      key.addEventListener('mousedown', () => osc.play())
      key.addEventListener('mouseup', () => osc.stop())

      key.removeEventListener('click', setup)

      // @ts-expect-error typescript doesn't know shit about HTML events
      if (note.identifier === e.target?.textContent) {
        osc.playFor(0.1)
      }
    })
  }

  notes.forEach((note) => {
    const key = document.createElement('li')
    key.classList.add('key')
    key.textContent = note.identifier
    if (note.accidental) {
      key.classList.add('black')
    }

    keys.set(note, key)
    element.appendChild(key)

    key.addEventListener('click', setup)
  })
}
