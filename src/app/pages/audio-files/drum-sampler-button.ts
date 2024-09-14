import { getSamplesPaths } from '@app/utils'
import { createSampler, initAudio } from '@/index'

export function setupDrumSamplerButton(element: HTMLButtonElement, drumType: 'hihat' | 'snare' | 'kick'): void {
  async function setup(): Promise<void> {
    element.classList.add('loading')

    // AudioContext setup must occur in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    await initAudio()

    element.classList.remove('loading')

    const drum = await createSampler(getSamplesPaths(drumType))

    // This plays the note upon first user interaction
    drum.play()

    // remove the setup listener
    element.removeEventListener('click', setup)

    // add a listener to play the note again when the button is clicked for the rest of the document's life
    element.addEventListener('click', () => drum.play())
  }

  element.addEventListener('click', setup)
}
