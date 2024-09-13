import { audio, createOscillator } from '@/index'
import { LayeredSound } from '@/layered-sound'
import type { Oscillator } from '@/oscillator'

function createHihatOscillator(ratio: number): Oscillator {
  const fundamental = 40

  return createOscillator({
    type: 'square',
    highpass: { frequency: 7000 },
    bandpass: { frequency: 10000 },
    frequency: fundamental * ratio,
  })
}

function createHihatEnvelope(oscillator: Oscillator): Oscillator {
  oscillator.onPlayRamp('gain').from(0.00001).to(1).in(0.02)
  oscillator.onPlaySet('gain').to(0.3).endingAt(0.03)
  oscillator.onPlaySet('gain').to(0.00001).endingAt(0.3)
  return oscillator
}

function createHihat(): LayeredSound {
  // http://joesul.li/van/synthesizing-hi-hats/
  const overtones = [2, 3, 4.16, 5.43, 6.79, 8.21]

  const oscillators = overtones
    // Create an oscillator for each overtone
    .map(createHihatOscillator)

    // Shape the envelope for each oscillator
    .map(createHihatEnvelope)

  // Layer them all together
  return new LayeredSound(oscillators)
}

export function setupHihatButton(element: HTMLButtonElement): void {
  async function setup(): Promise<void> {
    element.classList.add('loading')

    // AudioContext setup must occur in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    await audio.init()

    element.classList.remove('loading')

    const hihat = createHihat()

    // This plays the note upon first user interaction
    hihat.playFor(0.3)

    // remove the setup listener
    element.removeEventListener('click', setup)

    // add a listener to play the note again when the button is clicked for the rest of the document's life
    element.addEventListener('click', () => hihat.playFor(0.3))
  }

  element.addEventListener('click', setup)
}
