import { Oscillator } from '@/oscillator'
import { Sound } from '@/sound'
// TODO: naming collision OscillatorOptions
import type { OscillatorOptions } from '@/oscillator'

let audioContext: AudioContext

export const audio = {
  async init() {
    if (!audioContext) {
      audioContext = new AudioContext()
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }
  },

  getContext() {
    return audioContext
  },
}

export async function loadSound(url: string) {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  return new Sound(audioContext, audioBuffer)
}

export function createOscillator(options?: OscillatorOptions) {
  return new Oscillator(audioContext, options)
}

export function createWhiteNoise() {
  const bufferSize = audioContext.sampleRate
  const audioBuffer = audioContext.createBuffer(1, bufferSize, bufferSize)
  const output = audioBuffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1
  }

  return new Sound(audioContext, audioBuffer)
}
