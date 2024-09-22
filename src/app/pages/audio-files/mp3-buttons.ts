import { observable, observe, unobserve } from '@nx-js/observer-util'
import { createTrack, initAudio } from '@/index'
import type { Track } from '@/track'

type SongName = 'do-wah-diddy' | 'barely-there'

interface Song {
  name: SongName
  trackInstance: Track | null
  description: string
}

const songs: Song[] = [
  {
    name: 'barely-there',
    trackInstance: null, // After it's loaded, we will place the audio data here
    description: `I used to play bass and sing ("clean" vocals) in a metalcore band called "Bringing Down Broadway" and this is one of our songs. The album is titled, "It's all Gone South", I recorded it myself, and it was a commercial failure. I think it's awesome.`,
  },
  {
    name: 'do-wah-diddy',
    trackInstance: null,
    description: `My friend David Denison and I recorded this song in a living room with a Korg Electribe, a garbage laptop, and a broken logitech PC mic (we had to literally hold it together while using it), for fun. This is from about 2008. David is "rapping" and I'm singing. If you can't tell, Fallout Boy and that Gym Class Heroes song was popular at the time lol. This is the only place that this song has ever been published.`,
  },
]

let selectedSong: Song
let duration: HTMLDivElement,
  playButton: HTMLButtonElement,
  volDisplay: HTMLDivElement,
  progress: HTMLDivElement,
  current: HTMLDivElement,
  description: HTMLDivElement,
  loading: HTMLDivElement,
  player: HTMLDivElement

export function setupIndicators(element: HTMLDivElement, type: 'duration' | 'progress' | 'current' | 'description' | 'loading' | 'player' | 'vol'): void {
  switch (type) {
    case 'duration':
      duration = element
      break
    case 'progress':
      progress = element
      break
    case 'current':
      current = element
      break
    case 'description':
      description = element
      break
    case 'loading':
      loading = element
      break
    case 'player':
      player = element
      break
    case 'vol':
      volDisplay = element
      break
    default:
      throw new Error(`Unknown element type: ${type}`)
  }
}

async function updateIndicators(): Promise<void> {
  const track = selectedSong.trackInstance
  if (!track) {
    throw new Error('Cannot update UI, selectedSong.trackInstance is null')
  }

  if (track.isPlaying) {
    playButton.classList.add('playing')
  }
  else {
    playButton.classList.remove('playing')
  }

  description.textContent = selectedSong.description
  duration.textContent = track.duration.string
  current.textContent = track.position.string
  player.classList.remove('hidden')
}

let progressObserver: (() => void) | null = null

async function updateTrackSelectionUi(el: HTMLButtonElement): Promise<void> {
  // if any of the UI elements are missing, throw an error
  if (!duration || !progress || !current || !description || !loading || !player) {
    throw new Error('Cannot update mp3 player, Missing UI elements')
  }

  if (!selectedSong) {
    throw new Error('Cannot update mp3 player ui. No selected song.')
  }

  if (progressObserver) {
    unobserve(progressObserver)
  }

  // remove any existing selected items
  document.querySelector('.selected')?.classList.remove('selected')
  // add selected class to the new item
  el.classList.add('selected')

  // There is a selected song
  if (!selectedSong.trackInstance) {
    // There is no track instance, so we need to load it
    player.classList.add('hidden')
    loading.classList.remove('hidden')
    const track = await createTrack(`/ez-web-audio/${selectedSong.name}.mp3`)
    selectedSong.trackInstance = observable(track)
    loading.classList.add('hidden')
  }

  progressObserver = observe(() => {
    progress.style.width = `${selectedSong.trackInstance?.percentPlayed}%`
  })

  updateIndicators()
}

function playAction(): void {
  if (!selectedSong.trackInstance) {
    throw new Error('Cannot play song, selectedSong.trackInstance is null')
  }
  const track = selectedSong.trackInstance

  if (track.isPlaying) {
    track.pause()
  }
  else {
    track.play()
  }

  updateIndicators()
}

function seekAction(e: MouseEvent): void {
  // @ts-expect-error typescript is wrong
  const width = e.target?.offsetParent.offsetWidth as number
  const newPosition = e.offsetX / width
  selectedSong.trackInstance?.seek(newPosition).from('ratio')
}

function volAction(e: MouseEvent): void {
  // @ts-expect-error typescript is wrong
  const height = e.target?.offsetParent.offsetHeight
  // @ts-expect-error typescript is wrong
  const parentOffset = e.target?.parentNode.getBoundingClientRect().top + window.pageYOffset
  const offset = e.pageY - parentOffset - document.documentElement.clientTop
  const adjustedHeight = height * 0.8
  const adjustedOffset = offset - (height - adjustedHeight) / 2
  let newGain = adjustedOffset / adjustedHeight

  if (newGain < 0)
    newGain = 0
  if (newGain > 1)
    newGain = 1

  selectedSong.trackInstance?.changeGainTo(newGain).from('inverseRatio')
  volDisplay.style.height = `${selectedSong.trackInstance?.percentGain}%`
}

function selectAction(name: SongName, el: HTMLButtonElement): void {
  if (selectedSong && selectedSong.name === name) {
    // if the song was already selected, do nothing
    return
  }

  // If there was already a song playing, pause it
  if (selectedSong?.trackInstance) {
    selectedSong.trackInstance.pause()
  }

  // if the song was not selected, select it and update UI
  selectedSong = songs.find(song => song.name === name)!

  updateTrackSelectionUi(el)
}

export function setupMp3Buttons(element: HTMLButtonElement, type: 'seek' | 'play' | 'vol' | 'select', name?: SongName): void {
  async function setup(): Promise<void> {
    await initAudio()
    // remove the setup listener
    element.removeEventListener('click', setup)
  }

  // This is just to initialize audio context on click of any element
  element.addEventListener('click', setup)

  switch (type) {
    case 'play':
      playButton = element
      element.addEventListener('click', playAction)
      break
    case 'seek':
      element.addEventListener('click', seekAction)
      break
    case 'select':
      element.addEventListener('click', () => selectAction(name!, element))
      break
    case 'vol':
      element.addEventListener('click', volAction)
      break
  }
}
