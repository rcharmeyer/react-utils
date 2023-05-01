import { memoize } from "lodash-es"
import { createContext, memo, PropsWithChildren, Suspense, useInsertionEffect, useReducer } from "react"

import { useInitial } from "../hooks"

import { createInternalListStore, createInternalStore, useInternalStore } from "./internal-store"
import { RendererParams, createRenderer } from "./renderer"
import { ScopeProvider } from "./scopes-context"
import { InternalStore, Scope, Snapshot, Store, StoreBuilder } from "./types"
import { reactPromise } from "../async/read-promise"

export function createScope () {
  // TODO: does Context.Provider need to be memoized?
  const InternalContext = createContext <StoreBuilder> (undefined as any)

  const scope: Partial<Scope> = memo ((props: PropsWithChildren) => {
    const rendererListStore = useInitial (() => {
      return createInternalListStore <RendererParams> ()
    })

    const getStore = useInitial (() => memoize ((store: Store <any>) => {
      if (!store.hook) throw new Error ("hook not found")

      const thrown = new Error ("never")
      const hookStore = createInternalStore <Snapshot> ({ thrown })

      return reactPromise (new Promise <InternalStore <Snapshot>> ((resolve, reject) => {
        try {
          let initialized = false
          hookStore.subscribe (() => {
            if (initialized) return
            initialized = true
            resolve (hookStore)
          })

          rendererListStore.add ({
            store,
            onChange: hookStore.write,
          })
        } catch (e) {
          reject (e)
        }
      }))
    }))

    const rendererOf = useInitial (() => memoize (createRenderer))

    const renderers = useInternalStore (rendererListStore)

    const renderedStores = renderers.map ((params, i) => {
      const Renderer = rendererOf (params)
      return <Renderer key={i} />
    })

    return (
      <InternalContext.Provider value={getStore}>
        <ScopeProvider scope={scope as Scope}>
          <Suspense>
            {props.children}
          </Suspense>
          {renderedStores}
        </ScopeProvider>
      </InternalContext.Provider>
    )
  })

  Object.defineProperty (scope, "Context", {
    get () {
      return InternalContext
    }
  })

  let displayName = "UnknownScope"

  Object.defineProperty (scope, "displayName", {
    get () {
      return displayName
    },
    set (name) {
      displayName = name
      InternalContext.displayName = `${name}.Context`
    }
  })

  return scope as Scope
}
