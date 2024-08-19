export function setupPlayButton(element: HTMLButtonElement) {
  const play = () => {
    console.log("play!")
  }

  element.addEventListener('click', () => play())
}
