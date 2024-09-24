import { codeBlock, htmlBlock, inlineCode } from '../../utils'
import nav from './nav'
import { createSound, getAudioContext } from '@/index'

const Content = {
  async setup() {
    const button = document.getElementById('play-in-one-second')!
    button.addEventListener('click', async () => {
      const sound = await createSound('Db5.mp3')
      const audioContext = await getAudioContext()
      const now = audioContext.currentTime
      sound.playAt(now + 1)
    })
  },
  html: `

${nav}

<h1>Timing</h1>

<div class="docs">
  <i><small>
    Note: It is not necessary to understand this concept, as Ember Audio has methods that allow you to ignore it.
    I encourage you to understand it anyway. It's easy to grasp, and if you're building a rhythm/timing heavy
    app as this knowledge will be very useful to you.
  </small></i>

  <p>
    Timing with the Web Audio API can seem tricky at first. It's unlike any other timing system native to the
    browser. It's not very complex, and easy to wrap your brain around once you "get" it.
  </p>
  <p>
    It's based on the concept of a currentTime that starts at 0 and counts it's way up in seconds (as a high-precision
    Double). This currentTime starts the moment that an AudioContext has been created.
  </p>
  <p>If, for instance, you wanted a sound to play exactly 1 second after a user clicks a button, it could look like this:</p>

  ${codeBlock(`
// This is pseudo-code. The goal at this point is to get the concept across,
// not to potentially confuse you with framework-specific stuff.

// The moment that audioContext is created, audioContext.currentTime starts counting seconds
const audioContext = new AudioContext();

const sound = // Create or load a sound and hook up audio inputs and outputs.
// Not important right now...
// We'll say that the result is an audio "node" that is ready to play

function handleClick() {
  // Get the current time from audioContext.
  const now = audioContext.currentTime;

  // Start the sound we created up there^, adding 1 second to "now"
  // The Web Audio API deals in seconds, not milliseconds
  sound.start(now + 1);
}
  `)}

  <p>Now what if we wanted to schedule the sound 5 times, each exactly 1 second apart?</p>

  ${codeBlock(`
// Again, I want to mention that this code will not work as-is. It's ignoring
// some other quirks of the Web Audio API. We're only focused on understanding
// timing at the moment.
const audioContext = new AudioContext();

const sound = // Create or load a sound and hook up audio inputs and outputs.

function handleClick() {
  const now = audioContext.currentTime;

  for (let i = 0; i < 5; i++) {
    sound.start(now + i);
  }
}
  `)}

  <p>
    As you can see, as far as an AudioContext is concerned, the moment that it is created is "the beginning of time"
    and scheduling events is achieved by specifying an exact moment in time. sound.start(100) would play the sound
    exactly 100 seconds after the AudioContext was created, regardless of what time sound.start(100) was called.
    If sound.start(100) is called after 100 seconds has already passed since "the beginning of time," the sound
    will play immediately.
  </p>

  <i><small>
    Again, this is an important concept to understand, but in many cases (even more complex cases, such as
    <a href="/ez-web-audio/timing/drum-machine">building a rhythmically-based instrument</a>) this is already handled f
    or you. Check out <a href="/ez-web-audio/timing/with-ez-web-audio">Beats</a>, or the very last example on this page.
  </small></i>

  <h2>The first example again, but with real code</h2>

  <p>
    Just in case you're not completely grasping how this relates directly to Ember Audio. Here is the first
    example from above, but written so that it works in Ember and EZ Web Audio.
  </p>
  <div>
    <button id="play-in-one-second">Play in One Second</button>
  </div>
  <i><small>
    Note: Loading an mp3 and initializing the audio context creates a delay, so ideally if the timing matters, you've
    already done those things before doing the scheduling.
  </small><i>

  ${htmlBlock(`
<button id="play-in-one-second">Play in One Second</button>
  `)}

  ${codeBlock(`
import { createSound, getAudioContext } from 'ez-web-audio'

const button = document.getElementById('play-in-one-second')
button.addEventListener('click', async () => {
  const sound = await createSound('Db5.mp3')
  const audioContext = await getAudioContext()
  const now = audioContext.currentTime
  sound.playAt(now + 1)
})
  `)}

<p>
  By using a ${inlineCode('Sound')}'s ${inlineCode('playIn')} method, ${inlineCode('currentTime')} is handled for you, so this can be made even simpler.
</p>

  ${codeBlock(`
import { createSound, getAudioContext } from 'ez-web-audio'

const button = document.getElementById('play-in-one-second')
button.addEventListener('click', async () => {
  const sound = await createSound('Db5.mp3')
  sound.playIn(1)
})
  `)}

</div>
`,
}

export default Content
