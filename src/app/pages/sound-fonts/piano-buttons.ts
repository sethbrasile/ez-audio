import { createFont, initAudio } from '@/index'
import type { Note } from '@/note'

export async function setupPiano(element: HTMLOListElement): Promise<void> {
  element.classList.add('loading')
  // AudioContext setup must occur in response to user interaction, so this is why we do setup in click handler
  // then remove the listener.
  await initAudio()
  // piano.js is a soundfont created with MIDI.js' Ruby-based soundfont converter
  const piano = await createFont('/ez-audio/piano.js')
  // Slicing just so the whole keyboard doesn't show up on the screen
  const notes = piano.notes.slice(39, 51)
  element.classList.remove('loading')

  notes.forEach((note: Note) => {
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
}
