import { createFont } from '@/index'
import type { Note } from '@/note'

export async function setupPiano(element: HTMLOListElement): Promise<void> {
  // piano.js is a soundfont created with MIDI.js' Ruby-based soundfont converter
  const piano = await createFont('/ez-web-audio/piano.js')
  // Slicing just so the whole keyboard doesn't show up on the screen
  const notes = piano.notes.slice(43, 55)

  notes.forEach((note: Note) => {
    const key = document.createElement('li')

    // Stop "double click" from zooming and etc..
    key.addEventListener('click', () => {})

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
    // key.addEventListener('mousedown', () => {
    //   note.play()
    // })
    // key.addEventListener('mouseup', () => {
    //   note.stop()
    // })
    element.appendChild(key)
  })
}
