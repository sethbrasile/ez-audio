import './public/style.css'
// import 'prismjs/themes/prism-tomorrow.css'
// import 'prismjs/plugins/line-numbers/prism-line-numbers.css'

// import typescriptLogo from './public/typescript.svg'
// import viteLogo from './public/vite.svg'

import { setupNav } from './setup-nav.ts'

// Then register the languages you need

// <a href="https://vitejs.dev" target="_blank">
//   <img src="${viteLogo}" class="logo" alt="Vite logo" />
// </a>
// <a href="https://www.typescriptlang.org/" target="_blank">
//   <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
// </a>
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<a href="/" id="index">INDEX</a>
|
<a href="/routing" id="routing">AUDIO ROUTING</a>
|
<a href="/synthesis" id="synthesis">SYNTHESIS</a>
<div id="main-page"></div>
`
setupNav(document.querySelector<HTMLAnchorElement>('#index')!)
setupNav(document.querySelector<HTMLAnchorElement>('#routing')!)
setupNav(document.querySelector<HTMLAnchorElement>('#synthesis')!)
