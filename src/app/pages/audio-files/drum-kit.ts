import { codeBlock, htmlBlock } from '../../utils'
import nav from './nav'
import { setupDrumSamplerButton } from './drum-sampler-button'

const htmlExample = `
<div class="beat-pad">
  <span role="label">Kick</span>
  <span class="pad" role="button" id="play_kick"></span>
</div>
<div class="beat-pad">
  <span role="label">Snare</span>
  <span class="pad" role="button" id="play_snare"></span>
</div>
<div class="beat-pad">
  <span role="label">Hihat</span>
  <span class="pad" role="button" id="play_hihat"></span>
</div>
`

const codeExample = `
await initAudio()

const samplesPaths = [
  'some-path/hihat1.wav',
  'some-path/hihat2.wav',
  'some-path/hihat3.wav',
]

const hihat = await createSampler(samplesPaths)

hihat.play()
`

const Content = {
  setup() {
    setupDrumSamplerButton(document.querySelector<HTMLButtonElement>('#play_kick')!, 'kick')
    setupDrumSamplerButton(document.querySelector<HTMLButtonElement>('#play_snare')!, 'snare')
    setupDrumSamplerButton(document.querySelector<HTMLButtonElement>('#play_hihat')!, 'hihat')
  },
  html: `
${nav}

<h1>Multisampled Drum Kit Example</h1>

<p>Go ahead and hit the hihat a few times... Notice how each sample sounds slightly different? That's multisampling, baby.</p>

<div class="beat-pad">
  <span role="label">Kick</span>
  <span class="pad" role="button" id="play_kick"></span>
</div>
<div class="beat-pad">
  <span role="label">Snare</span>
  <span class="pad" role="button" id="play_snare"></span>
</div>
<div class="beat-pad">
  <span role="label">Hihat</span>
  <span class="pad" role="button" id="play_hihat"></span>
</div>

<div class="docs">
  ${htmlBlock(htmlExample)}
  ${codeBlock(codeExample)}
</div>
`,
}

export default Content
