import AudioService from '@/audio-service'

export function createSnareOscillator() {
  const audioService = AudioService.instance
  const snare = audioService.createOscillator('snare')
  const osc = snare.getConnection('audioSource')
  const gain = snare.getConnection('gain')
  osc.onPlayRamp('frequency').from(100).to(60).in(0.1)
  gain.onPlayRamp('gain').from(1).to(0.01).in(0.1)
  return snare
}

export function createSnareNoise() {
  const audioService = AudioService.instance
  const noise = audioService.createWhiteNoise()
  const gain = noise.getConnection('gain')
  gain.onPlayRamp('gain').from(1).to(0.001).in(0.1)
  return noise
}
