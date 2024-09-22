import Index from '@app/pages/index'
import Prism from 'prismjs'
import Synthesis from './pages/synthesis'
import Timing from './pages/timing'
import TimingWithEzAudio from './pages/timing/with-ez-web-audio'
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
  '/ez-web-audio/': Index,
  '/ez-web-audio/synthesis': Synthesis,
  '/ez-web-audio/synthesis/drum-kit': SynthesisDrum,
  '/ez-web-audio/synthesis/xy-pad': SynthesisXY,
  '/ez-web-audio/timing': Timing,
  '/ez-web-audio/timing/with-ez-web-audio': TimingWithEzAudio,
  '/ez-web-audio/timing/drum-machine': TimingDrumMachine,
  '/ez-web-audio/audio-routing': AudioRouting,
  '/ez-web-audio/audio-files': AudioFiles,
  '/ez-web-audio/audio-files/mp3-player': AudioFilesMp3,
  '/ez-web-audio/audio-files/drum-kit': AudioFilesDrumKit,
  '/ez-web-audio/sound-fonts': SoundFontsPiano,
  '/ez-web-audio/sound-fonts/note-objects': SoundFontsNoteObjects,
  '/ez-web-audio/starting-audiocontext': StartingAudioContext,
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
