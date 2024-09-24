import type { ControlType, RatioType } from '@controllers/base-param-controller'

export interface Connection { audioNode: AudioNode, name: string }
export interface Connectable {
  connections: Connection[]
  percentGain: number
  audioSourceNode: AudioNode
  getNodeFrom: (name: string) => AudioNode | undefined
  addConnection: (connection: Connection, name: string) => this
  removeConnection: (name: string) => this
  getConnection: (name: string) => Connection | undefined
  changePanTo: (value: number) => this
  changeGainTo: (value: number) => this
  update: (type: ControlType, value: number) => {
    to: (value: number) => {
      from: (method: RatioType) => void
    }
  }
}
