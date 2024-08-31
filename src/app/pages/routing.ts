import { setupDistortablePlayButton, setupToggleDistortion } from '@app/distortable-play-button'
import { codeBlock } from '../utils'

const codeExample = `
import { AudioService } from 'ez-audio'
const audioService = await AudioService.init()
const note = await audioService.load('Eb5.mp3').asSound()
note.play()
`

const Routing = {
  setup() {
    setupDistortablePlayButton(document.querySelector<HTMLButtonElement>('#play')!)
    setupToggleDistortion(document.querySelector<HTMLButtonElement>('#toggle')!)
  },
  html: `
<h1>Routing</h1>

<button id="play" type="button">Play</button>
<button id="toggle" type="button" disabled>Toggle Distortion</button>

The signal path in the Web Audio API works by allowing one to stitch together various audio "nodes." An audio node works just like a guitar pedal; It has an input, it does some stuff to whatever goes into that input, and it has an output.

By default, a Sound instance is routed through 4 audio nodes:

Source - It's input is some sort of audio source; Sound loaded from a file, a synthesizer oscillator, or input from a user's microphone. It's output is digital audio data that the other audio nodes understand.
Gain - This node allows one to adjust the gain of the audio data that is routed through it.
Panner - This node allows one to control the stereo pan position (left or right) of the audio data that is routed through it.
Destination - This node routes any audio data that is routed through it, to the end user's audio output.
The nodes are connected automatically, in the same order that they exist in the connections array. For the example above (the default case) they are connected like: Source -> Gain -> Panner -> Destination

There are many more AudioNode types provided by the Web Audio API than the ones that are represented here. Take a look at the Web Audio API Documentation to learn about all of the available AudioNode types.

It is possible to customize routing by adding and removing audio nodes from a Sound instance's connections array.

The connections array is an Ember.MutableArray so it is easily manipulated using it's prototype methods such as insertAt and removeAt.

A Sound instance also has a convenience method called removeConnection that allows one to remove a connection by it's name.



${codeBlock(codeExample)}
`,
}

export default Routing
