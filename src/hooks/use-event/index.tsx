import { useCallback, useRef } from "react"

type VoidFunc = (...args: any[]) => void

export function useEvent <T extends VoidFunc> (callback: T): T {
  const ref = useRef (callback)
  ref.current = callback
  
  const wrapped: VoidFunc = (...args) => {
    const res: any = ref.current (...args)
    if (res instanceof Promise) {
      console.warn ("useEvent callback should not be an async function")
    }
    else if (res !== undefined) {
      console.warn ("useEvent callback should return void")
    }
  }
  return useCallback (wrapped as T, [])
}
