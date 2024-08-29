import AudioService from '../audio-service'

export function setupKickButton(element: HTMLButtonElement) {
  const setup = async () => {
    // AudioContext setup must occurr in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.

    const audioService = AudioService.instance
    const kick = audioService.createOscillator('kick')
    kick.onPlayRamp('frequency').from(150).to(0.01).in(0.1)
    kick.onPlayRamp('gain').from(1).to(0.01).in(0.1)

    // This plays the note upon first user interaction
    kick.play()

    // remove the setup listener
    element.removeEventListener('click', setup)

    // add a listener to play the note again when the button is clicked for the rest of the document's life
    element.addEventListener('click', () => {
      kick.play()
    })
  }

  element.addEventListener('click', setup)
}
