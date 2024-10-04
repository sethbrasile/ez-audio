import { codeBlock } from '@app/utils'
import nav from './nav'

const Content = {
  setup() {
    nav.setup()
  },
  html: `

${nav}

<h1>XY Pad Example</h1>

<div class="docs">
  ${codeBlock('// [WIP] coming soon!')}
</div>
`,
}

export default Content
