import { createOscillator } from '@/index'
import { LayeredSound } from '@/layered-sound'
import type { Oscillator } from '@/oscillator'

async function createHihatOscillator(ratio: number): Promise<Oscillator> {
  const fundamental = 40
  return await createOscillator({
    type: 'square',
    highpass: { frequency: 7000 },
    bandpass: { frequency: 10000 },
    frequency: fundamental * ratio,
  })
}

async function createHihatEnvelope(oscillator: Promise<Oscillator>): Promise<Oscillator> {
  const osc = await oscillator
  osc.onPlayRamp('gain').from(0.00001).to(1).in(0.02)
  osc.onPlaySet('gain').to(0.3).endingAt(0.03)
  osc.onPlaySet('gain').to(0.00001).endingAt(0.3)
  return osc
}

async function createHihat(): Promise<LayeredSound> {
  // http://joesul.li/van/synthesizing-hi-hats/
  const overtones = [2, 3, 4.16, 5.43, 6.79, 8.21]

  const oscillators = await Promise.all(
    overtones
      // Create an oscillator for each overtone
      .map(createHihatOscillator)
      // Shape the envelope for each oscillator
      .map(createHihatEnvelope),
  )

  // Layer them all together
  return new LayeredSound(oscillators)
}

export async function setupHihatButton(element: HTMLButtonElement): Promise<void> {
  const hihat = await createHihat()
  element.addEventListener('click', () => hihat.playFor(0.3))
}
