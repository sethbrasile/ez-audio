import { type Link, createNav } from '@app/utils/nav'

const path = 'sound-fonts'

const links: Link[] = [
  {
    path,
    text: 'Piano Example',
  },
  {
    path,
    subPath: 'note-objects',
    text: 'Note Objects',
  },
]

export default createNav(links)
