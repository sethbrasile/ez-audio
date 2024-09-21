import { createSound, initAudio } from '@/index'

const name = 'Eb5.mp3'

export function setupPlayButton(element: HTMLButtonElement): void {
  createSound(name)

  const setup = async (): Promise<void> => {
    // AudioContext setup must occur in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    await initAudio()

    const note = await createSound(name)

    // remove the setup listener
    element.removeEventListener('click', setup)

    // add a listener to play the note again when the button is clicked for the rest of the document's life
    element.addEventListener('click', async () => {
      note.play()
    })
  }

  element.addEventListener('click', setup)
}
