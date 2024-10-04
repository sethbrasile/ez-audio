import { type Link, createNav } from '@app/utils/nav'

const path = 'audio-files'

const links: Link[] = [
  {
    path,
    text: 'Simple',
  },
  {
    path,
    subPath: 'mp3-player',
    text: 'MP3 Player',
  },
  {
    path,
    subPath: 'drum-kit',
    text: 'Multisampled Drum Kit',
  },
]

export default createNav(links)
