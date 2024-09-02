import { codeBlock } from '../../utils'
import nav from './nav'
import { setupNoteButton } from './note-buttons'

const codeExample = `

`

const Content = {
  setup() {
    // setupNoteButton(document.querySelector<HTMLButtonElement>('#both')!, 'both')
  },
  html: `
${nav}

<h1>MP3 Player Example</h1>

[WIP]
`,
}

export default Content
