import { codeBlock } from '../../utils'
import { setupNoteButton } from './note-buttons'

const codeExample = `
import { audio, loadSound } from 'ez-audio'

const url = 'https://raw.githubusercontent.com/mudcube/MIDI.js/master/examples/soundfont/acoustic_grand_piano-mp3/B5.mp3'

await audio.init()
const leftNote = await loadSound('Eb5.mp3')
const rightNote = await loadSound(url)

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

const Routing = {
  setup() {
    setupNoteButton(document.querySelector<HTMLButtonElement>('#left')!, 'left')
    setupNoteButton(document.querySelector<HTMLButtonElement>('#right')!, 'right')
    setupNoteButton(document.querySelector<HTMLButtonElement>('#both')!, 'both')
  },
  html: `
<a href="/ez-audio/audio-files" id="audio-files">Simple</a>
|
<a href="/ez-audio/mp3-player" id="mp3">MP3 Player</a>
|
<a href="/ez-audio/drum-kit" id="drum-kit">Drum Kit</a>

<h1>A Simple Example</h1>
<button id="left" type="button">Play Note Panned Left</button>
<button id="right" type="button" disabled>Play Note Panned Right</button>
<button id="both" type="button" disabled>Play Both Notes</button>

${codeBlock(codeExample)}
`,
}

export default Routing
