import { codeBlock } from '../../utils'
import nav from './nav'
import { setupNoteButton } from './note-buttons'

const codeExample = `
import { initAudio, createSound } from 'ez-audio'

const url = 'https://raw.githubusercontent.com/mudcube/MIDI.js/master/examples/soundfont/acoustic_grand_piano-mp3/B5.mp3'

const leftNote = await createSound('Db5.mp3')
const rightNote = await createSound(url)

leftNote.changePanTo(-0.7)
rightNote.changePanTo(0.7)

function playLeftNote() {
  leftNote.play()
}

function playRightNote() {
  rightNote.play()
}

function playBothNotes() {
  leftNote.play()
  rightNote.play()
}
`

const Content = {
  setup() {
    setupNoteButton(document.querySelector<HTMLButtonElement>('#left')!, 'left')
    setupNoteButton(document.querySelector<HTMLButtonElement>('#right')!, 'right')
    setupNoteButton(document.querySelector<HTMLButtonElement>('#both')!, 'both')
  },
  html: `

${nav}

<h1>A Simple Example</h1>

<button id="left" type="button">Play Note Panned Left</button>
<button id="right" type="button">Play Note Panned Right</button>
<button id="both" type="button" class="green">Play Both Notes</button>

${codeBlock(codeExample)}
`,
}

export default Content
