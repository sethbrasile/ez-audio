import { codeBlock, htmlBlock } from '@app/utils'
import { setupSnareButton, setupSnareCrackButton, setupSnareMeatButton } from './snare-button'
import { setupHihatButton } from './hihat-button'
import { setupBassDropButton } from './bass-drop-button'
import { setupKickButton } from './kick-button'
import nav from './nav'

const playKick = `
import { initAudio, createOscillator, createWhiteNoise, LayeredSound } from 'ez-audio'
await initAudio()

const kick = createOscillator()
kick.onPlayRamp('frequency').from(150).to(0.01).in(0.1)
kick.onPlayRamp('gain').from(1).to(0.01).in(0.1)
// In synthesis, it's important to use 'playFor' or call 'stop' because
// with 'play' these notes would keep playing until the page is reloaded
kick.playFor(0.1)
`

const playBassDrop = `
const drop = createOscillator()
drop.onPlayRamp('frequency').from(100).to(0.01).in(20)
// We can specify 'linear' to get a linear ramp instead of an exponential one
// We automate gain as well, so we don't end up with a loud click when the audio stops
drop.onPlayRamp('gain', 'linear').from(1).to(0.01).in(4)
drop.playFor(4)
`

const playSnare = `
function createSnareOscillator() {
  const snare = createOscillator()
  snare.onPlayRamp('frequency').from(100).to(60).in(0.1)
  snare.onPlayRamp('gain').from(1).to(0.01).in(0.1)
  return snare
}

function createSnareNoise() {
  const noise = createWhiteNoise()
  noise.onPlayRamp('gain').from(1).to(0.001).in(0.1)
  return noise
}

const osc = createSnareOscillator()
const noise = createSnareNoise()

// a LayeredSound is just like a Sound but it allows us to play multiple audio sources at once
const snare = new LayeredSound([noise, osc])

snare.playFor(0.1)
`

const playHihat = `
function createHihatOscillator(ratio: number) {
  const fundamental = 40

  return createOscillator({
    type: 'square',
    highpass: { frequency: 7000 },
    bandpass: { frequency: 10000 },
    frequency: fundamental * ratio,
  })
}

function createHihatEnvelope(oscillator: Oscillator) {
  oscillator.onPlayRamp('gain').from(0.00001).to(1).in(0.02)
  oscillator.onPlaySet('gain').to(0.3).endingAt(0.03)
  oscillator.onPlaySet('gain').to(0.00001).endingAt(0.3)
  return oscillator
}

function createHihat() {
  // http://joesul.li/van/synthesizing-hi-hats/
  const overtones = [2, 3, 4.16, 5.43, 6.79, 8.21]

  const oscillators = overtones
    // Create an oscillator for each overtone
    .map(createHihatOscillator)

    // Shape the envelope for each oscillator
    .map(createHihatEnvelope)

  // Layer them all together
  return new LayeredSound(oscillators)
}

const hihat = createHihat()
hihat.playFor(0.3)
`

const fullCodeHtml = `
<!-- some-page.html -->
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

<script>
  // lol you wouldn't actually call them in a script tag like this, but you get the point
  // pretend you loaded these setup functions into the dom somehow
  setupKickButton(document.querySelector('#play_kick'))
  setupSnareButton(document.querySelector('#play_snare'))
  setupHihatButton(document.querySelector('#play_hihat'))
</script>
`

const fullCodeKick = `
// kick.ts
import { initAudio, createOscillator } from 'ez-audio'

// As stated above is slightly simplified, as you can see here, we're creating the oscillator in a setup function upon
// click, then removing the listener. We do this because we can't create the AudioContext until we are responding to a
// user interaction like a button press. Then once we have the oscillator, we set up another listener that just plays it.
export function setupKickButton(element: HTMLButtonElement) {
  async function setup() {
    // AudioContext setup must occur in response to user interaction, so this is why we do setup in click handler
    // then remove the listener.
    await initAudio()

    const kick = createOscillator()
    kick.onPlayRamp('frequency').from(150).to(0.01).in(0.1)
    kick.onPlayRamp('gain').from(1).to(0.01).in(0.1)

    // This plays the note upon first user interaction
    kick.playFor(0.1)

    // remove the setup listener
    element.removeEventListener('click', setup)

    // add a listener to play the note again when the button is clicked for the rest of the document's life
    element.addEventListener('click', () => kick.playFor(0.1))
  }

  element.addEventListener('click', setup)
}

`
const fullCodeSnare = `
// snare.ts
import { initAudio, createOscillator, createWhiteNoise, LayeredSound } from 'ez-audio'

export function setupSnareButton(element: HTMLButtonElement) {
  function createSnareOscillator() {
    const snare = createOscillator()
    snare.onPlayRamp('frequency').from(100).to(60).in(0.1)
    snare.onPlayRamp('gain').from(1).to(0.01).in(0.1)
    return snare
  }

  function createSnareNoise() {
    const noise = createWhiteNoise()
    noise.onPlayRamp('gain').from(1).to(0.001).in(0.1)
    return noise
  }

  async function setup() {
    await initAudio()
    const osc = createSnareOscillator()
    const noise = createSnareNoise()
    const snare = new LayeredSound([noise, osc])

    snare.playFor(0.1)

    element.removeEventListener('click', setup)

    element.addEventListener('click', () => snare.playFor(0.1))
  }

  element.addEventListener('click', setup)
}

`

const fullCodeHihat = `
// hh.ts
import { initAudio, createOscillator, createWhiteNoise, LayeredSound } from 'ez-audio'
import type { Oscillator } from 'ez-audio'

export function setupHihatButton(element: HTMLButtonElement) {
  function createHihatOscillator(ratio: number) {
    const fundamental = 40

    return createOscillator({
      type: 'square',
      highpass: { frequency: 7000 },
      bandpass: { frequency: 10000 },
      frequency: fundamental * ratio,
    })
  }

  function createHihatEnvelope(oscillator: Oscillator) {
    oscillator.onPlayRamp('gain').from(0.00001).to(1).in(0.02)
    oscillator.onPlaySet('gain').to(0.3).endingAt(0.03)
    oscillator.onPlaySet('gain').to(0.00001).endingAt(0.3)
    return oscillator
  }

  function createHihat() {
    // http://joesul.li/van/synthesizing-hi-hats/
    const overtones = [2, 3, 4.16, 5.43, 6.79, 8.21]

    const oscillators = overtones
      // Create an oscillator for each overtone
      .map(createHihatOscillator)

      // Shape the envelope for each oscillator
      .map(createHihatEnvelope)

    // Layer them all together
    return new LayeredSound(oscillators)
  }

  async function setup() {
    await initAudio()
    const hihat = createHihat()

    hihat.playFor(0.3)

    element.removeEventListener('click', setup)

    element.addEventListener('click', () => hihat.playFor(0.3))
  }

  element.addEventListener('click', setup)
}
`

const Content = {
  setup() {
    setupKickButton(document.querySelector<HTMLButtonElement>('#play_kick')!)
    setupSnareButton(document.querySelector<HTMLButtonElement>('#play_snare')!)
    setupHihatButton(document.querySelector<HTMLButtonElement>('#play_hihat')!)
    setupBassDropButton(document.querySelector<HTMLButtonElement>('#play_bass_drop')!)
    setupSnareMeatButton(document.querySelector<HTMLButtonElement>('#play_meat')!)
    setupSnareCrackButton(document.querySelector<HTMLButtonElement>('#play_crack')!)
  },
  html: `
${nav}
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
  <button id="play_bass_drop" type="button">Play</button>

  ${codeBlock(playBassDrop)}

  <p>The snare and hihat sounds use the same concepts, but they're a bit more complex.
  <p>For the snare, we create an oscillator that mimics the "meat" of the snare tone. It's similar to the kick sound, but doesn't drop as low. We also create a Sound instance that's loaded up with "white noise" that we use to mimic the "crack" of the snare (the "snares" on the bottom of the snare).</p>
  <p>We shape the "envelope" of each, then layer the two sounds together.</p>
  <p>In case you're curious, here are both sounds individually.</p>

  <button id="play_meat" type="button">Play Snare Meat</button>
  <button id="play_crack" type="button">Play Snare Crack</button>

  ${codeBlock(playSnare)}

  <p>For the hihat, we create an oscillator for each of 6 different overtones of a fundamental frequency (in our case, we're using 40). We heavily filter each oscillator, then shape the envelope for each so that the gain ramps up and back down very quickly, then layer them all together.<p>

  ${codeBlock(playHihat)}

  <p>Here's the full code for the synthesized drum kit example:</p>

  ${htmlBlock(fullCodeHtml)}

  ${codeBlock(fullCodeKick)}
  ${codeBlock(fullCodeSnare)}
  ${codeBlock(fullCodeHihat)}
</div>
`,
}

export default Content
