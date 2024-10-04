import PermissionBanner from '@components/permission-banner'
import { getSamplesPaths } from '@app/utils'
import { codeBlock, htmlBlock } from '../../utils'
import nav from './nav'
import { createSampler } from '@/index'

const Content = {
  setup() {
    nav.setup()

    async function setupDrumSamplerButton(element: HTMLButtonElement, drumType: 'hihat' | 'snare' | 'kick'): Promise<void> {
      const drum = await createSampler(getSamplesPaths(drumType))
      element.addEventListener('click', () => drum.play())
    }

    setupDrumSamplerButton(document.querySelector<HTMLButtonElement>('#play_kick')!, 'kick')
    setupDrumSamplerButton(document.querySelector<HTMLButtonElement>('#play_snare')!, 'snare')
    setupDrumSamplerButton(document.querySelector<HTMLButtonElement>('#play_hihat')!, 'hihat')
    PermissionBanner.setup()
  },
  html: `
${nav}

<h1>Multisampled Drum Kit Example</h1>

${PermissionBanner}

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
  ${htmlBlock(`
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
  `)}

  ${codeBlock(`
// in this example starting the audiocontext happens elsewhere and this promise won't resolve until it does
const hihat = await createSampler([
  'some-path/hihat1.wav',
  'some-path/hihat2.wav',
  'some-path/hihat3.wav',
])

hihat.play()
  `)}
</div>
`,
}

export default Content
