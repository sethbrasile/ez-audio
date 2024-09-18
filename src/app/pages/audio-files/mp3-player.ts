import nav from './nav'
import { setupIndicators, setupMp3Buttons } from './mp3-buttons'
import { codeBlock, htmlBlock, inlineCode } from '@/app/utils'

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

<small><i>Note: This example site is not using any frontend framework, it's done in vanilla typescript. For the sake of brevity,
these code examples are going to use Vue. This way we can remove the invevitable emphasis on how DOM manipulations were made
and instead focus on this library, which will work the same regardless of framework. If you'd like to see the actual source, head over to
the github repo for this project and take a look at ${inlineCode('src/app/pages/audio-files/mp3-player.ts')}.</i></small>

<div class="docs">

  <p>Let's start with our mp3 player component:</p>

${codeBlock(`
<script setup lang="ts">
import type { Track } from 'ez-audio'
import { computed } from 'vue'

const props = defineProps<{
  track: Track
}>()

const emits = defineEmits(['togglePlay', 'seek', 'changeGain'])

const percentPlayed = computed(() => \`width: \${props.track.percentPlayed}%;\`)
const percentGain = computed(() => \`height: \${props.track.percentGain}%;\`)

function seek(e: any) {
  const width = e.target.offsetParent.offsetWidth
  const newPosition = e.offsetX / width
  emits('seek', newPosition)
}

function changeVolume(e: any) {
  const height = e.target.offsetParent.offsetHeight
  const parentOffset
      = e.target.parentNode.getBoundingClientRect().top + window.scrollY
  const offset = e.pageY - parentOffset - document.documentElement.clientTop
  const adjustedHeight = height * 0.8
  const adjustedOffset = offset - (height - adjustedHeight) / 2
  const newGain = adjustedOffset / adjustedHeight
  emits('changeGain', newGain)
}
</script>
`)}


${htmlBlock(`
<template>
  <div class="audioplayer">
    <div role="button" class="play-pause" :class="{ playing: isPlaying }" @click="emits('togglePlay')">
      <a />
    </div>
    <div class="time current">
      {{ position }}
    </div>

    <div role="button" class="bar" @click="seek">
      <div style="width: 100%;" />
      <div class="played" :style="percentPlayed" />
    </div>

    <div class="time duration">
      {{ duration }}
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
<script setup lang="ts">
import type { Track } from 'ez-audio'
import { createTrack, initAudio } from 'ez-audio'
import { computed, ref } from 'vue'
import Mp3Player from './components/Mp3Player.vue'

interface Song {
  name: string
  trackInstance?: Track
  description: string
}

const selectedSong = ref<Song | null>(null)
const track = computed(() => selectedSong.value?.trackInstance)
const loading = ref(false)

const tracks: Song[] = [
  {
    name: 'barely-there',
    description: '...',
  },
  {
    name: 'do-wah-diddy',
    description: '...',
  },
]

async function selectTrack(name: string) {
  selectedSong.value?.trackInstance?.pause()

  loading.value = true
  selectedSong.value = null

  const track = tracks.find(track => track.name === name)
  if (!track)
    throw (new Error('Balls! Did not find that track!'))
  if (!track.trackInstance) {
    await initAudio()
    track.trackInstance = await createTrack(\`node_modules/ez-audio/dist/\${name}.mp3\`)
  }

  selectedSong.value = track
  loading.value = false
}

function togglePlay() {
  const track = selectedSong.value?.trackInstance
  if (track?.isPlaying) {
    track.pause()
  }
  else {
    track?.play()
  }
}
</script>
`)}

${htmlBlock(`
<template>
  <h1>MP3 Player Example</h1>
  <div class="track-list">
    <div class="select">
      <table>
        <tbody>
          <tr class="pointer" @click="selectTrack('barely-there')">
            <td>Barely There</td>
          </tr>
          <tr class="pointer" @click="selectTrack('do-wah-diddy')">
            <td>Do Wah Diddy</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="description">
      <p v-if="!selectedSong" id="description">
        Select a track...
      </p>
      <p v-else>
        {{ selectedSong.description }}
      </p>
    </div>
  </div>

  <Mp3Player
    v-if="track"
    :percent-played="track.percentPlayed"
    :percent-gain="track.percentGain"
    :position="track.position.string"
    :duration="track.position.string"
    :is-playing="track.isPlaying"
    @change-gain="(newGain) => track?.changeGainTo(newGain).from('inverseRatio')"
    @seek="(newPosition) => track?.seek(newPosition).from('ratio')"
    @toggle-play="togglePlay"
  />

  <div v-if="loading" class="spinner">
    <div class="rect1" />
    <div class="rect2" />
    <div class="rect3" />
    <div class="rect4" />
    <div class="rect5" />
  </div>
</template>
`)}
</div>
`,
}

export default Content
