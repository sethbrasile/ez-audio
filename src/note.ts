import { MusicallyAware } from '@/musical-identity'

/**
 * A class that represents a musical note, but does not carry any audio data.
 *
 * This class only makes sense when used in the context of a collection, as the
 * only functionality it provides serves to facilitate identification.
 *
 * @public
 * @class Note
 * @uses MusicalIdentity
 */
export default class Note extends MusicallyAware(class {}) {}
