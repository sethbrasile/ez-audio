import { expect, it } from 'vitest'
import { AudioContext as Mock } from 'standardized-audio-context-mock'
import { mockSetTimeout, settle } from './test/helpers'
import type { BeatOptions } from '@/beat'
import { Beat } from '@/beat'

class MockParentClass {
  playCalled = false
  playInCalled = false
  playInValue = 0
  play() {
    this.playCalled = true
  }

  playIn(time: number) {
    this.playInCalled = true
    this.playInValue = time
  }
}

function createBeat(p: BeatOptions) {
  const context = new Mock() as unknown as AudioContext
  return new Beat(context, p)
}

it('exists', () => {
  expect(Beat).toBeTruthy()
})

it('can be created', () => {
  const parent = new MockParentClass()
  const beat = createBeat(parent)
  expect(beat).toBeTruthy()
})

it('can play and calls parent play', () => {
  const parent = new MockParentClass()
  const beat = createBeat({
    play: parent.play.bind(parent),
    playIn: parent.playIn.bind(parent),
  })

  expect(parent.playCalled).toBe(false)
  beat.play()
  expect(parent.playCalled).toBe(true)
})

it('can playIn and calls parent playIn, passing time value', () => {
  const parent = new MockParentClass()
  const beat = createBeat({
    play: parent.play.bind(parent),
    playIn: parent.playIn.bind(parent),
  })

  expect(parent.playCalled).toBe(false)
  beat.playIn(10)
  expect(parent.playInCalled).toBe(true)
  expect(parent.playInValue).toBe(10)
})

it('sets `isPlaying` to `true` when played and sets up a timer that sets `isPlaying` back to false after `duration` has elapsed.', async () => {
  const parent = new MockParentClass()
  const beat = createBeat({
    play: parent.play.bind(parent),
    playIn: parent.playIn.bind(parent),
    duration: 1,
    // mock setTimeout so we can control when it fires
    setTimeout: mockSetTimeout,
  })

  expect(beat.isPlaying).toBe(false)

  beat.play()

  expect(beat.isPlaying).toBe(true)

  expect(await settle(() => beat.isPlaying)).toBe(false)
})
