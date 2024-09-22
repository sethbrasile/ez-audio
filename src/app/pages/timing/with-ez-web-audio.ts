import { codeBlock, inlineCode } from '../../utils'
import nav from './nav'

const Content = {
  setup() {
    // const keys = document.querySelector<HTMLOListElement>('#keys')
    // setupPiano(keys!)
  },
  html: `

${nav}

<h1>Timing with EZ Web Audio</h1>

<div class="docs">
  <p>There are two ways to schedule sounds with EZ Web Audio:</p>

  <h2>1. Manually passing a time to a Sound or a Track</h2>

  <p>
    Using a fixed moment in time with the ${inlineCode('playAt')} method, or by using an amount
    of time from now with the ${inlineCode('playIn')} method.
  </p>

  ${codeBlock(`
import { createSound, initAudio, getAudioContext } from 'ez-web-audio'

await initAudio()
const sound = await createSound('some-sound.wav')

// some time later...

const now = (await getAudioContext()).currentTime
sound.playAt(now + 1) // plays in 1 second
// or
sound.playIn(1) // plays in 1 second
  `)}

  <h2>2. By using a BeatTrack</h2>

  ${codeBlock(`
import { createBeatTrack, initAudio, getAudioContext } from 'ez-web-audio'

const BPM = 120
await initAudio()
const beatTrack = await createBeatTrack('some-mp3.mp3')

// some time later...

// playBeats() accepts BPM and will play all the beatTrack's beats at that BPM,
beatTrack.playBeats(120);
  `)}

  <p>
    Instead of using beatTrack.playBeats, you can also call a Beat instance's playIn method directly,
    passing an amount of time from now (in seconds) that the beat should play.
  </p>

  ${codeBlock(`
// http://bradthemad.org/guitar/tempo_explanation.php
const eighthNoteDuration = (240 * 1/8) / BPM;

beatTrack.beats.forEach((beat, beatIndex) => {
  // Each "beat" is a "Beat" instance
  beat.playIn(beatIndex * eighthNoteDuration);
});
  `)}
</div>
`,
}

export default Content
