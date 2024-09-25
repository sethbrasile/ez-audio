import type { TimeObject } from '@utils/create-time-object'
import createTimeObject from '@utils/create-time-object'
import { SoundController } from './controllers/sound-controller'
import { BaseSound } from './base-sound'

/**
 * The Sound class provides the core functionality for
 * interacting with the Web Audio API's AudioContext, and is the base class for
 * all other {{#crossLinkModule "Audio"}}{{/crossLinkModule}} types. It prepares
 * an audio source, provides various methods for interacting with the audio source,
 * creates {{#crossLink "AudioNode"}}AudioNodes{{/crossLink}} from the
 * nodes array, sets up the necessary nodes/routing between them,
 * and provides some methods to {{#crossLink "Playable/play:method"}}{{/crossLink}}
 * and {{#crossLink "Sound/stop:method"}}{{/crossLink}} the audio source.
 *
 * @public
 * @class Sound
 * @implements Playable
 */
export class Sound extends BaseSound {
  public audioSourceNode: AudioBufferSourceNode
  protected controller: SoundController

  constructor(protected audioContext: AudioContext, private audioBuffer: AudioBuffer, opts?: any) {
    super(audioContext, opts)

    const audioSourceNode = audioContext.createBufferSource()
    audioSourceNode.buffer = audioBuffer

    this.audioSourceNode = audioSourceNode
    this.audioBuffer = audioBuffer
    this.controller = new SoundController(this.audioSourceNode, this.gainNode, this.pannerNode)
  }

  protected setup(): void {
    const audioSourceNode = this.audioContext.createBufferSource()
    audioSourceNode.buffer = this.audioBuffer
    this.audioSourceNode = audioSourceNode
    this.wireConnections()
    this.controller.setValuesAtTimes()
  }

  protected wireConnections(): void {
    // always start with the audio source
    const nodes: AudioNode[] = [this.audioSourceNode]
    const { connections, pannerNode } = this

    // add the nodes from nodes property
    for (let i = 0; i < connections.length; i++) {
      nodes.push(connections[i].audioNode)
    }

    // add the gain node and panner node
    nodes.push(this.gainNode)
    nodes.push(pannerNode)

    // connect them all together
    for (let i = 0; i < nodes.length - 1; i++) {
      nodes[i].connect(nodes[i + 1])
    }

    pannerNode.connect(this.audioContext.destination)
  }

  public get duration(): TimeObject {
    const buffer = this.audioSourceNode.buffer
    if (buffer === null)
      return createTimeObject(0, 0, 0)
    const { duration } = buffer
    const min = Math.floor(duration / 60)
    const sec = duration % 60
    return createTimeObject(duration, min, sec)
  }
}
