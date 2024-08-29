import AudioService from '../audio-service'
import { createSnareNoise, createSnareOscillator } from './create-oscillators'
import { LayeredSound } from '@/layered-sound'

export function setupSnareButton(element: HTMLButtonElement) {
  const setup = async () => {
    element.classList.add('loading')

    // AudioContext setup must occurr in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    await AudioService.init()

    element.classList.remove('loading')

    function playSnare() {
      const osc = createSnareOscillator()
      const noise = createSnareNoise()
      const snare = new LayeredSound([noise, osc])
      snare.play()
    }

    // This plays the note upon first user interaction
    playSnare()

    // remove the setup listener
    element.removeEventListener('click', setup)

    // add a listener to play the note again when the button is clicked for the rest of the document's life
    element.addEventListener('click', () => {
      playSnare()
    })
  }

  element.addEventListener('click', setup)
}
