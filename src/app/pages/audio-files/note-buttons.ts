import { createSound } from '@/index'

const url = 'https://raw.githubusercontent.com/mudcube/MIDI.js/master/examples/soundfont/acoustic_grand_piano-mp3/B5.mp3'

export async function setupNoteButton(element: HTMLButtonElement, direction: 'right' | 'left' | 'both'): Promise<void> {
  const leftNote = await createSound('Eb5.mp3')
  const rightNote = await createSound(url)

  leftNote.changePanTo(-0.7)
  rightNote.changePanTo(0.7)

  if (direction === 'left' && leftNote) {
    element.addEventListener('click', () => {
      leftNote.play()
    })
  }
  else if (direction === 'right' && rightNote) {
    element.addEventListener('click', () => {
      rightNote.play()
    })
  }
  else if (direction === 'both' && leftNote && rightNote) {
    element.addEventListener('click', () => {
      leftNote.play()
      rightNote.play()
    })
  }
}
