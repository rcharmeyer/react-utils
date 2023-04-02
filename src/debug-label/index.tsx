import { useDebugValue, useEffect, useRef } from "react"

let setDebugLabel: ((label: string) => void) | undefined

let disabled = false

export function useDebugLabel (label: string) {
  const prevRef = useRef <string> (undefined as any)

  if (label !== prevRef.current) {
    prevRef.current = label
    setDebugLabel?.(label)
  }

  useDebugValue (label)
}

export function setDebugLabelListener (listener: (label: string) => void) {
  if (disabled) return () => {}

  if (setDebugLabel) {
    console.error ("setDebugLabel has not been cleaned up, there is a bug, this feature will be disabled")
    setDebugLabel = undefined
    disabled = true
    return () => {}
  }

  setDebugLabel = listener
  return () => {
    setDebugLabel = undefined
  }
}
