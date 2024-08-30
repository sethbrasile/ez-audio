import { expect, it } from 'vitest'
import { AudioContext as Mock } from 'standardized-audio-context-mock'
import { Sound, SoundAdjuster } from '@/sound'

function createSound() {
  const context = new Mock() as unknown as AudioContext
  const audioBuffer = context.createBuffer(1, 1, 1)
  return new Sound(context, new SoundAdjuster(), audioBuffer)
}

it('exists', () => {
  expect(Sound).toBeTruthy()
})

it('can be created', () => {
  const sound = createSound()
  expect(sound).toBeTruthy()
})

it('plays', () => {
  const sound = createSound()
  expect(sound.isPlaying).toBeFalsy()
  sound.play()
  expect(sound.isPlaying).toBeTruthy()
})

it('stops', () => {
  const sound = createSound()
  sound.play()
  expect(sound.isPlaying).toBeTruthy()
  sound.stop()
  expect(sound.isPlaying).toBeFalsy()
})
