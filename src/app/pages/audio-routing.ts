import { setupDistortablePlayButton, setupToggleDistortion } from '@app/distortable-play-button'
import { codeBlock } from '../utils'

const codeExample = `
const NAME = 'distortion'

await audio.init()
const sound = await loadSound('Eb5.mp3')

let distortionEnabled = false

function makeDistortionCurve(amount: number) {
  // I stole this straight from the Mozilla Web Audio API docs site
  const k = typeof amount === 'number' ? amount : 50
  const n_samples = 44100
  const curve = new Float32Array(n_samples)
  const deg = Math.PI / 180

  for (let i = 0; i < n_samples; ++i) {
    const x = i * 2 / n_samples - 1
    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x))
  }

  return curve
}

function addDistortion() {
  const curve = makeDistortionCurve(400)

  distortionEnabled = true

  // lower note's gain because distorted signal has much more apparent volume
  sound.update('gain').to(0.1).from('ratio')

  // To adjust properties directly on an audio node, we can get that node by name from the sound
  // Set distortionNode's curve to enable distortion
  const node = sound.getNodeFrom<WaveShaperNode>(NAME)
  if (node) {
    node.curve = curve
  }
}

function removeDistortion() {
  distortionEnabled = false

  // raise note's gain because clean signal has much less apparent volume
  sound.update('gain').to(1).from('ratio')

  // Set distortionNode's curve to an empty Float32Array to disable distortion
  const node = sound.getNodeFrom<WaveShaperNode>(NAME)
  if (node) {
    node.curve = new Float32Array()
  }
}

function toggleDistortion(button) {
  if (distortionEnabled) {
    removeDistortion()
    button.textContent = 'Enable distortion'
  }
  else {
    addDistortion()
    button.textContent = 'Disable distortion'
  }
}

distortionButton.addEventListener('click', toggleDistortion)
`

const Content = {
  setup() {
    setupDistortablePlayButton(document.querySelector<HTMLButtonElement>('#play')!)
    setupToggleDistortion(document.querySelector<HTMLButtonElement>('#toggle')!)
  },
  html: `
<h1>Audio Routing</h1>

<button id="play" type="button">Play</button>
<button id="toggle" type="button" disabled>Toggle Distortion</button>

<p>The signal path in the Web Audio API works by allowing one to stitch together various audio "nodes." An audio node works just like a guitar pedal; It has an input, it does some stuff to whatever goes into that input, and it has an output.</p>
<p>By default, a Sound instance is routed through 4 audio nodes:</p>

<ol>
  <li>Source - It's input is some sort of audio source; Sound loaded from a file, a synthesizer oscillator, or input from a user's microphone. It's output is digital audio data that the other audio nodes understand.</li>
  <li>Gain - This node allows one to adjust the gain of the audio data that is routed through it.</li>
  <li>Panner - This node allows one to control the stereo pan position (left or right) of the audio data that is routed through it.</li>
  <li>Destination - This node routes any audio data that is routed through it, to the end user's audio output.
    The nodes are connected automatically, in the same order that they exist in the connections array. For the example above (the default case) they are connected like: Source -> Gain -> Panner -> Destination</li>
</ol>

<p>There are many more AudioNode types provided by the Web Audio API than the ones that are represented here. Take a look at the Web Audio API Documentation to learn about all of the available AudioNode types.</p>
<p>It is possible to customize routing by adding and removing audio nodes from a Sound instance's connections array.</p>
<p>The connections array is just an array so it is easily manipulated using standard array methods.</p>
<p>A Sound instance also has a convenience method called removeConnection that allows one to remove a connection by it's name.</p>

${codeBlock(codeExample)}
`,
}

export default Content
