import type { ControlType } from '@controllers/base-param-controller'

export interface Connection { audioNode: AudioNode, name: string }
export interface Connectable {
  connections: Connection[]
  audioSourceNode: AudioNode
  percentGain: number
  update: (type: ControlType, value: number) => void
  getNodeFrom: (name: string) => AudioNode | undefined
  addConnection: (connection: Connection, name: string) => void
  removeConnection: (name: string) => void
  getConnection: (name: string) => Connection | undefined
  changePanTo: (value: number) => void
  changeGainTo: (value: number) => void
}
