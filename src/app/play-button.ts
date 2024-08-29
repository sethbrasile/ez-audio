import AudioService from '../audio-service'

export function setupPlayButton(element: HTMLButtonElement) {
  const setup = async () => {
    // AudioContext setup must occurr in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    const audioService = AudioService.instance
    const note = await audioService.load('Eb5.mp3').asSound()

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
