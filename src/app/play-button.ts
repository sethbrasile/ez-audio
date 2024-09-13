import { audio, createSound } from '@/index'

export function setupPlayButton(element: HTMLButtonElement): void {
  const setup = async (): Promise<void> => {
    // AudioContext setup must occur in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    await audio.init()
    const note = await createSound('Eb5.mp3')

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

  // The below version (from the docs) works just as well, the above is just trying to reduce the work needed upon playback.
  // I don't know if it actually improves performance or not... have not benchmarked
  // async function playSound() {
  //   // 1. Initialize the audio context
  //   await audio.init()
  //   // 2. Load a sound from a URL
  //   const note = await createSound('Eb5.mp3')
  //   // 3. Play the sound
  //   note.play()
  // }

  // element.addEventListener('click', playSound)
}
