import { Sampler } from '@/sampler'
import { Oscillator } from '@/oscillator'
import { Sound } from '@/sound'
import { Track } from '@/track'
// TODO: naming collision OscillatorOptions
import type { OscillatorOptions } from '@/oscillator'

const CONTEXT_NOT_EXIST_ERROR = new Error('The audio context does not exist yet! You must call `audio.init()` in response to a user interaction before performing this action.')
let audioContext: AudioContext
function throwIfContextNotExist() {
  if (!audioContext) {
    throw CONTEXT_NOT_EXIST_ERROR
  }
}

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
    throwIfContextNotExist()
    return audioContext
  },
}

export async function createSound(url: string) {
  throwIfContextNotExist()
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  return new Sound(audioContext, audioBuffer)
}

export async function createTrack(url: string) {
  throwIfContextNotExist()
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  return new Track(audioContext, audioBuffer)
}

export async function createSampler(urls: string[]) {
  throwIfContextNotExist()
  const sounds = await Promise.all(urls.map(async url => createSound(url)))
  return new Sampler(sounds)
}

export function createOscillator(options?: OscillatorOptions) {
  throwIfContextNotExist()
  return new Oscillator(audioContext, options)
}

export function createWhiteNoise() {
  throwIfContextNotExist()
  const bufferSize = audioContext.sampleRate
  const audioBuffer = audioContext.createBuffer(1, bufferSize, bufferSize)
  const output = audioBuffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1
  }

  return new Sound(audioContext, audioBuffer)
}
