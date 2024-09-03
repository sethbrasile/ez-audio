import nav from './nav'
import { setupIndicators, setupMp3Buttons } from './mp3-buttons'
import { codeBlock } from '@/app/utils'

const codeExample = `
// [code is WIP]
`

const Content = {
  setup() {
    setupMp3Buttons(document.querySelector<HTMLButtonElement>('#seek')!, 'seek')
    setupMp3Buttons(document.querySelector<HTMLButtonElement>('#volume')!, 'vol')
    setupMp3Buttons(document.querySelector<HTMLButtonElement>('#play')!, 'play')

    setupMp3Buttons(document.querySelector<HTMLButtonElement>('#select-do-wah-diddy')!, 'select', 'do-wah-diddy')
    setupMp3Buttons(document.querySelector<HTMLButtonElement>('#select-barely-there')!, 'select', 'barely-there')

    setupIndicators(document.querySelector<HTMLDivElement>('#duration')!, 'duration')
    setupIndicators(document.querySelector<HTMLDivElement>('#progress')!, 'progress')
    setupIndicators(document.querySelector<HTMLDivElement>('#current')!, 'current')
    setupIndicators(document.querySelector<HTMLParagraphElement>('#description')!, 'description')
    setupIndicators(document.querySelector<HTMLParagraphElement>('#player')!, 'player')
    setupIndicators(document.querySelector<HTMLParagraphElement>('#loading')!, 'loading')
    setupIndicators(document.querySelector<HTMLParagraphElement>('#vol-display')!, 'vol')
  },
  html: `
${nav}

<h1>MP3 Player Example</h1>

<div class="track-list">
  <div class="select">
    <table>
      <tbody>
        <tr class="pointer" id="select-do-wah-diddy">
          <td>Do Wah Diddy</td>
        </tr>
        <tr class="pointer" id="select-barely-there">
          <td>Barely There</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="description">
    <p id="description">Select a track...</p>
  </div>
</div>

<div id="loading" class="spinner hidden">
  <div class="rect1"></div>
  <div class="rect2"></div>
  <div class="rect3"></div>
  <div class="rect4"></div>
  <div class="rect5"></div>
</div>

<div id="player" class="audioplayer hidden">
  <div role="button" class="play-pause" id="play"><a></a></div>
  <div class="time current" id="current"></div>

  <div role="button" class="bar" id="seek">
    <div style="width: 100%;"></div>
    <div class="played" id="progress"></div>
  </div>

  <div class="time duration" id="duration"></div>

  <div role="button" class="volume" id="volume">
    <div class="button"><a></a></div>

    <div class="adjust">
      <div>
        <div id="vol-display"></div>
      </div>
    </div>
  </div>
</div>

${codeBlock(codeExample)}
`,
}

export default Content
