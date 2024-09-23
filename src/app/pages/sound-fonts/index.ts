import PermissionBanner from '@components/permission-banner'
import { codeBlock, htmlBlock } from '../../utils'
import nav from './nav'
import { setupPiano } from './piano-buttons'

const htmlExample = `
<div id="piano">
  <ol id="keys"></ol>
</div>
`

const codeExample = `
// piano.js is a soundfont created with MIDI.js' Ruby-based soundfont converter
const piano = await createFont('/ez-web-audio/piano.js')
// Slicing just so the whole keyboard doesn't show up on the screen
const notes = piano.notes.slice(39, 51)

notes.forEach((note: Note) => {
  const key = document.createElement('li')
  key.classList.add('key')
  if (note.accidental) {
    key.classList.add('black')
  }
  key.textContent = note.identifier

  key.addEventListener('touchstart', () => {
    note.play()
  })
  key.addEventListener('touchend', () => {
    note.stop()
  })
  key.addEventListener('mousedown', () => {
    note.play()
  })
  key.addEventListener('mouseup', () => {
    note.stop()
  })

  document.querySelector<HTMLOListElement>('#keys')!.appendChild(key)
})
`

const Content = {
  setup() {
    setupPiano(document.querySelector<HTMLOListElement>('#keys')!)
    PermissionBanner.setup()
  },
  html: `

${nav}

<h1>Play a Soundfont</h1>

${PermissionBanner}

<div id="piano">
  <ol id="keys"></ol>
</div>

<p>
  <b>Important Note</b>: Soundfonts are javascript files, and if you allow them to be minified by your build chain
  or CDN, they may no longer work. Be sure to exclude them from any minification.
</p>

${htmlBlock(htmlExample)}

${codeBlock(codeExample)}
`,
}

export default Content
