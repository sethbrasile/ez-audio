import { createOscillator } from '@/index'

export async function setupKickButton(element: HTMLButtonElement): Promise<void> {
  const kick = await createOscillator()
  kick.onPlayRamp('frequency').from(150).to(0.01).in(0.1)
  kick.onPlayRamp('gain').from(1).to(0.01).in(0.1)
  element.addEventListener('click', () => kick.playFor(0.1))
}
