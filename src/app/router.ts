import Index from '@app/pages/index'
import Prism from 'prismjs'
import Synthesis from './pages/synthesis/synthesis'
import SynthesisDrum from './pages/synthesis/drum-kit'
import SynthesisXY from './pages/synthesis/xy-pad'
import AudioRouting from './pages/audio-routing'
import AudioFilesSimple from './pages/audio-files/simple'
import AudioFilesMp3 from './pages/audio-files/mp3-player'
import AudioFilesDrumKit from './pages/audio-files/drum-kit'
import SoundFontsPiano from './pages/sound-fonts/piano'
import SoundFontsNoteObjects from './pages/sound-fonts/note-objects'

const routes = {
  '/ez-audio/': Index,
  '/ez-audio/synthesis': Synthesis,
  '/ez-audio/synthesis/drum-kit': SynthesisDrum,
  '/ez-audio/synthesis/xy-pad': SynthesisXY,
  '/ez-audio/audio-routing': AudioRouting,
  '/ez-audio/audio-files': AudioFilesSimple,
  '/ez-audio/audio-files/mp3-player': AudioFilesMp3,
  '/ez-audio/audio-files/drum-kit': AudioFilesDrumKit,
  '/ez-audio/sound-fonts': SoundFontsPiano,
  '/ez-audio/sound-fonts/note-objects': SoundFontsNoteObjects,
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
