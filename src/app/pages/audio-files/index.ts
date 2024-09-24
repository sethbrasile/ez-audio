import { codeBlock } from '../../utils'
import nav from './nav'
import { createSound, initAudio } from '@/index'

const url = 'https://raw.githubusercontent.com/mudcube/MIDI.js/master/examples/soundfont/acoustic_grand_piano-mp3/B5.mp3'

const codeExample = `
import { initAudio, createSound } from 'ez-web-audio'

const url = 'https://raw.githubusercontent.com/mudcube/MIDI.js/master/examples/soundfont/acoustic_grand_piano-mp3/B5.mp3'

// Sounds can be created in advance, but they won't be playable until after \`initAudio\` is called
const leftNote = createSound('Eb5.mp3').then(note => note.changePanTo(-0.7))
const rightNote = createSound(url).then(note => note.changePanTo(0.7))

leftButton.addEventListener('click', async () => (await leftNote).play())
rightButton.addEventListener('click', async () => (await rightNote).play())

bothButton.addEventListener('click', async () => {
  const notes = await Promise.all([leftNote, rightNote])
  notes.forEach(note => note.play())
})

async function setup() {
  await initAudio()
  allButtons.forEach(element => element.removeEventListener('click', setup))
}

// Trigger initAudio in response to any user click
allButtons.forEach(element => element.addEventListener('click', setup))
`

const Content = {
  setup() {
    const rightButton = document.getElementById('right')!
    const leftButton = document.getElementById('left')!
    const bothButton = document.getElementById('both')!
    const allButtons = [leftButton, rightButton, bothButton]

    const leftNote = createSound('Eb5.mp3').then(note => note.changePanTo(-0.7))
    const rightNote = createSound(url).then(note => note.changePanTo(0.7))

    leftButton.addEventListener('click', async () => (await leftNote).play())
    rightButton.addEventListener('click', async () => (await rightNote).play())

    bothButton.addEventListener('click', async () => {
      const notes = await Promise.all([leftNote, rightNote])
      notes.forEach(note => note.play())
    })

    async function setup(): Promise<void> {
      await initAudio()
      allButtons.forEach(element => element.removeEventListener('click', setup))
    }

    // Trigger initAudio in response to any user click
    allButtons.forEach(element => element.addEventListener('click', setup))
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
