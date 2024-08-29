import AudioService from '@/audio-service'

export function createSnareOscillator() {
  const audioService = AudioService.instance
  const snare = audioService.createOscillator('snare')
  snare.onPlayRamp('frequency').from(100).to(60).in(0.1)
  snare.onPlayRamp('gain').from(1).to(0.01).in(0.1)
  return snare
}

export function createSnareNoise() {
  const audioService = AudioService.instance
  const noise = audioService.createWhiteNoise()
  noise.onPlayRamp('gain').from(1).to(0.001).in(0.1)
  return noise
}
