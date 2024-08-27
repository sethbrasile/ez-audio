import AudioService from '../audio-service'
import { LayeredSound } from '@/layered-sound'

export function setupSnareButton(element: HTMLButtonElement) {
  const setup = async () => {
    // AudioContext setup must occurr in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    const audioService = AudioService.instance

    function createSnareOscillator() {
      const snare = audioService.createOscillator('snare')
      const osc = snare.getConnection('audioSource')
      const gain = snare.getConnection('gain')
      osc.onPlayRamp('frequency').from(100).to(60).in(0.1)
      gain.onPlayRamp('gain').from(1).to(0.01).in(0.1)
      return snare
    }

    function createSnareNoise() {
      const noise = audioService.createWhiteNoise()
      const gain = noise.getConnection('gain')
      gain.onPlayRamp('gain').from(1).to(0.001).in(0.1)
      return noise
    }

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
