import type { OscillatorOptsFilterValues } from './oscillator'
import { SampledNote } from './sampled-note'
import type { Connectable } from './interfaces/connectable'
import type { Playable } from './interfaces/playable'
import { Font } from './font'
import { mungeSoundFont } from './utils/decode-base64'
import { createNoteObjectsForFont, extractDecodedKeyValuePairs } from './utils/note-methods'
import frequencyMap from './utils/frequency-map'
import type { BeatTrackOptions } from './beat-track'
import { BeatTrack } from './beat-track'
import { Beat } from '@/beat'
import { MusicallyAware } from '@/musical-identity'
import type { SamplerOptions } from '@/sampler'
import { Sampler } from '@/sampler'
import { Oscillator } from '@/oscillator'
import { Sound } from '@/sound'
import { Track } from '@/track'
import { Note } from '@/note'
import type { OscillatorOpts } from '@/oscillator'

const responses = new Map<string, Response>()

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

export async function getAudioContext(): Promise<AudioContext> {
  await initAudio()
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

export function createSound(url: string): Promise<Sound> {
  return load(url, 'sound') as Promise<Sound>
}

export async function createTrack(url: string): Promise<Track> {
  return load(url, 'track') as Promise<Track>
}

export async function createBeatTrack(urls: string[], opts?: BeatTrackOptions): Promise<BeatTrack> {
  const sounds = await Promise.all(urls.map(async url => load(url, 'sound') as Promise<Sound>))
  return new BeatTrack(audioContext, sounds, opts)
}

export async function createSampler(urls: string[], opts?: SamplerOptions): Promise<Sampler> {
  const sounds = await Promise.all(urls.map(async url => load(url, 'sound') as Promise<Sound>))
  await initAudio()
  throwIfContextNotExist()
  return new Sampler(sounds, opts)
}

export async function createOscillator(options?: OscillatorOpts): Promise<Oscillator> {
  return new Oscillator(audioContext, options)
}

export async function createFont(url: string): Promise<Font> {
  const response = await fetch(url)
  const text = await response.text()
  const audioData = mungeSoundFont(text)
  await initAudio()
  throwIfContextNotExist()
  const keyValuePairs = await extractDecodedKeyValuePairs(audioContext, audioData)
  const notes = createNoteObjectsForFont(audioContext, keyValuePairs)
  return new Font(notes)
}

export async function createWhiteNoise(): Promise<Sound> {
  const bufferSize = audioContext.sampleRate
  const audioBuffer = audioContext.createBuffer(1, bufferSize, bufferSize)
  const output = audioBuffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1
  }

  return new Sound(audioContext, audioBuffer)
}

/**
 * Creates an {{#crossLinkModule "Audio"}}Audio Class{{/crossLinkModule}}
 * instance (which is based on which "type" is specified), and passes "props"
 * to the new instance.
 *
 * @private
 * @method createSoundFor
 *
 * @param {string} type The type of
 * {{#crossLinkModule "Audio"}}Audio Class{{/crossLinkModule}} to be created.
 *
 * @param {object} props POJO to pass to the new instance
 */
function createSoundFor(type: 'sound' | 'track' | 'sampler', props: any): Sound | Sampler | Track {
  switch (type) {
    case 'track':
      return new Track(audioContext, props)
    case 'sampler':
      return new Sampler(props)
    default:
      return new Sound(audioContext, props)
  }
}

/**
 * Loads and decodes an audio file, creating a Sound, Track, or BeatTrack
 * instance (as determined by the "type" parameter) and places the instance
 * into it's corresponding register.
 *
 * @private
 * @method _load
 *
 * @param {string} src The URI location of an audio file. Will be used by
 * "fetch" to get the audio file. Can be a local or a relative URL
 *
 * @param {string} type Determines the type of object that should be created,
 * as well as which register the instance should be placed in. Can be 'sound',
 * 'track', or 'beatTrack'.
 */
async function load(src: string, type: 'sound' | 'track' | 'sampler'): Promise<Sound | Sampler | Track> {
  if (responses.has(src)) {
    const res = await responses.get(src)!.clone()
    const buffer = await audioContext.decodeAudioData(await res.arrayBuffer())
    return createSoundFor(type, buffer)
  }

  const response = await fetch(src)
  responses.set(src, response)

  await initAudio()
  throwIfContextNotExist()

  const buffer = await audioContext.decodeAudioData(await response.clone().arrayBuffer())

  return createSoundFor(type, buffer)
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
  Beat,
  BeatTrack,
}

export type {
  Connectable,
  Playable,
  OscillatorOpts,
  OscillatorOptsFilterValues,
}
