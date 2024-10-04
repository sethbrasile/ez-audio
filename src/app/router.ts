import Index from '@app/pages/index'
import Prism from 'prismjs'
import type { Component } from '@app/utils'
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

const routes: { [key: string]: Component } = {
  '': Index,
  'synthesis': Synthesis,
  'synthesis/drum-kit': SynthesisDrum,
  'synthesis/xy-pad': SynthesisXY,
  'timing': Timing,
  'timing/with-ez-web-audio': TimingWithEzAudio,
  'timing/drum-machine': TimingDrumMachine,
  'audio-routing': AudioRouting,
  'audio-files': AudioFiles,
  'audio-files/mp3-player': AudioFilesMp3,
  'audio-files/drum-kit': AudioFilesDrumKit,
  'sound-fonts': SoundFontsPiano,
  'sound-fonts/note-objects': SoundFontsNoteObjects,
  'starting-audiocontext': StartingAudioContext,
}

export function handleLocation(): void {
  let hash = window.location.hash.toLowerCase()
  let pathname = window.location.pathname.toLowerCase()

  if (pathname !== '/ez-web-audio/' || !hash) {
    window.history.pushState({}, '', '/ez-web-audio/#/')
    hash = window.location.hash.toLowerCase()
    pathname = window.location.pathname.toLowerCase()
  }

  if (!hash)
    return

  const route = routes[hash.replace('#/', '')]
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
}

export function navigate(event: Event): void {
  const target = event.target as HTMLAnchorElement
  const href = target.href
  event = event || window.event
  event.preventDefault()
  window.history.pushState({}, '', href)
  handleLocation()
}

export function setupRouter(element: HTMLAnchorElement): void {
  element.addEventListener('click', navigate)
  window.onpopstate = handleLocation
}
