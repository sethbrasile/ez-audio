import { createOscillator, createWhiteNoise } from '@/index'
import { LayeredSound } from '@/layered-sound'
import type { Oscillator } from '@/oscillator'
import type { Sound } from '@/sound'

async function createSnareOscillator(): Promise<Oscillator> {
  const snare = await createOscillator()
  snare.onPlayRamp('frequency').from(100).to(60).in(0.1)
  snare.onPlayRamp('gain').from(1).to(0.01).in(0.1)
  return snare
}

async function createSnareNoise(): Promise<Sound> {
  const noise = await createWhiteNoise()
  noise.onPlayRamp('gain').from(1).to(0.001).in(0.1)
  return noise
}

export async function setupSnareButton(element: HTMLButtonElement): Promise<void> {
  const sounds = await Promise.all([await createSnareOscillator(), await createSnareNoise()])
  const snare = new LayeredSound(sounds)

  // add a listener to play the note again when the button is clicked for the rest of the document's life
  element.addEventListener('click', () => snare.playFor(0.1))
}

export async function setupSnareCrackButton(element: HTMLButtonElement): Promise<void> {
  const snareCrack = await createSnareNoise()
  element.addEventListener('click', () => snareCrack.playFor(0.1))
}

export async function setupSnareMeatButton(element: HTMLButtonElement): Promise<void> {
  const snareMeat = await createSnareOscillator()
  element.addEventListener('click', () => snareMeat.playFor(0.1))
}
