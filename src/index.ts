import { Font } from './font'
import { base64ToUint8, mungeSoundFont } from './utils/decode-base64'
import { SampledNote } from './sampled-note'
import type { AcceptableNote } from './musical-identity'
import { sortNotes } from './utils/note-methods'
import { Sampler } from '@/sampler'
import { Oscillator } from '@/oscillator'
import { Sound } from '@/sound'
import { Track } from '@/track'
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
  const keyValuePairs = await extractDecodedKeyValuePairs(audioData)
  const notes = createNoteObjectsForFont(keyValuePairs)
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

/**
 * Takes an array of base64 encoded strings (notes) and returns an array of
 * arrays like [[name, audio], [name, audio]]
 *
 * @method extractDecodedKeyValuePairs
 * @param notes Array of base64 encoded strings.
 * @return Returns an Array of tuples. Each tuple looks like
 * `[noteName, decodedAudio]`
 */
function extractDecodedKeyValuePairs(notes: string[]) {
  throwIfContextNotExist()
  const ctx = audioContext
  const promises = []

  async function decodeNote(noteName: string, buffer: ArrayBuffer) {
    // Get web audio api audio data from array buffer
    const decodedNote = await ctx.decodeAudioData(buffer)
    return [noteName, decodedNote]
  }

  for (const noteName in notes) {
    if (Object.prototype.hasOwnProperty.call(notes, noteName)) {
      // Transform base64 note value to Uint8Array
      const noteValue = base64ToUint8(notes[noteName])
      promises.push(decodeNote(noteName, noteValue.buffer))
    }
  }

  // Wait for array of promises to resolve before continuing
  return Promise.all(promises) as Promise<[AcceptableNote, AudioBuffer][]>
}

/**
 * Takes an array of arrays, each inner array acting as
 * a key-value pair in the form `[noteName, audioData]`. Each inner array is
 * transformed into a {{#crossLink "Note"}}{{/crossLink}} and the outer array
 * is returned. This method also sets each note on it's corresponding
 * instrument {{#crossLink "Map"}}{{/crossLink}} instance by name. Each note
 * is playable as seen in the example.
 *
 * @example
 *     audioService.getFont('font-name').play('Ab5');
 *
 * @method createNoteObjectsForFont
 * @param audioData Array of tuples, each tuple like
 * `[noteName, audioData]`.
 * @return Returns an Array of {{#crossLink "Note"}}Notes{{/crossLink}}
 */
function createNoteObjectsForFont(audioData: [AcceptableNote, AudioBuffer][]) {
  throwIfContextNotExist()
  const notes = audioData.map((note) => {
    const [identifier, audioBuffer] = note
    const sampledNote = new SampledNote(audioContext, audioBuffer)
    sampledNote.identifier = identifier
    return sampledNote
  })

  return sortNotes(notes)
}
