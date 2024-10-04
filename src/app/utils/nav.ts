import { setupRouter } from '@app/router'
import type { Component } from '@app/utils'

export interface Link {
  subPath?: string
  path: string
  text: string
}

function generateLinkId(link: Link): string {
  return link.subPath ? `${link.path}-${link.subPath}` : link.path || link.text.toLowerCase().replace(' ', '')
}

export function createLink(link: Link): string {
  let out = `<a href="/ez-web-audio/#/${link.path}`
  if (link.subPath) {
    out += `/${link.subPath}`
  }
  out += `" id="${generateLinkId(link)}">${link.text}</a>`
  return out
}

export function createLinks(links: Link[]): string {
  return links.map((link, index) => {
    let out = createLink(link)
    if (index < links.length - 1) {
      out += ' | '
    }
    return out
  }).join('')
}

function createLinkClickHandler(links: Link[]): void {
  links.map((link) => {
    return setupRouter(document.querySelector<HTMLAnchorElement>(`#${generateLinkId(link)}`)!)
  })
}

export function createNav(links: Link[]): Component {
  return {
    setup() {
      return createLinkClickHandler(links)
    },
    html: createLinks(links),
    toString() {
      return this.html
    },
  }
}
