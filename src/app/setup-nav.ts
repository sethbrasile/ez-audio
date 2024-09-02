import Index from '@app/pages/index'
import Prism from 'prismjs'
import Synthesis from './pages/synthesis'
import AudioRouting from './pages/audio-routing'
import AudioFilesSimple from './pages/audio-files/simple'
import AudioFilesMp3 from './pages/audio-files/mp3-player'
import AudioFilesDrumKit from './pages/audio-files/drum-kit'

const routes = {
  '/ez-audio/': Index,
  '/ez-audio/synthesis': Synthesis,
  '/ez-audio/audio-routing': AudioRouting,
  '/ez-audio/audio-files': AudioFilesSimple,
  '/ez-audio/audio-files/mp3-player': AudioFilesMp3,
  '/ez-audio/audio-files/drum-kit': AudioFilesDrumKit,
}

function handleLocation() {
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
}

export function route(event: Event) {
  const target = event.target as HTMLAnchorElement
  const href = target.href
  event = event || window.event
  event.preventDefault()
  window.history.pushState({}, '', href)
  handleLocation()
}

export function setupNav(element: HTMLAnchorElement) {
  const setup = async (event: Event) => {
    event.preventDefault()
    route(event)
  }

  element.addEventListener('click', setup)

  window.onpopstate = handleLocation

  handleLocation()
}
