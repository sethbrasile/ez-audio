import { Font } from './font'
import { mungeSoundFont } from './utils/decode-base64'
import { createNoteObjectsForFont, extractDecodedKeyValuePairs, sortNotes } from './utils/note-methods'
import frequencyMap from './utils/frequency-map'
import { Sampler } from '@/sampler'
import { Oscillator } from '@/oscillator'
import { Sound } from '@/sound'
import { Track } from '@/track'
import { Note } from '@/note'
import type { OscillatorOpts } from '@/oscillator'

let audioContext: AudioContext
function throwIfContextNotExist() {
  if (!audioContext) {
    throw new Error('The audio context does not exist yet! You must call `audio.init()` in response to a user interaction before performing this action.')
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

export function createNotes(json?: any): Note[] {
  const notes = []
  if (!json) {
    json = frequencyMap
  }

  for (const key in json) {
    const note = json[key]
    const noteObject = new Note()
    noteObject.frequency = note
    notes.push(noteObject)
  }
  return notes
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

export function createOscillator(options?: OscillatorOpts) {
  throwIfContextNotExist()
  return new Oscillator(audioContext, options)
}

export async function createFont(url: string) {
  throwIfContextNotExist()
  const response = await fetch(url)
  const text = await response.text()
  const audioData = mungeSoundFont(text)
  const keyValuePairs = await extractDecodedKeyValuePairs(audioContext, audioData)
  const notes = createNoteObjectsForFont(audioContext, keyValuePairs)
  return new Font(notes)
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
