import type { TimeObject } from '@utils/create-time-object'
import type { ControlType, RampType } from '@controllers/base-param-controller'

export interface Playable {
  play: () => void
  playAt: (time: number) => void
  playIn: (when: number) => void
  playFor: (duration: number) => void
  playInAndStopAfter: (playIn: number, stopAfter: number) => void
  stop: () => void
  stopIn: (seconds: number) => void
  stopAt: (time: number) => void
  // stopAfter: (duration: number) => void
  isPlaying: boolean
  duration: TimeObject

  onPlaySet: (type: ControlType) => {
    to: (value: number) => {
      at: (time: number) => void
      endingAt: (time: number, rampType?: RampType) => void
    }
  }

  onPlayRamp: (type: ControlType, rampType?: RampType) => {
    from: (startValue: number) => {
      to: (endValue: number) => {
        in: (endTime: number) => void
      }
    }
  }

}
