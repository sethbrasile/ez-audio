import Index from '@app/pages/index'
import Prism from 'prismjs'
import Synthesis from './pages/synthesis'
import Timing from './pages/timing'
import TimingWithEzAudio from './pages/timing/with-ez-audio'
import TimingDrumMachine from './pages/timing/drum-machine'
import SynthesisDrum from './pages/synthesis/drum-kit'
import SynthesisXY from './pages/synthesis/xy-pad'
import AudioRouting from './pages/audio-routing'
import AudioFiles from './pages/audio-files'
import AudioFilesMp3 from './pages/audio-files/mp3-player'
import AudioFilesDrumKit from './pages/audio-files/drum-kit'
import SoundFontsPiano from './pages/sound-fonts'
import SoundFontsNoteObjects from './pages/sound-fonts/note-objects'
import StartingAudioContext from './pages/starting-audiocontext'

const routes = {
  '/ez-audio/': Index,
  '/ez-audio/synthesis': Synthesis,
  '/ez-audio/synthesis/drum-kit': SynthesisDrum,
  '/ez-audio/synthesis/xy-pad': SynthesisXY,
  '/ez-audio/timing': Timing,
  '/ez-audio/timing/with-ez-audio': TimingWithEzAudio,
  '/ez-audio/timing/drum-machine': TimingDrumMachine,
  '/ez-audio/audio-routing': AudioRouting,
  '/ez-audio/audio-files': AudioFiles,
  '/ez-audio/audio-files/mp3-player': AudioFilesMp3,
  '/ez-audio/audio-files/drum-kit': AudioFilesDrumKit,
  '/ez-audio/sound-fonts': SoundFontsPiano,
  '/ez-audio/sound-fonts/note-objects': SoundFontsNoteObjects,
  '/ez-audio/starting-audiocontext': StartingAudioContext,
}

let debouncer = false

function handleLocation(): void {
  if (debouncer)
    return

  const path = window.location.pathname as keyof typeof routes
  const route = routes[path]

  const main = document.getElementById('main-page')
  if (!main)
    return

  if (!route) {
    main.innerHTML = 'Not Found'
    return
  }

  main.innerHTML = route.html
  route.setup()
  Prism.highlightAll()

  debouncer = true
}

export function route(event: Event): void {
  const target = event.target as HTMLAnchorElement
  const href = target.href
  event = event || window.event
  event.preventDefault()
  window.history.pushState({}, '', href)
  handleLocation()
}

export function setupRouter(element: HTMLAnchorElement): void {
  const setup = (event: Event): void => {
    debouncer = false
    event.preventDefault()
    route(event)
  }

  element.addEventListener('click', setup)

  window.onpopstate = handleLocation

  handleLocation()
}
