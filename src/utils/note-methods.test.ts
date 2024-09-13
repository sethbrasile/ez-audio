import { assert, expect, it } from 'vitest'
import noteFactory from '@test/helpers/note-factory'
import {
  createOctavesWithNotes,
  extractOctaves,
  noteSort,
  octaveShift,
  octaveSort,
  sortNotes,
  stripDuplicateOctaves,
} from '@utils/note-methods'
import type { Octave } from '@/musical-identity'
import type { Note } from '@/note'

const A0 = noteFactory('A', '', '0')
const Bb0 = noteFactory('B', 'b', '0')
const B0 = noteFactory('B', '', '0')
const Ab1 = noteFactory('A', 'b', '1')
const A1 = noteFactory('A', '', '1')
const Bb1 = noteFactory('B', 'b', '1')
const B1 = noteFactory('B', '', '1')
const C1 = noteFactory('C', '', '1')
const Db1 = noteFactory('D', 'b', '1')

const correctOctaves = [
  [A0, Bb0, B0],
  [C1, Db1, Ab1, A1, Bb1, B1],
]

it('sortNotes exists', () => {
  assert.ok(sortNotes)
})

it('noteSort exists', () => {
  assert.ok(noteSort)
})

it('octaveShift exists', () => {
  assert.ok(octaveShift)
})

it('octaveSort exists', () => {
  assert.ok(octaveSort)
})

it('extractOctaves exists', () => {
  assert.ok(extractOctaves)
})

it('stripDuplicateOctaves exists', () => {
  assert.ok(stripDuplicateOctaves)
})

it('createOctavesWithNotes exists', () => {
  assert.ok(createOctavesWithNotes)
})

it('sortNotes works', () => {
  expect(1)

  const result = sortNotes([A0, Ab1, A1, Bb1, B1, C1, Db1, Bb0, B0])

  assert.deepEqual(result, [A0, Bb0, B0, C1, Db1, Ab1, A1, Bb1, B1])
})

it('octaveShift works', () => {
  expect(1)

  const arr1 = [A0, Bb0, B0]
  const arr2 = [Ab1, A1, Bb1, B1, C1, Db1]
  const octaves = [arr1, arr2]
  const result = octaveShift(octaves)

  assert.deepEqual(result, correctOctaves)
})

it('octaveSort works', () => {
  const alphabeticalOctaves = [
    [A0, Bb0, B0],
    [Ab1, A1, Bb1, B1, C1, Db1],
  ]

  expect(1)

  const result = octaveSort(correctOctaves)
  assert.deepEqual(result, alphabeticalOctaves)
})

it('createOctavesWithNotes works', () => {
  expect(1)
  const arr = [
    [Ab1, Bb0, B0],
    ['0', '1'],
  ] as [Note[], Octave[]]
  const result = createOctavesWithNotes(arr)
  assert.deepEqual(result, [[Bb0, B0], [Ab1]])
})

it('noteSort compares two letters correctly', () => {
  expect(2)

  const compA = noteSort(A0, B0)
  const compB = noteSort(B0, A0)

  assert.strictEqual(compA, -1)
  assert.strictEqual(compB, 1)
})

it('noteSort compares a natural and an accidental correctly', () => {
  expect(2)

  const compA = noteSort(Ab1, A0)
  const compB = noteSort(A0, Ab1)

  assert.strictEqual(compA, -1)
  assert.strictEqual(compB, 1)
})
