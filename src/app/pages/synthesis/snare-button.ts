import { audio, createOscillator, createWhiteNoise } from '@/index'
import { LayeredSound } from '@/layered-sound'

function createSnareOscillator() {
  const snare = createOscillator()
  snare.onPlayRamp('frequency').from(100).to(60).in(0.1)
  snare.onPlayRamp('gain').from(1).to(0.01).in(0.1)
  return snare
}

function createSnareNoise() {
  const noise = createWhiteNoise()
  noise.onPlayRamp('gain').from(1).to(0.001).in(0.1)
  return noise
}

export function setupSnareButton(element: HTMLButtonElement) {
  async function setup() {
    element.classList.add('loading')

    // AudioContext setup must occur in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    await audio.init()

    element.classList.remove('loading')

    const osc = createSnareOscillator()
    const noise = createSnareNoise()
    const snare = new LayeredSound([noise, osc])

    // This plays the note upon first user interaction
    snare.playFor(0.1)

    // remove the setup listener
    element.removeEventListener('click', setup)

    // add a listener to play the note again when the button is clicked for the rest of the document's life
    element.addEventListener('click', () => snare.playFor(0.1))
  }

  element.addEventListener('click', setup)
}

export function setupSnareCrackButton(element: HTMLButtonElement) {
  async function setup() {
    element.classList.add('loading')
    // AudioContext setup must occur in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    await audio.init()
    element.classList.remove('loading')

    const snareCrack = createSnareNoise()

    // This plays the note upon first user interaction
    snareCrack.playFor(0.1)

    // remove the setup listener
    element.removeEventListener('click', setup)

    // add a listener to play the note again when the button is clicked for the rest of the document's life
    element.addEventListener('click', () => snareCrack.playFor(0.1))
  }

  element.addEventListener('click', setup)
}

export function setupSnareMeatButton(element: HTMLButtonElement) {
  async function setup() {
    element.classList.add('loading')
    // AudioContext setup must occur in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    await audio.init()
    element.classList.remove('loading')

    const snareMeat = createSnareOscillator()

    // This plays the note upon first user interaction
    snareMeat.playFor(0.1)

    // remove the setup listener
    element.removeEventListener('click', setup)

    // add a listener to play the note again when the button is clicked for the rest of the document's life
    element.addEventListener('click', () => snareMeat.playFor(0.1))
  }

  element.addEventListener('click', setup)
}
