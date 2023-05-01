type ReactPromise <T> = Promise<T> & {
  status?: 'pending' | 'fulfilled' | 'rejected'
  value?: T
  reason?: unknown
}

export function reactPromise <T> (promise: ReactPromise <T>): ReactPromise <T> {
  if (typeof promise.status === "string") return promise
  
  promise.status = 'pending'
  promise.then(
    (v) => {
      promise.status = 'fulfilled'
      promise.value = v
    },
    (e) => {
      promise.status = 'rejected'
      promise.reason = e
    }
  )
  return promise
}

export function readPromise <T> (promise: ReactPromise <T>): T {
  promise = reactPromise (promise)
  if (promise.status === 'fulfilled') return promise.value as T
  if (promise.status === 'rejected') throw promise.reason
  console.assert (promise.status === "pending")
  throw promise
}
