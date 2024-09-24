import { observable, observe } from '@nx-js/observer-util'
import nav from './nav'
import LoadingSpinner from '@/app/components/loading-spinner'
import PermissionBanner from '@/app/components/permission-banner'
import type { BeatTrack } from '@/beat-track'
import { createBeatTrack } from '@/index'
import { codeBlock } from '@/app/utils'

function loadBeatTrackFor(name: string): Promise<BeatTrack> {
  const urls = [1, 2, 3].map(num => `/ez-web-audio/drum-samples/${name}${num}.wav`)
  // default is 4 beats, but we're going to use 8 beats for this example
  return createBeatTrack(urls, { name, numBeats: 8, wrapWith: observable })
}

const Content = {
  async setup() {
    const spinner = LoadingSpinner.setup()
    PermissionBanner.setup()

    spinner.show()

    const beatTracks = await Promise.all([
      loadBeatTrackFor('kick'),
      loadBeatTrackFor('snare'),
      loadBeatTrackFor('hihat'),
    ])

    beatTracks.forEach((beatTrack) => {
      const { name } = beatTrack
      // snare and hihat are a little louder than kick, so we'll turn down the gain a bit
      if (name !== 'kick') {
        beatTrack.gain = 0.5
      }
      // and let's pan the hihat a little to the left
      if (name === 'hihat') {
        beatTrack.pan = -0.4
      }

      // get the lane for the beat track
      const lane = document.getElementById(`${name}-lane`)
      // add beat pads to the lane
      beatTrack.beats.forEach((beat) => {
        // to simplify showing when a given beat is playing, we will track currentTimeIsPlaying with an observer from nx-js

        const beatPad = document.createElement('div')
        beatPad.role = 'button'
        beatPad.classList.add('beat-pad')

        const pad = document.createElement('span')
        pad.classList.add('pad')

        observe(() => {
          if (beat.isPlaying) {
            pad.classList.add('playing')
          }
          else {
            pad.classList.remove('playing')
          }

          if (beat.currentTimeIsPlaying) {
            pad.classList.add('highlighted')
          }
          else {
            pad.classList.remove('highlighted')
          }

          if (beat.active) {
            pad.classList.add('active')
          }
          else {
            pad.classList.remove('active')
          }
        })

        lane?.appendChild(beatPad)
        beatPad.appendChild(pad)

        beatPad.addEventListener('click', () => {
          beat.active = !beat.active
          beat.playIfActive()
        })
      })
    })

    // hide the loading spinner
    spinner.hide()
    // show the beat machine
    document.getElementById('beat-machine')!.classList.remove('hidden')

    // set up the play button
    const playButton = document.getElementById('play-button')!
    const tempoInput = document.getElementById('tempo-input')! as HTMLInputElement
    playButton.addEventListener('click', () => {
      beatTracks.forEach((beatTrack) => {
        beatTrack.playActiveBeats(tempoInput.valueAsNumber, 1 / 8)
      })
    })
  },
  html: `

${nav}

<h1>Multisampled Drum Machine</h1>

${PermissionBanner}

<p>
  Below is an example of a drum machine that loads up three samples for each lane and allows you to program a drum beat.
  The sample is automatically alternated so you never hear the same sample back-to-back.
</p>

${LoadingSpinner}

<div id="beat-machine" class="hidden">
  <div class="controls">
    <button id="play-button">PLAY</button>
    <div class="space">
      <label>Tempo <Input value="120" id="tempo-input" type="number" /></label>
    </div>
  </div>

  <div id="kick-lane" class="lane">
    <p>Kick</p>
  </div>
  <div id="snare-lane" class="lane">
    <p>Snare</p>
  </div>
  <div id="hihat-lane" class="lane">
    <p>HiHat</p>
  </div>
</div>

<div class="docs">
  ${codeBlock('// code is [WIP]!')}
</div>
`,
}

export default Content
