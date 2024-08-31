import { audio, loadSound } from '@/index'

export function setupPlayButton(element: HTMLButtonElement) {
  const setup = async () => {
    // AudioContext setup must occurr in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    await audio.init()
    const note = await loadSound('Eb5.mp3')

    if (note) {
      // remove the setup listener
      element.removeEventListener('click', setup)

      note.play()

      // add a listener to play the note again when the button is clicked for the rest of the document's life
      element.addEventListener('click', () => {
        note.play()
      })
    }
  }

  element.addEventListener('click', setup)
}
