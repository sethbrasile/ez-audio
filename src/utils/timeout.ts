interface Task {
  id: number
  due: number
  fn: () => void
}

// AudioContext-aware and AudioContext-precise setTimeout and clearTimeout.
export default function customTimeout(audioContext: AudioContext) {
  let tasks: Task[] = []
  let nextTaskId = 1

  function now() {
    return audioContext.currentTime * 1000
  }

  function scheduler() {
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
