import { setupSnareButton } from '@app/snare-button.ts'
import { setupKickButton } from '@app/kick-button.ts'
import { setupHihatButton } from '../hihat-button'
import { codeBlock } from '../utils'

const playKick = `
function playKick() {
    const kick = audioService.createOscillator('kick')
    const osc = kick.getConnection('audioSource')
    const gain = kick.getConnection('gain')
    osc.onPlayRamp('frequency').from(150).to(0.01).in(0.3)
    gain.onPlayRamp('gain').from(1).to(0.01).in(0.3)
    kick.play()
}
`

const playBassDrop = `
playBassDrop() {
  const audio = this.get('audio');
  const bassDrop = audio.createOscillator();
  const osc = bassDrop.getConnection('audioSource');
  const gain = bassDrop.getConnection('gain');

  // We can specify 'linear' to get a linear ramp instead of an exponential one
  osc.onPlayRamp('frequency', 'linear').from(100).to(0.01).in(10);

  // We automate gain as well, so we don't end up with a loud click when the audio stops
  gain.onPlayRamp('gain').from(1).to(0.01).in(10);

  bassDrop.playFor(10);
}`

const Synthesis = {
  setup() {
    setupKickButton(document.querySelector<HTMLButtonElement>('#play_kick')!)
    setupSnareButton(document.querySelector<HTMLButtonElement>('#play_snare')!)
    setupHihatButton(document.querySelector<HTMLButtonElement>('#play_hihat')!)
  },
  html: `
<h1>Synthesis</h1>
<div class="beat-pad">
    <span role="label">Play Kick</span>
    <span class="pad" role="button" id="play_kick"></span>
</div>
<div class="beat-pad">
    <span role="label">Play Snare</span>
    <span class="pad" role="button" id="play_snare"></span>
</div>
<div class="beat-pad">
    <span role="label">Play Hihat</span>
    <span class="pad" role="button" id="play_hihat"></span>
</div>

<div class="docs">
    <p>Synthesis is a pretty complex topic. For the most part, it's all about filtering oscillators and controlling gain (controlling gain is referred to as controlling "envelope" in synth-land).</p>
    <p>In order to synthesize a drum sound, we can create an oscillator, play the oscillator in short bursts, and transform the envelope very quickly before the sound is stopped.</p>
    <p>Here's the function that outputs the kick sound from the beat-pads above:</p>

    ${codeBlock(playKick)}
    
    <p>A Connection instance has a method called onPlayRamp that lets us set a starting value, then use exponentialRampToValueAtTime to ramp up/down to another value, each time the oscillator is played.</p>

    <p>By doing:</p>

    ${codeBlock(`osc.onPlayRamp('frequency').from(150).to(0.01).in(0.1)`)}

    <p>Each time the oscillator is played, we are setting it's frequency to 150Hz, then ramping it down to 0.01Hz over the course of 0.1 seconds.</p>

    <p>We can make some adjustments and end up with a "bass drop."</p>

    <p>(If your speakers are turned up, you should probably turn them down, and you probably can't even hear this if you're on a laptop :D)</p>

    ${codeBlock(playBassDrop)}
</div>
`,

}

export default Synthesis
