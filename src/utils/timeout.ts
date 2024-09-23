import type { AudioContext as AudioContextMock } from 'standardized-audio-context-mock'

interface Task {
  id: number
  due: number
  fn: () => void
}

// AudioContext-aware and AudioContext-precise setTimeout and clearTimeout.
export default function audioContextAwareTimeout(audioContext: AudioContext | BaseAudioContext | AudioContextMock): {
  setTimeout: (fn: () => void, delayMillis: number) => number
  clearTimeout: (id: number) => void
} {
  if (!audioContext) {
    console.warn(`ez-web-audio: AudioContext was not available when an entity was created and timing tasks will therefore use javascript native \
setTimeout instead of AudioContext-aware versions. Please ensure to await initAudio before instantiating any timing-sensitive entities. If your application \
is behaving as you'd hope, you can safely ignore this message.`)
    return {
      setTimeout: window.setTimeout.bind(window),
      clearTimeout: window.clearTimeout.bind(window),
    }
  }

  let tasks: Task[] = []
  let nextTaskId = 1

  function now(): number {
    return audioContext.currentTime * 1000
  }

  function scheduler(): void {
    const currentTime = now()

    // Call due tasks
    tasks.forEach((task) => {
      if (task.due <= currentTime)
        task.fn()
    })

    // Then remove them from the list.
    tasks = tasks.filter(task => task.due > currentTime)

    // More tasks pending, keep calling the scheduler.
    if (tasks.length > 0) {
      window.requestAnimationFrame(scheduler)
    }
  }

  return {
    setTimeout(fn: () => void, delayMillis: number) {
      const id = nextTaskId
      nextTaskId += 1
      tasks.push({
        id,
        due: now() + delayMillis,
        fn,
      })
      if (tasks.length === 1) {
        window.requestAnimationFrame(scheduler)
      }
      return id
    },
    clearTimeout(id: number) {
      tasks = tasks.filter(t => t.id !== id)
    },
  }
}

// export function audioContextAwareInterval(audioContext: AudioContext | BaseAudioContext): {
//   setInterval: (fn: () => void, delayMillis: number) => number
//   clearInterval: (id: number) => void
// } {

// }
