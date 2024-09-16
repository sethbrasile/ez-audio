import type { OscillatorOptsFilterValues } from './oscillator'
import { SampledNote } from './sampled-note'
import type { Connectable } from './interfaces/connectable'
import type { Playable } from './interfaces/playable'
import { Font } from './font'
import { mungeSoundFont } from './utils/decode-base64'
import { createNoteObjectsForFont, extractDecodedKeyValuePairs } from './utils/note-methods'
import frequencyMap from './utils/frequency-map'
import { MusicallyAware } from '@/musical-identity'
import { Sampler } from '@/sampler'
import { Oscillator } from '@/oscillator'
import { Sound } from '@/sound'
import { Track } from '@/track'
import { Note } from '@/note'
import type { OscillatorOpts } from '@/oscillator'

let audioContext: AudioContext
function throwIfContextNotExist(): void {
  if (!audioContext) {
    throw new Error('The audio context does not exist yet! You must call `initAudio()` in response to a user interaction before performing this action.')
  }
}

export async function initAudio(): Promise<void> {
  if (!audioContext) {
    audioContext = new AudioContext()
  }

  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }
}

export function getAudioContext(): AudioContext {
  throwIfContextNotExist()
  return audioContext
}

// Notes do not require AudioContext
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

export async function createSound(url: string): Promise<Sound> {
  throwIfContextNotExist()
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  return new Sound(audioContext, audioBuffer)
}

export async function createTrack(url: string): Promise<Track> {
  throwIfContextNotExist()
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  return new Track(audioContext, audioBuffer)
}

export async function createSampler(urls: string[]): Promise<Sampler> {
  throwIfContextNotExist()
  const sounds = await Promise.all(urls.map(async url => createSound(url)))
  return new Sampler(sounds)
}

export function createOscillator(options?: OscillatorOpts): Oscillator {
  throwIfContextNotExist()
  return new Oscillator(audioContext, options)
}

export async function createFont(url: string): Promise<Font> {
  throwIfContextNotExist()
  const response = await fetch(url)
  const text = await response.text()
  const audioData = mungeSoundFont(text)
  const keyValuePairs = await extractDecodedKeyValuePairs(audioContext, audioData)
  const notes = createNoteObjectsForFont(audioContext, keyValuePairs)
  return new Font(notes)
}

export function createWhiteNoise(): Sound {
  throwIfContextNotExist()
  const bufferSize = audioContext.sampleRate
  const audioBuffer = audioContext.createBuffer(1, bufferSize, bufferSize)
  const output = audioBuffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1
  }

  return new Sound(audioContext, audioBuffer)
}

export {
  Font,
  Note,
  Sound,
  Sampler,
  SampledNote,
  Oscillator,
  Track,
  MusicallyAware,
  frequencyMap,
}

export type {
  Connectable,
  Playable,
  OscillatorOpts,
  OscillatorOptsFilterValues,
}
