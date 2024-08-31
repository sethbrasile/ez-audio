import type Playable from '@interfaces/playable'
import AudioService from '../audio-service'
import { LayeredSound } from '@/layered-sound'

function createHihatOscillator(ratio: number) {
  const audioService = AudioService.instance
  const fundamental = 40

  return audioService.createOscillator('hihat', {
    type: 'square',
    highpass: { frequency: 7000 },
    bandpass: { frequency: 10000 },
    frequency: fundamental * ratio,
  })
}

function createHihatEnvelope(oscillator: Playable) {
  oscillator.onPlayRamp('gain').from(0.00001).to(1).in(0.02)
  oscillator.onPlaySet('gain').to(0.3).endingAt(0.03)
  oscillator.onPlaySet('gain').to(0.00001).endingAt(0.3)
  return oscillator
}

function playHihat() {
  // http://joesul.li/van/synthesizing-hi-hats/
  const overtones = [2, 3, 4.16, 5.43, 6.79, 8.21]

  const oscillators = overtones
    // Create an oscillator for each overtone
    .map(createHihatOscillator)

    // Shape the envelope for each oscillator
    .map(createHihatEnvelope)

  // Layer them all together
  const hihat = new LayeredSound(oscillators)
  hihat.playFor(0.3)
}

export function setupHihatButton(element: HTMLButtonElement) {
  const setup = async () => {
    element.classList.add('loading')

    // AudioContext setup must occurr in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    await AudioService.init()

    element.classList.remove('loading')

    // This plays the note upon first user interaction
    playHihat()

    // remove the setup listener
    element.removeEventListener('click', setup)

    // add a listener to play the note again when the button is clicked for the rest of the document's life
    element.addEventListener('click', () => {
      playHihat()
    })
  }

  element.addEventListener('click', setup)
}
