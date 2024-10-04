import { type Link, createNav } from '@app/utils/nav'

const path = 'synthesis'

const links: Link[] = [
  {
    path,
    text: 'Simple Piano',
  },
  {
    path,
    subPath: 'drum-kit',
    text: 'Drum Kit',
  },
  {
    path,
    subPath: 'xy-pad',
    text: 'XY Pad',
  },
]

export default createNav(links)
