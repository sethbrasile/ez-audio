import { type Link, createNav } from '@app/utils/nav'
import { handleLocation } from './router'

// <a href="/ez-web-audio/#/" id="index">Home</a>
// <a href="/ez-web-audio/#/audio-files" id="audio-files">Audio Files</a>
// <a href="/ez-web-audio/#/sound-fonts" id="sound-fonts">Sound Fonts</a>
// <a href="/ez-web-audio/#/audio-routing" id="audio-routing">Audio Routing</a>
// <a href="/ez-web-audio/#/timing" id="timing">Timing</a>
// <a href="/ez-web-audio/#/synthesis" id="synthesis">Synthesis</a>
// <a href="/ez-web-audio/#/starting-audiocontext" id="starting-audiocontext">Starting AudioContext</a>
const links: Link[] = [
  {
    path: '',
    text: 'Home',
  },
  {
    path: 'audio-files',
    text: 'Audio Files',
  },
  {
    path: 'sound-fonts',
    text: 'Sound Fonts',
  },
  {
    path: 'audio-routing',
    text: 'Audio Routing',
  },
  {
    path: 'timing',
    text: 'Timing',
  },
  {
    path: 'synthesis',
    text: 'Synthesis',
  },
  {
    path: 'starting-audiocontext',
    text: 'Starting AudioContext',
  },
]

const nav = createNav(links)
const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('No app element found')
}

app.innerHTML = `
${nav}
<hr/>
<div id="main-page"></div>
`

nav.setup()
handleLocation()
