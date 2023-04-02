import { ComponentType, PureComponent } from "react"
import { setDebugLabelListener } from "../debug-label"

import { Snapshot } from "./types"

export type RendererParams = {
  hook: () => any,
  onChange: (snapshot: Snapshot) => void,
}

export function createRenderer ({ hook, onChange }: RendererParams) {
  const HookRenderer: ComponentType <{}> = () => {
    const cleanup = setDebugLabelListener (setLabel)

    try {
      const result = hook()
      onChange ({ result })
      return null
    }
    finally {
      cleanup()
    }
  }
  
  class Renderer extends PureComponent {
    static displayName = ""

    componentDidCatch (thrown: any) {
      onChange ({ thrown })
    }
  
    render () {
      return <HookRenderer />
    }
  }

  function setLabel (label: string) {
    HookRenderer.displayName = label
    Renderer.displayName = `withRenderer(${label})`
  }

  setLabel ("UnknownStore")
  return Renderer
}
