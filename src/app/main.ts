import './public/style.css'
import { setupRouter } from './router'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<a href="/ez-audio/" id="index">Home</a>
|
<a href="/ez-audio/audio-files" id="audio-files">Audio Files</a>
|
<a href="/ez-audio/audio-routing" id="audio-routing">Audio Routing</a>
|
<a href="/ez-audio/synthesis" id="synthesis">Synthesis</a>
<hr/>
<div id="main-page"></div>
`

setupRouter(document.querySelector<HTMLAnchorElement>('#index')!)
setupRouter(document.querySelector<HTMLAnchorElement>('#audio-routing')!)
setupRouter(document.querySelector<HTMLAnchorElement>('#synthesis')!)
