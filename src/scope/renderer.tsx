import { ComponentType, PureComponent, Suspense, useEffect } from "react"
import { setDebugLabelListener } from "../debug-label"

import { Snapshot, Store } from "./types"

export type RendererParams = {
  store: Store <any>,
  onChange: (snapshot: Snapshot) => void,
}

export function createRenderer (params: RendererParams) {
  const { store } = params
  let onChange = params.onChange

  const HookRenderer: ComponentType <{}> = () => {
    const cleanup = setDebugLabelListener (setLabel)

    try {
      const result = store.hook()
      useEffect (() => {
        onChange ({ result })
      }, [ result ])
      return null
    }
    finally {
      cleanup()
    }
  }
  
  const Fallback: ComponentType <{}> = () => {
    useEffect (() => {
      const thrown = new Promise <void> ((resolve, reject) => {
        let prevOnChange = onChange
        onChange = (snapshot) => {
          try {
            onChange = prevOnChange
            resolve ()
            prevOnChange (snapshot)
          } catch (err) {
            reject (err)
          }
        }
      })

      params.onChange ({
        thrown,
      })
    }, [])

    return null
  }
  
  class Renderer extends PureComponent {
    static displayName = ""

    componentDidCatch (thrown: any) {
      onChange ({ thrown })
    }
  
    render () {
      return (
        <Suspense fallback={<Fallback />}>
          <HookRenderer />
        </Suspense>
      )
    }
  }

  function setLabel (label: string) {
    HookRenderer.displayName = label
    Fallback.displayName = `withSuspense(${label})`
    Renderer.displayName = `withRenderer(${label})`
  }

  setLabel ("UnknownStore")
  return Renderer
}
