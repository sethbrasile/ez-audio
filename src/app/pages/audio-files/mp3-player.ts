import nav from './nav'
import { setupIndicators, setupMp3Buttons } from './mp3-buttons'
import { codeBlock, htmlBlock } from '@/app/utils'

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

<small><i>Note: This example site is not using any frontend framework, it's done in completely vanilla typescript. For the sake of brevity though,
these code examples are going to use Vue. This way we can remove the invevitable emphasis on how DOM manipulations were made
and instead focus on this library, which will work the same regardless of framework. If you'd like to see the actual source here, head over to
the github repo for this project and take a look in the "src/app" directory.</i></small>

<div class="docs">

<p>Let's start with our mp3 player component:</p>

${codeBlock(`
// <script setup lang="ts">
import type { Track } from 'ez-audio'
import { computed } from 'vue'

const props = defineProps<{ track?: Track }>()

const percentPlayed = computed(() => \`width: \${props.track.percentPlayed}%;\`)
const percentGain = computed(() => \`height: \${props.track.percentGain}%;\`)

async function togglePlay() {
  if (props.track.isPlaying) {
    props.track.pause()
  }
  else {
    props.track.play()
  }
}

function seek(e: any) {
  const width = e.target.offsetParent.offsetWidth
  const newPosition = e.offsetX / width
  props.track.seek(newPosition).from('ratio')
}

function changeVolume(e: any) {
  const height = e.target.offsetParent.offsetHeight
  const parentOffset
      = e.target.parentNode.getBoundingClientRect().top + window.scrollY
  const offset = e.pageY - parentOffset - document.documentElement.clientTop
  const adjustedHeight = height * 0.8
  const adjustedOffset = offset - (height - adjustedHeight) / 2
  const newGain = adjustedOffset / adjustedHeight

  props.track.changeGainTo(newGain).from('inverseRatio')
}
`)}

${htmlBlock(`
<template>
  <div v-if="track" class="audioplayer">
    <div role="button" class="play-pause" :class="{ playing: track.isPlaying }" @click="togglePlay">
      <a />
    </div>
    <div class="time current">
      {{ track.position.string }}
    </div>

    <div role="button" class="bar" @click="seek">
      <div style="width: 100%;" />
      <div class="played" :style="percentPlayed" />
    </div>

    <div class="time duration">
      {{ track.duration.string }}
    </div>

    <div role="button" class="volume" @click="changeVolume">
      <div class="button">
        <a />
      </div>

      <div class="adjust">
        <div>
          <div :style="percentGain" />
        </div>
      </div>
    </div>
  </div>
</template>
`)}

${codeBlock(`
import { createTrack, initAudio, type Track } from 'ez-audio'
import { ref } from 'vue'
import Mp3Player from './components/Mp3Player.vue'

interface Song {
  name: string
  trackInstance?: Track
  description: string
}

const selectedTrack = ref<Song | null>(null)
const loading = ref(false)

const tracks: Song[] = [
  {
    name: 'barely-there',
    trackInstance: null,
    description: '...',
  },
  {
    name: 'do-wah-diddy',
    trackInstance: null,
    description: '...',
  },
]
`)}
</div>
`,
}

export default Content
