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
        <tr class="pointer" role="button" id="select-do-wah-diddy">
          <td>Do Wah Diddy</td>
        </tr>
        <tr class="pointer" role="button" id="select-barely-there">
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

  <h2>App Template</h2>

  ${htmlBlock(`
<template>
  <h1>MP3 Player Example</h1>
  <div class="track-list">
    <div class="select">
      <table>
        <tbody>
          <tr class="pointer" role="button" @click="selectTrack('barely-there')">
            <td>Barely There</td>
          </tr>
          <tr class="pointer" role="button" @click="selectTrack('do-wah-diddy')">
            <td>Do Wah Diddy</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="description">
      <p v-if="selectedSong">
        {{ selectedSong.description }}
      </p>
      <p v-else>
        Select a track...
      </p>
    </div>
  </div>

  <!-- Mp3Player accepts a Track instance and emits 3 events -->
  <Mp3Player
    v-if="!loading && track"
    :track="track"
    @change-gain="(newGain) => track?.changeGainTo(newGain).from('inverseRatio')"
    @seek="(newPosition) => track?.seek(newPosition).from('ratio')"
    @toggle-play="track.isPlaying ? track.pause() : track.play()"
  />

  <div v-if="loading">
    <!-- some loading display... -->
  </div>
</template>
  `)}

  <h2>App JS</h2>

  ${codeBlock(`
<script setup lang="ts">
import type { Track } from 'ez-web-audio'
import { createTrack, initAudio } from 'ez-web-audio'
import { computed, ref } from 'vue'
import Mp3Player from './components/Mp3Player.vue'
import { titleCase } from './utils'

interface Song {
  name: string
  trackInstance?: Track
  description: string
}

const loading = ref(false)
const selectedSong = ref<Song | null>(null)
const track = computed<Track | undefined>(() => selectedSong.value?.trackInstance)

// "barely-there.mp3" and "do-wah-diddy.mp3" are mp3 files located in this project's assets folder
const songs: Song[] = [
  {
    name: 'barely-there',
    description: '...',
    // trackInstance - After it's loaded, we will place the audio data here
  },
  {
    name: 'do-wah-diddy',
    description: '...',
  },
]

async function selectSong(song: Song) {
  selectedSong.value?.trackInstance?.pause()

  loading.value = true
  selectedSong.value = null

  if (!song.trackInstance) {
    await initAudio()
    song.trackInstance = await createTrack(\`/\${name}.mp3\`)
  }

  selectedSong.value = song
  loading.value = false
}
</script>
  `)}

  <h2>Mp3Player Component Template</h2>

  ${htmlBlock(`
<template>
  <div class="audioplayer">
    <div role="button" class="play-pause" :class="{ playing: track.isPlaying }" @click="emits('togglePlay')">
      <a />
    </div>
    <div class="time current">
      {{ track.position }}
    </div>

    <div role="button" class="bar" @click="seek">
      <div style="width: 100%;" />
      <div class="played" :style="percentPlayed" />
    </div>

    <div class="time duration">
      {{ track.duration }}
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

  <h2>Mp3Player Component JS</h2>

  ${codeBlock(`
<script setup lang="ts">
import type { Track } from 'ez-web-audio'
import { computed } from 'vue'

const props = defineProps<{
  track: Track
}>()

const emits = defineEmits(['togglePlay', 'seek', 'changeGain'])

const percentPlayed = computed(() => \`width: \${props.track.percentPlayed}%;\`)
const percentGain = computed(() => \`height: \${props.track.percentGain}%;\`)

function seek(e: any) {
  // Get width of clicked element's parent
  const width = e.target.offsetParent.offsetWidth
  // Divide click position by parent width
  const newPosition = e.offsetX / width
  // Set new position based on ratio
  emits('seek', newPosition)
}

function changeVolume(e: any) {
  // Get height of clicked element's parent
  const height = e.target?.offsetParent.offsetHeight
  const parentOffset
    = e.target?.parentNode.getBoundingClientRect().top + window.scrollY
  // Get click position
  const offset = e.pageY - parentOffset - document.documentElement.clientTop
  // Adjust height because height of element is 80% of parent's
  const adjustedHeight = height * 0.8
  // Adjust click position because height of element is 80% of parent's,
  // and element is centered vertically
  const adjustedOffset = offset - (height - adjustedHeight) / 2

  // We don't want to set gain out of bounds
  let newGain = adjustedOffset / adjustedHeight
  if (newGain < 0)
    newGain = 0
  if (newGain > 1)
    newGain = 1

  // Set new gain based on inverse ratio because Y coordinate is measured
  // from the top, but we want gain to be measured from the bottom
  emits('changeGain', newGain)
</script>
  `)}





</div>
`,
}

export default Content
