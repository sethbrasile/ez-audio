import { arraySwap, unique } from '@utils/array-methods'
import { base64ToUint8 } from '@utils/decode-base64'
import type { AcceptableNote, IMusicallyAware } from '@/musical-identity'
import { SampledNote } from '@/sampled-note'

type NotesTuple = [IMusicallyAware[], string[]]

/**
 * @public
 * @class utils
 */

/**
 * Sorts an array of {{#crossLink "Note"}}Notes{{/crossLink}} so that they are in the same order that they would
 * appear on a piano.
 *
 * @param {Array} notes An array of notes that should be musically-sorted.
 *
 * @public
 * @method sortNotes
 *
 * @return {Array} Array of musically-sorted notes.
 */
export function sortNotes(notes: IMusicallyAware[]) {
  // get octaves so that we can sort based on them
  let sortedNotes = extractOctaves(notes)

  // Each octave has tons of duplicates
  sortedNotes = stripDuplicateOctaves(sortedNotes)

  // Create array of arrays. Each inner array contains all the notes in an octave
  let octavesWithNotes = createOctavesWithNotes(sortedNotes)

  // Sort the notes in each octave, alphabetically, flats before naturals
  octavesWithNotes = octaveSort(octavesWithNotes)

  // Determine last note of first octave, then for each octave, split at
  // that note, then shift the beginning notes to the end
  octavesWithNotes = octaveShift(octavesWithNotes)
  // Flatten array of arrays into a flat array
  return octavesWithNotes.flat()
}

/**
 * Takes an array of arrays of notes, determines the last note of
 * the first array, then splits the rest of the arrays in the array at the last
 * note of the first array, and moves the beginning of the array to the end
 * so that each array starts at the next note after the last note of the first
 * array, instead of at "A" (alphabetically).
 *
 * @example
 *     This is hard to explain. Here's an example.
 *     (Simplified, as the real notes are objects)
 *
 *     Example input: [['A0', 'B0'], ['A1', 'B1', 'C1', 'D1']]
 *     Example output: [['A0', 'B0'], ['C1', 'D1', 'A1', 'B1']]
 *
 * @private
 * @method octaveShift
 *
 * @param {Array} octaves An array of octaves, each octave is an array of Notes.
 *
 * @return {Array} Input array after having been shifted.
 */
export function octaveShift(octaves: IMusicallyAware[][]): IMusicallyAware[][] {
  // Pull first octave from beginning of array
  const firstOctave = octaves.shift() || []
  // Get all the note names from the second octave for comparison
  const secondOctaveNames = octaves[0].map(note => note.name)
  // Get the note name of the last note in the first octave
  const lastNote = firstOctave[firstOctave.length - 1].name
  // Get the index of the occurence of the last note from the first
  // octave, in the second octave
  const indexToShiftAt = secondOctaveNames.lastIndexOf(lastNote) + 1
  // Split the octave array at that point, and move the first chunk to the end
  const result = octaves.map(octave => arraySwap(octave, indexToShiftAt))
  // Put first octave back at the beginning of the array
  result.unshift(firstOctave)
  return result
}

/**
 * Maps through an array of arrays and sorts each array with
 * "noteSort"
 *
 * @private
 * @method octaveSort
 *
 * @param  {Array} octaves array of arrays to be sorted
 *
 * @return {Array} array of sorted arrays
 */
export function octaveSort(octaves: IMusicallyAware[][]): IMusicallyAware[][] {
  return octaves.map(octave => octave.sort(noteSort))
}

/**
 * Accepts an array of Note objects and passes back an array
 * like this: [original array, array of each octave in the orginal array]
 *
 * @private
 * @method extractOctaves
 *
 * @param  {Array} notes array of note objects.
 *
 * @return {Array} array containing two inner arrays, [0] is the untouched input
 * array, [1] is an array of all the octaves in the original array.
 */
export function extractOctaves(notes: IMusicallyAware[]): NotesTuple {
  return [notes, notes.map(note => note.octave)]
}

/**
 * Accepts an array of two arrays and returns the same
 * array, but with array at index [1] uniq'd and sorted alphabetically.
 *
 * @private
 * @method stripDuplicateOctaves
 *
 * @param  {Array} [ notes, octaves ] the output from extractOctaves.
 *
 * @return {Array} The mutated array.
 */
export function stripDuplicateOctaves([notes, octaves]: NotesTuple): NotesTuple {
  return [notes, unique(octaves).sort()]
}

/**
 * Accepts an array of two arrays, [0] being an array
 * of Note objects, [1] being all the available octaves. Returns a single array
 * made up of arrays of Note objects, organized by octave. Each inner array
 * represents all of the notes in an octave.
 *
 * @private
 * @method createOctavesWithNotes
 *
 * @param  {Array} data The output of stripDuplicateOctaves.
 *
 * @return {Ember.MutableArray}
 */
export function createOctavesWithNotes([notes, octaves]: NotesTuple) {
  return octaves.map(octave => notes.filter(note => note.octave === octave))
}

/**
 * Acts as a comparator function for the
 * {{#crossLink "Array/sort:method"}}Array.prototype.sort{{/crossLink}} method.
 * Sorts two {{#crossLink "Note"}}{{/crossLink}} instances alphabetically, flats
 * before naturals.
 *
 * @private
 * @method noteSort
 *
 * @param {Note} a The first Note instance to compare.
 * @param {Note} b The second Note instance to compare.
 *
 * @return {number} -1 or 1, depending on whether the current
 * {{#crossLink "Note"}}{{/crossLink}} instance should be sorted left, or right.
 */
export function noteSort(a: IMusicallyAware, b: IMusicallyAware) {
  const aLet = a.letter
  const bLet = b.letter

  if (aLet < bLet) {
    return -1
  }

  if (aLet === bLet) {
    if (a.accidental === 'b') {
      return -1
    }
  }

  return 1
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
export function extractDecodedKeyValuePairs(ctx: AudioContext, notes: string[]) {
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
export function createNoteObjectsForFont(ctx: AudioContext, audioData: [AcceptableNote, AudioBuffer][]): SampledNote[] {
  const notes = audioData.map((note) => {
    const [identifier, audioBuffer] = note
    const sampledNote = new SampledNote(ctx, audioBuffer)
    sampledNote.identifier = identifier
    return sampledNote
  })

  return sortNotes(notes) as SampledNote[]
}
