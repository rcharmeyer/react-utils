import { ComponentType, PureComponent, Suspense, useEffect, useInsertionEffect, useRef } from "react"
import { setDebugLabelListener } from "../debug-label"

import { Snapshot, Store } from "./types"
import { useInitial } from "../hooks"

export type RendererParams = {
  store: Store <any>,
  onChange: (snapshot: Snapshot) => void,
}

export function createRenderer (params: RendererParams) {
  const { store } = params
  let onChange = params.onChange

  const HookRenderer: ComponentType <{}> = () => {
    // const cleanup = setDebugLabelListener (setLabel)

    const result = store.hook()
    onChange ({ result })
    /*
    useEffect (() => {
      onChange ({ result })
    }, [ result ])
    */
    return null
  }
  
  const Fallback: ComponentType <{}> = () => {
    const onMount = () => {
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
    }

    useInitial (() => {
      onMount ()
    })

    /*
    useEffect (() => {
      onMount ()
    }, [])
    */

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

  setLabel (store.displayName ?? "UnknownStore")
  return Renderer
}
