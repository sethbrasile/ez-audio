import { expect, it } from 'vitest'
import { AudioContext as Mock } from 'standardized-audio-context-mock'
import { settle } from './test/helpers'
import { Sound } from '@/sound'

function createSound() {
  const context = new Mock() as unknown as AudioContext
  const audioBuffer = context.createBuffer(1, 1, 1)
  return new Sound(context, audioBuffer)
}

it('exists', () => {
  expect(Sound).toBeTruthy()
})

it('can be created', () => {
  const sound = createSound()
  expect(sound).toBeTruthy()
})

it('plays', async () => {
  const sound = createSound()
  expect(sound.isPlaying).toBe(false)
  sound.play()
  expect(await settle(() => sound.isPlaying)).toBe(true)
})

it('stops', async () => {
  const sound = createSound()
  sound.play()
  expect(await settle(() => sound.isPlaying)).toBe(true)
  sound.stop()
  expect(await settle(() => sound.isPlaying)).toBe(false)
})
