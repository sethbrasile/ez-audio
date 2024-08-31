import type { ControlType } from '@/param-controller'

export interface Connection { audioNode: AudioNode, name: string }
export interface Connectable {
  connections: Connection[]
  update: (type: ControlType, value: number) => void
  getNode: (name: string) => AudioNode | undefined
}
