import { audio, createNotes } from '@/index'
import { MusicallyAware } from '@/musical-identity'
import type { Note } from '@/note'
import type { OscillatorOpts } from '@/oscillator'
import { Oscillator } from '@/oscillator'
import { sortNotes } from '@/utils/note-methods'

class MusicallyAwareOscillator extends MusicallyAware(Oscillator) {
  constructor(context: AudioContext, options: OscillatorOpts) {
    super(context, options)
    this.frequency = options.frequency || 0
  }
}

export async function setupPiano(element: HTMLOListElement) {
  element.classList.add('loading')
  // AudioContext setup must occur in response to user interaction, so this is why we do setup in click handler
  // then remove the listener.
  await audio.init()
  // create a slice of all the piano notes in western musical notation.
  // slicing just so the whole keyboard doesn't show up on the screen
  const notes = createNotes().slice(48, 60) as Note[]
  // Create a MusicallyAwareOscillator instance for each note in slicedNotes
  const oscillators = notes.map(note => new MusicallyAwareOscillator(audio.getContext(), {
    frequency: note.frequency,
    type: 'square',
  }))

  oscillators.forEach((note) => {
    const key = document.createElement('li')
    key.classList.add('key')
    if (note.accidental) {
      key.classList.add('black')
    }
    key.textContent = note.identifier
    key.addEventListener('touchstart', () => {
      note.play()
    })
    key.addEventListener('touchend', () => {
      note.stop()
    })
    key.addEventListener('mousedown', () => {
      note.play()
    })
    key.addEventListener('mouseup', () => {
      note.stop()
    })
    element.appendChild(key)
  })

  element.classList.remove('loading')
}
