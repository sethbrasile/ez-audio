import './public/style.css'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs'

import typescriptLogo from './public/typescript.svg'
import viteLogo from './public/vite.svg'
import { setupPlayButton } from './play-button.ts'
import { setupKickButton } from './kick-button.ts'
import { setupSnareButton } from './snare-button.ts'

// Then register the languages you need

const codeExample = `
const audioService = await AudioService.init()
const note = await audioService.load('Eb5.mp3').asSound()
note.play()
`

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>EZ Audio</h1>
    <h2 class="read-the-docs">
      Making the web audio API EZ since 2016
    </h2>
    <div class="card">
      <button id="play" type="button">Play</button>
      <button id="play_kick" type="button">Play Kick</button>
      <button id="play_snare" type="button">Play Snare</button>
    </div>
    <p>EZ Audio let's you interact with the web audio API as simply as:</p>
    <pre><code class="language-javascript">${codeExample}</code></pre>
    <p>EZ Audio was originally "Ember Audio" and it was developed before vue and react rose to prominence. This is a full rewrite  in vanilla typescript that exposes a similar API to "Ember Audio".</p>
  </div>
`

setupPlayButton(document.querySelector<HTMLButtonElement>('#play')!)
setupKickButton(document.querySelector<HTMLButtonElement>('#play_kick')!)
setupSnareButton(document.querySelector<HTMLButtonElement>('#play_snare')!)
