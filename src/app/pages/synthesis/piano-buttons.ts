import { createNotes, getAudioContext, initAudio } from '@/index'
import { MusicallyAware } from '@/musical-identity'
import type { Note } from '@/note'
import { Oscillator } from '@/oscillator'

// Define a new class that mixes the MusicallyAware mixin with the Oscillator class
class MusicallyAwareOscillator extends MusicallyAware(Oscillator) {}

export async function setupPiano(element: HTMLOListElement): Promise<void> {
  element.classList.add('loading')
  // AudioContext setup must occur in response to user interaction, so this is why we do setup in click handler
  // then remove the listener.
  await initAudio()
  // create a slice of all the piano notes in western musical notation.
  // slicing just so the whole keyboard doesn't show up on the screen
  const notes = createNotes().slice(48, 60)
  // Create a MusicallyAwareOscillator instance for each note in slicedNotes
  const oscillators = notes.map(note => new MusicallyAwareOscillator(getAudioContext(), {
    frequency: note.frequency,
    type: 'square',
    // oscillators are pretty loud so turn it down
    gain: 0.2,
  }))

  oscillators.forEach((osc) => {
    const key = document.createElement('li')
    key.classList.add('key')
    key.textContent = osc.identifier
    if (osc.accidental) {
      key.classList.add('black')
    }

    key.addEventListener('touchstart', () => osc.play())
    key.addEventListener('touchend', () => osc.stop())
    key.addEventListener('mousedown', () => osc.play())
    key.addEventListener('mouseup', () => osc.stop())

    element.appendChild(key)
  })

  element.classList.remove('loading')
}
