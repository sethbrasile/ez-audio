import BufferSourcePlayer from '@players/buffer-source'
import type { Player } from '@players/player'
import type { ConnectionType } from '@/audio-service'
// TODO: add filters to sounds

// Mostly just a pass through to player. I expect other playable types to do more work. If they all end up pass throughs
// to their player, then get rid of the concept of a player.

/**
 * The Sound class provides the core functionality for
 * interacting with the Web Audio API's AudioContext, and is the base class for
 * all other {{#crossLinkModule "Audio"}}{{/crossLinkModule}} types. It prepares
 * an audio source, provides various methods for interacting with the audio source,
 * creates {{#crossLink "AudioNode"}}AudioNodes{{/crossLink}} from the
 * connections array, sets up the necessary connections/routing between them,
 * and provides some methods to {{#crossLink "Playable/play:method"}}{{/crossLink}}
 * and {{#crossLink "Sound/stop:method"}}{{/crossLink}} the audio source.
 *
 * @public
 * @class Sound
 * @uses Player
 * @satisfies Playable
 */
export class Sound {
  constructor(audioContext: AudioContext, opts: { audioBuffer: AudioBuffer }) {
    this.player = new BufferSourcePlayer(audioContext, opts.audioBuffer)
  }

  public player: Player

  play() {
    this.player.play()
  }

  stop() {
    this.player.stop()
  }

  getConnection(type: ConnectionType) {
    return this.player.getConnection(type)
  }

  get isPlaying() {
    return this.player.isPlaying
  }

  get duration() {
    return this.player.duration
  }
}
