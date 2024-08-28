import Index from '@app/pages/index'
import Prism from 'prismjs'
import Synthesis from './pages/synthesis'

const routes = {
  '404': '/pages/404.html',
  '/': 'index',
  '/synthesis': 'synthesis',
}

function handleLocation() {
  const path = window.location.pathname as keyof typeof routes
  const route = routes[path] || routes[404]

  const main = document.getElementById('main-page')
  if (!main)
    return

  switch (route) {
    case 'index':
      main.innerHTML = Index.html
      Index.setup()
      break
    case 'synthesis':
      main.innerHTML = Synthesis.html
      Synthesis.setup()
      break
    // default:
    //   main.innerHTML = NotFound()
    //   break
  }

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
  // window.route = route

  handleLocation()
}
