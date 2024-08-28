import type { TimeObject } from '@utils/create-time-object'
import type { ConnectionType, ParameterController } from '@/audio-service'

export interface Player {
  play: () => void
  // playIn: (when: number) => void
  // playFor: (duration: number) => void
  // playInAndStopAfter: (playIn: number, stopAfter: number) => void
  stop: () => void
  // stopIn: (seconds: number) => void
  // stopAt: (time: number) => void
  // stopAfter: (duration: number) => void
  getConnection: (type: ConnectionType) => ParameterController
  isPlaying: boolean
  duration: TimeObject
}

export interface Playable {
  player: Player
}
