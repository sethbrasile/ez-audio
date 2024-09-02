import './public/style.css'
import { setupNav } from './setup-nav.ts'

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

setupNav(document.querySelector<HTMLAnchorElement>('#index')!)
setupNav(document.querySelector<HTMLAnchorElement>('#audio-routing')!)
setupNav(document.querySelector<HTMLAnchorElement>('#synthesis')!)
