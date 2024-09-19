import { createOscillator } from '@/index'

export async function setupBassDropButton(element: HTMLButtonElement): Promise<void> {
  const drop = await createOscillator()
  drop.onPlayRamp('frequency').from(100).to(0.01).in(20)
  drop.onPlayRamp('gain', 'linear').from(1).to(0.01).in(4)
  element.addEventListener('click', () => drop.playFor(5))
}
