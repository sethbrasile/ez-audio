import { codeBlock } from '../../utils'
import nav from './nav'

const codeExample = `
note.letter // 'A'
note.accidental // 'b'
note.octave // 1
note.identifier // 'Ab1'
note.name // 'Ab
`

// TODO: add these to MusicalIdentity
// note.frequency // 207.65234878997226
// note.midi // 57

const Content = {
  setup() {
    // setupPiano(document.querySelector<HTMLButtonElement>('#left')!, 'left')
    // setupPiano(document.querySelector<HTMLButtonElement>('#right')!, 'right')
    // setupPiano(document.querySelector<HTMLButtonElement>('#both')!, 'both')
  },
  html: `

${nav}

<h1>Note Objects</h1>

<p>Note objects return from the createFont method are very simple and just have a few properties.</p>
<p>Using the note Ab1 as an example:</p>

${codeBlock(codeExample)}
`,
}

export default Content
