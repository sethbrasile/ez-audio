import { observable, observe } from '@nx-js/observer-util'
import { Connector } from '@common/connector'
import Playable from '@common/player'
import { get, set } from '@utils/prop-access'
import Connection from './common/connection'

export interface OscillatorOptions {
  type?: OscillatorType
  frequency?: number
  gain?: number
  allpass?: BiquadFilterOptions
  highpass?: BiquadFilterOptions
  lowpass?: BiquadFilterOptions
  bandpass?: BiquadFilterOptions
  highshelf?: BiquadFilterOptions
  lowshelf?: BiquadFilterOptions
  notch?: BiquadFilterOptions
  peaking?: BiquadFilterOptions
  // detune?: number
}

/**
 * A class that represents an oscillator for a synthesizer. Capable of creating
 * and playing a waveform of specified `type` at a specified `frequency`.
 *
 * All filters from {{#crossLink "BiquadFilterNode"}}{{/crossLink}} are
 * available and can be enabled by providing a pojo for a given filter.
 *
 *     // 200Hz sine wave w/highpass at 600Hz and lowpass created but not filtering
 *     const osc = audioService.createOscillator({
 *       frequency: 200,
 *       highpass: { frequency: 600 },
 *       lowpass: {}
 *     });
 *
 *     // or
 *     import { Oscillator } from 'ember-audio';
 *     const audioContext = audioService.get('audioContext');
 *     const osc = Oscillator.create({
 *       audioContext,
 *       frequency: 200,
 *       highpass: { frequency: 600 },
 *       lowpass: {}
 *     });
 *
 * @public
 * @class Oscillator
 * @uses Connectable
 * @uses Playable
 * @todo figure out why `isPlaying` isn't working for Oscillator
 */
export class Oscillator {
  constructor(opts: OscillatorOptions = {}) {
    this.type = opts.type || 'sine'
    this.frequency = opts.frequency || 440
    this.gain = opts.gain || 1
    this._initConnections()
  }

  /**
   * Determines the type of wave output by the OscillatorNode instance.
   * Corresponds directly to `type` from
   * {{#crossLink "OscillatorNode"}}{{/crossLink}}
   *
   * @public
   * @property type
   * @type {string}
   * @default 'sine'
   */
  type: OscillatorType

  /**
   * Determines the frequency of the wave output by the OscillatorNode instance.
   * Corresponds directly to `frequency.value` from
   * {{#crossLink "OscillatorNode"}}{{/crossLink}}
   *
   * @public
   * @property frequency
   * @type {number}
   */
  frequency: number

  /**
   * Determines the `gain.value` of the GainNode instance in the `gain`
   * connection instance. Corresponds directly to `gain.value` from
   * {{#crossLink "GainNode"}}{{/crossLink}}
   *
   * @public
   * @property gain
   * @type {number}
   */
  gain: number

  /**
   * Lists available filter types.
   *
   * @private
   * @property _filters
   * @type {Array<BiquadFilterType>}
   */
  _filters: BiquadFilterType[] = [
    'lowpass',
    'highpass',
    'bandpass',
    'lowshelf',
    'highshelf',
    'peaking',
    'notch',
    'allpass',
  ]

  /**
   * Initializes default connections on Oscillator instantiation. Runs `on('init')`.
   *
   * @protected
   * @method _initConnections
   */
  _initConnections() {
    const bufferSource = this._createBufferSource()
    const gain = this._createGainNode()
    const panner = this._createPannerNode()
    const destination = this._createDestinationNode()

    // always start with source
    let connections = [bufferSource]

    // Add filters if they have been defined
    this._filters.map((filterName) => {
      const filterIsDefined = this.get(filterName) !== null

      if (filterIsDefined) {
        connections.push(this._createFilter(filterName))
      }
    })

    // add gain, panner, and destination connections
    connections.push(gain, panner, destination)

    connections = observable(connections)

    this.connections = connections
    // observe(() => {
    //   this.wireConnections('oscillator observer initConnections', this.connections)
    // })
    // this.wireConnections('oscillator initConnections', this.connections)
  }

  _initFilters(opts: OscillatorOptions) {
    this._filters.map((filterName) => {
      const filter = opts[filterName]
      if (filter !== null) {
        this.set(filterName, filter)
      }
    })
  }

  /**
   * Creates a Connection instance backed with an `Oscillator` node.
   *
   * @private
   * @method _createBufferSource
   *
   * @return {Connection} A connection backed with an `Oscillator` node.
   */
  _createBufferSource() {
    return new Connection({
      name: 'audioSource',
      createdOnPlay: true,
      source: 'audioContext',
      createCommand: 'createOscillator',
      onPlaySetAttrsOnNode: [
        {
          attrNameOnNode: 'frequency.value',
          relativePath: 'frequency',
        },
        {
          attrNameOnNode: 'type',
          relativePath: 'type',
        },
      ],
    })
  }

  /**
   * Creates a Connection instance backed with a `Gain` node.
   *
   * @private
   * @method _createGainNode
   *
   * @return {Connection} A connection backed with a `Gain` node.
   */
  _createGainNode() {
    return new Connection({
      name: 'gain',
      source: 'audioContext',
      createCommand: 'createGain',
      onPlaySetAttrsOnNode: [
        {
          attrNameOnNode: 'gain.value',
          relativePath: 'gain',
        },
      ],
    })
  }

  /**
   * Creates a Connection instance backed with a `Panner` node.
   *
   * @private
   * @method _createPannerNode
   *
   * @return {Connection} A connection backed with a `Panner` node.
   */
  _createPannerNode() {
    return new Connection({
      name: 'panner',
      source: 'audioContext',
      createCommand: 'createStereoPanner',
    })
  }

  /**
   * Creates a Connection instance backed with a `Destination` node.
   *
   * @private
   * @method _createDestinationNode
   *
   * @return {Connection} A connection backed with a `Destination` node.
   */
  _createDestinationNode() {
    return new Connection({
      name: 'destination',
      path: 'audioContext.destination',
    })
  }

  /**
   * Creates a Connection instance with a filter of the specified type.
   *
   * @private
   * @method _createFilter
   *
   * @param {string} type Determines what type of filter will be created.
   *
   * @return {Connection} A connection with a BiquadFilterNode of the specified
   * type.
   */
  _createFilter(type: BiquadFilterType) {
    return new Connection({
      name: type,
      source: 'audioContext',
      createCommand: 'createBiquadFilter',
      onPlaySetAttrsOnNode: [
        {
          attrNameOnNode: 'type',
          value: type,
        },
        {
          attrNameOnNode: 'frequency.value',
          relativePath: `${type}.frequency`,
        },
        {
          attrNameOnNode: 'q.value',
          relativePath: `${type}.q`,
        },
        {
          attrNameOnNode: 'gain.value',
          relativePath: `${type}.gain`,
        },
      ],
    })
  }

  /**
   * Settings object for the lowpass filter. The lowpass filter is disabled
   * if this is not provided. Accepts `frequency` and `q`.
   * https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
   *
   * @public
   * @property lowpass
   * @type {object}
   */
  lowpass: BiquadFilterOptions | null = null

  /**
   * Settings object for the highpass filter. The highpass filter is disabled
   * if this is not provided. Accepts `frequency` and `q`.
   * https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
   *
   * @public
   * @property highpass
   * @type {object}
   */
  highpass: BiquadFilterOptions | null = null

  /**
   * Settings object for the bandpass filter. The bandpass filter is disabled
   * if this is not provided. Accepts `frequency` and `q`.
   * https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
   *
   * @public
   * @property bandpass
   * @type {object}
   */
  bandpass: BiquadFilterOptions | null = null

  /**
   * Settings object for the lowshelf filter. The lowshelf filter is disabled
   * if this is not provided. Accepts `frequency` and `gain`.
   * https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
   *
   * @public
   * @property lowshelf
   * @type {object}
   */
  lowshelf: BiquadFilterOptions | null = null

  /**
   * Settings object for the highshelf filter. The highshelf filter is disabled
   * if this is not provided. Accepts `frequency` and `gain`.
   * https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
   *
   * @public
   * @property highshelf
   * @type {object}
   */
  highshelf: BiquadFilterOptions | null = null

  /**
   * Settings object for the peaking filter. The peaking filter is disabled
   * if this is not provided. Accepts `frequency`, `q`, and `gain`.
   * https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
   *
   * @public
   * @property peaking
   * @type {object}
   */
  peaking: BiquadFilterOptions | null = null

  /**
   * Settings object for the notch filter. The notch filter is disabled
   * if this is not provided. Accepts `frequency` and `q`.
   * https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
   *
   * @public
   * @property notch
   * @type {object}
   */
  notch: BiquadFilterOptions | null = null

  /**
   * Settings object for the allpass filter. The allpass filter is disabled
   * if this is not provided. Accepts `frequency`, and `q`.
   * https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
   *
   * @public
   * @property allpass
   * @type {object}
   */
  allpass: BiquadFilterOptions | null = null
}
