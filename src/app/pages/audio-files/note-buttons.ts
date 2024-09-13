import { audio, createSound } from '@/index'

const url = 'https://raw.githubusercontent.com/mudcube/MIDI.js/master/examples/soundfont/acoustic_grand_piano-mp3/B5.mp3'

export function setupNoteButton(element: HTMLButtonElement, direction: 'right' | 'left' | 'both'): void {
  async function setup(): Promise<void> {
    // AudioContext setup must occur in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    await audio.init()
    const leftNote = await createSound('Eb5.mp3')
    const rightNote = await createSound(url)

    leftNote.changePanTo(-0.7)
    rightNote.changePanTo(0.7)

    if (direction === 'left' && leftNote) {
      // remove the setup listener
      element.removeEventListener('click', setup)

      leftNote.play()

      // add a listener to play the note again when the button is clicked for the rest of the document's life
      element.addEventListener('click', () => {
        leftNote.play()
      })
    }
    else if (direction === 'right' && rightNote) {
      // remove the setup listener
      element.removeEventListener('click', setup)

      rightNote.play()

      // add a listener to play the note again when the button is clicked for the rest of the document's life
      element.addEventListener('click', () => {
        rightNote.play()
      })
    }
    else if (direction === 'both' && leftNote && rightNote) {
      // remove the setup listener
      element.removeEventListener('click', setup)
      leftNote.play()
      rightNote.play()
      // add a listener to play the note again when the button is clicked for the rest of the document's life
      element.addEventListener('click', () => {
        leftNote.play()
        rightNote.play()
      })
    }
  }

  element.addEventListener('click', setup)
}
