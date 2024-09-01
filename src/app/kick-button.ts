import { audio, createOscillator } from '@/index'

export function setupKickButton(element: HTMLButtonElement) {
  async function setup() {
    // AudioContext setup must occurr in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.

    await audio.init()

    const kick = createOscillator()
    kick.onPlayRamp('frequency').from(150).to(0.01).in(0.1)
    kick.onPlayRamp('gain').from(1).to(0.01).in(0.1)

    // This plays the note upon first user interaction
    kick.playFor(0.1)

    // remove the setup listener
    element.removeEventListener('click', setup)

    // add a listener to play the note again when the button is clicked for the rest of the document's life
    element.addEventListener('click', () => kick.playFor(0.1))
  }

  element.addEventListener('click', setup)
}
