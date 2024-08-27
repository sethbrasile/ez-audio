import './public/style.css'
import typescriptLogo from './public/typescript.svg'
import viteLogo from './public/vite.svg'
import { setupCounter } from './counter.ts'
import { setupPlayButton } from './play-button.ts'
import { setupKickButton } from './kick-button.ts'
import { setupSnareButton } from './snare-button.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
      <button id="play" type="button">Play</button>
      <button id="play_kick" type="button">Play Kick</button>
      <button id="play_snare" type="button">Play Snare</button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
setupPlayButton(document.querySelector<HTMLButtonElement>('#play')!)
setupKickButton(document.querySelector<HTMLButtonElement>('#play_kick')!)
setupSnareButton(document.querySelector<HTMLButtonElement>('#play_snare')!)
