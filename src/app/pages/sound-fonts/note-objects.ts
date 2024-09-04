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
  },
  html: `
${nav}

<h1>Note Objects</h1>

<p>SampledNote objects returned from the createFont method are a very simple addition to Sound and just have a few additional properties.</p>
<p>Using the note Ab1 as an example:</p>

${codeBlock(codeExample)}
`,
}

export default Content
